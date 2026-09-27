import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { restoreFromFile } from '../services/backup.service';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx ts-node src/scripts/restore-backup.ts <path-to-backup.gz.enc> [--target-db <mongodb-uri>]

Examples:
  npx ts-node src/scripts/restore-backup.ts ./backups/Ganga-Backup-2026-09-27.gz.enc
  npx ts-node src/scripts/restore-backup.ts ./backups/Ganga-Backup-2026-09-27.gz.enc --target-db mongodb://localhost:27017/ganga-studio
`);
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  let targetDbUri: string | undefined;

  const targetIdx = args.indexOf('--target-db');
  if (targetIdx !== -1 && args[targetIdx + 1]) {
    targetDbUri = args[targetIdx + 1];
  } else {
    targetDbUri = process.env.MONGODB_URI;
  }

  console.log(`[Restore] Target database: ${targetDbUri?.replace(/:([^:@]+)@/, ':****@')}`);
  console.log(`[Restore] Reading encrypted archive: ${filePath}`);

  try {
    const start = Date.now();
    const result = await restoreFromFile(filePath, targetDbUri);
    const duration = ((Date.now() - start) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('✅ BACKUP RESTORATION COMPLETED');
    console.log(`⏱️ Duration: ${duration}s`);
    console.log('----------------------------------------');
    for (const [col, count] of Object.entries(result.restoredCollections)) {
      console.log(` - ${col.padEnd(25)} : ${count} documents`);
    }
    console.log('========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ RESTORE FAILED:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
