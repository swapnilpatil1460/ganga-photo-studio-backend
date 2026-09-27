import cron, { ScheduledTask } from 'node-cron';
import { BackupSettings } from '../models/BackupSettings';
import { runBackup } from './backup.service';

let currentTask: ScheduledTask | null = null;

function buildCronExpr(time: string, frequency: 'daily' | 'weekly', weekDay: number): string {
  const parts = (time || '02:00').split(':').map(Number);
  const hh = isNaN(parts[0]) ? 2 : Math.min(23, Math.max(0, parts[0]));
  const mm = isNaN(parts[1]) ? 0 : Math.min(59, Math.max(0, parts[1]));

  if (frequency === 'daily') {
    return `${mm} ${hh} * * *`;
  }
  // weekly: run on specific weekday (0=Sunday ... 6=Saturday)
  const day = (weekDay >= 0 && weekDay <= 6) ? weekDay : 0;
  return `${mm} ${hh} * * ${day}`;
}

export async function startScheduler(): Promise<void> {
  try {
    const settings = await BackupSettings.findOne();

    if (!settings || !settings.enabled) {
      console.log('[Backup Scheduler] Not active — automated backups are disabled in settings.');
      return;
    }

    const expr = buildCronExpr(settings.backupTime, settings.frequency, settings.weekDay);

    if (!cron.validate(expr)) {
      console.error(`[Backup Scheduler] Invalid cron expression: "${expr}"`);
      return;
    }

    stopScheduler();

    currentTask = cron.schedule(expr, async () => {
      console.log(`[Backup Scheduler] Scheduled ${settings.frequency} backup started at ${new Date().toISOString()}`);
      try {
        await runBackup('scheduled', 'Automated Scheduler');
        console.log('[Backup Scheduler] Scheduled backup completed successfully.');
      } catch (err) {
        console.error('[Backup Scheduler] Scheduled backup encountered an error:', err);
      }
    }, { timezone: 'Asia/Kolkata' });

    console.log(`[Backup Scheduler] Running — cron: "${expr}" (${settings.frequency}, Asia/Kolkata timezone)`);
  } catch (err) {
    console.error('[Backup Scheduler] Error starting scheduler:', err);
  }
}

export function stopScheduler(): void {
  if (currentTask) {
    currentTask.stop();
    currentTask = null;
    console.log('[Backup Scheduler] Stopped.');
  }
}

export async function reschedule(): Promise<void> {
  stopScheduler();
  await startScheduler();
}
