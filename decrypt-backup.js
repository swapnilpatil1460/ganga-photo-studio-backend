#!/usr/bin/env node
/**
 * Ganga Photo Studio - Standalone Backup Decryptor
 * 
 * Zero dependencies! Uses only native Node.js crypto, zlib, and fs.
 * Decrypts .gz.enc backups created by the Ganga Studio ERP system into readable JSON.
 * 
 * Usage:
 *   node decrypt-backup.js <file.gz.enc> [--key <secret-key>] [--out <output.json>]
 * 
 * Examples:
 *   node decrypt-backup.js ./backups/Ganga-Backup-2026-09-27.gz.enc
 *   node decrypt-backup.js ./backups/Ganga-Backup-2026-09-27.gz.enc --key mySecretKey
 *   node decrypt-backup.js ./backups/Ganga-Backup-2026-09-27.gz.enc --out ./restored-data.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

// Try loading .env if available
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch (_) {}

function printHelp() {
  console.log(`
Ganga Photo Studio ERP - Backup Decryption Tool
------------------------------------------------
Decrypts AES-256-GCM encrypted backup archives (.gz.enc) into readable JSON.

Usage:
  node decrypt-backup.js <path-to-backup.gz.enc> [options]

Options:
  --key <secret>      Encryption key or secret passphrase.
                      Defaults to BACKUP_ENCRYPTION_KEY, ENCRYPTION_KEY, or JWT_SECRET from .env
  --out <file.json>   Output path for the decrypted JSON file.
                      Defaults to <original-filename>.json
  --help, -h          Show this help message.

Examples:
  node decrypt-backup.js Ganga-Backup-2026-09-27.gz.enc
  node decrypt-backup.js Ganga-Backup-2026-09-27.gz.enc --key mySecretKey32Chars
  node decrypt-backup.js Ganga-Backup-2026-09-27.gz.enc --out ./decrypted-data.json
`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const inputFile = args.find(a => !a.startsWith('--'));
  if (!inputFile) {
    console.error('Error: Please provide the path to the backup file (.gz.enc).');
    process.exit(1);
  }

  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Backup file not found at: ${inputPath}`);
    process.exit(1);
  }

  // Key resolution
  let secretKey;
  const keyIdx = args.indexOf('--key');
  if (keyIdx !== -1 && args[keyIdx + 1]) {
    secretKey = args[keyIdx + 1];
  } else {
    secretKey = process.env.BACKUP_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'ganga_photo_studio_secure_backup_key_fallback';
  }

  // Output file resolution
  let outputPath;
  const outIdx = args.indexOf('--out');
  if (outIdx !== -1 && args[outIdx + 1]) {
    outputPath = path.resolve(args[outIdx + 1]);
  } else {
    const parsed = path.parse(inputPath);
    const baseName = parsed.name.replace(/\.gz$/, '');
    outputPath = path.join(parsed.dir, `${baseName}.json`);
  }

  console.log('====================================================');
  console.log('  GANGA PHOTO STUDIO - BACKUP DECRYPTION');
  console.log('====================================================');
  console.log(`* Reading:   ${inputPath}`);
  console.log(`* Output to: ${outputPath}`);

  try {
    const rawData = fs.readFileSync(inputPath);
    if (rawData.length < 32) {
      throw new Error('File is too short to be a valid AES-256-GCM encrypted backup archive.');
    }

    // 1. Derive 32-byte key via SHA-256
    const key = crypto.createHash('sha256').update(secretKey).digest();

    // 2. Extract IV (16 bytes), Auth Tag (16 bytes), and Ciphertext
    const iv = rawData.subarray(0, 16);
    const authTag = rawData.subarray(16, 32);
    const ciphertext = rawData.subarray(32);

    // 3. Decrypt AES-256-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decryptedGzip = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    // 4. Decompress gzip
    const decompressedJson = zlib.gunzipSync(decryptedGzip);

    // 5. Parse and inspect collections
    const snapshot = JSON.parse(decompressedJson.toString('utf8'));
    
    // 6. Write decrypted JSON to output
    fs.writeFileSync(outputPath, decompressedJson);

    const inputSize = formatBytes(rawData.length);
    const outputSize = formatBytes(decompressedJson.length);

    console.log('----------------------------------------------------');
    console.log('  SUCCESSFULLY DECRYPTED & EXTRACTED');
    console.log('----------------------------------------------------');
    console.log(`  Encrypted Size:  ${inputSize}`);
    console.log(`  Decrypted Size:  ${outputSize}`);
    console.log('');
    console.log('  Collections found in backup:');
    let totalDocs = 0;
    for (const [colName, docs] of Object.entries(snapshot)) {
      if (Array.isArray(docs)) {
        console.log(`    * ${colName.padEnd(20)} : ${docs.length} documents`);
        totalDocs += docs.length;
      }
    }
    console.log('----------------------------------------------------');
    console.log(`  Total Documents: ${totalDocs}`);
    console.log(`  Output File:     ${outputPath}`);
    console.log('====================================================\n');
    console.log('Tip: You can open this .json file directly in VS Code,');
    console.log('     or import it into MongoDB using mongoimport or MongoDB Compass.\n');
  } catch (err) {
    console.error('\nDECRYPTION FAILED:');
    if (err.message && err.message.includes('Unsupported state or unable to authenticate data')) {
      console.error('  Authentication Tag Verification Failed.');
      console.error('  This usually means the ENCRYPTION KEY or JWT_SECRET is incorrect,');
      console.error('  or the backup file has been corrupted or tampered with.\n');
      console.error('  Make sure you provide the exact secret key used when creating the backup:');
      console.error('    node decrypt-backup.js <file> --key "<your-exact-secret-key>"\n');
    } else {
      console.error(' ', err.message || err);
    }
    process.exit(1);
  }
}

main();
