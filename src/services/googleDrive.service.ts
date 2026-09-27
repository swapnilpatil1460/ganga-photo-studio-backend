import { google } from 'googleapis';
import { Readable } from 'stream';

export function extractFolderId(linkOrId?: string): string | undefined {
  if (!linkOrId || typeof linkOrId !== 'string') return undefined;
  const trimmed = linkOrId.trim();
  if (!trimmed) return undefined;

  // Pattern 1: https://drive.google.com/drive/folders/FOLDER_ID or drive/u/1/folders/FOLDER_ID
  const matchFolders = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolders && matchFolders[1]) return matchFolders[1];

  // Pattern 2: id=FOLDER_ID
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 3: direct folder ID (alphanumeric, dashes, underscores, typically 25-45 chars)
  if (/^[a-zA-Z0-9_-]{15,60}$/.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}

export function isOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'placeholder' &&
    process.env.GOOGLE_CLIENT_SECRET !== 'placeholder'
  );
}

function createOAuthClient() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
    (process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}/api/backup/auth/callback` : 'http://localhost:5000/api/backup/auth/callback');

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export function getAuthUrl(): string {
  if (!isOAuthConfigured()) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) are not configured on this server yet.');
  }

  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
  });
}

export async function exchangeCode(code: string): Promise<{ refreshToken: string; email: string }> {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error('Google Drive did not return a refresh token. Please revoke app access in your Google Account security settings and reconnect.');
  }
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const info = await oauth2.userinfo.get();
  const email = info.data.email || 'unknown';

  return { refreshToken: tokens.refresh_token, email };
}

export function getClient(refreshToken: string) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export async function uploadToDrive(
  refreshToken: string,
  dataBuffer: Buffer,
  filename: string,
  targetFolderId?: string
): Promise<{ fileId: string; webViewLink?: string }> {
  const auth = getClient(refreshToken);
  const drive = google.drive({ version: 'v3', auth });

  const parents: string[] = [];
  if (targetFolderId) {
    parents.push(targetFolderId);
  }

  const stream = Readable.from(dataBuffer);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: parents.length > 0 ? parents : undefined,
    },
    media: {
      mimeType: 'application/octet-stream',
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink',
  });

  return {
    fileId: res.data.id || '',
    webViewLink: res.data.webViewLink || undefined,
  };
}
