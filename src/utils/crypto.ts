import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const IV_LENGTH = 16; // For AES, this is always 16

function getEncryptionKey(): Buffer {
  const rawKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
  return Buffer.from(rawKey.padEnd(32, '0').slice(0, 32));
}

export function encrypt(text: string): string {
  if (!text) return text;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text) return text;
  try {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift() as string, 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return 'Encrypted Password Unreadable';
  }
}
