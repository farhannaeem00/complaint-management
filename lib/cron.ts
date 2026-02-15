import cron from 'node-cron';
import { db } from './db';
import { notifyAdmins } from './notifications';
import { createActivityLog } from './activity-log';

export function startEscalationCron() {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('[CRON] Checking for overdue complaints...');

      const overdueComplaints = await db.complaint.findMany({
        where: {
          status: {
            in: ['ASSIGNED', 'IN_PROGRESS']
          },
          deadline: {
            lt: new Date()
          }
        },
        include: {
          student: {
            select: { id: true, name: true }
          },
          technician: {
            select: { id: true, name: true }
          }
        }
      });

      console.log(`[CRON] Found ${overdueComplaints.length} overdue complaints`);

      for (const complaint of overdueComplaints) {
        // Update status to ESCALATED
        await db.complaint.update({
          where: { id: complaint.id },
          data: {
            status: 'ESCALATED',
            escalationLevel: complaint.escalationLevel + 1,
          }
        });

        // Create activity log
        await createActivityLog(
          complaint.id,
          complaint.studentId,
          'COMPLAINT_ESCALATED',
          `Complaint escalated due to missed deadline. Escalation level: ${complaint.escalationLevel + 1}`
        );

        // Notify admins
        await notifyAdmins(
          'Complaint Overdue',
          `Complaint "${complaint.title}" assigned to ${complaint.technician?.name || 'Unknown'} is overdue`,
          'DEADLINE_MISSED'
        );

        console.log(`[CRON] Escalated complaint: ${complaint.id}`);
      }

      console.log('[CRON] Escalation check completed');
    } catch (error) {
      console.error('[CRON] Error in escalation job:', error);
    }
  });

  console.log('Escalation cron job started (runs every 10 minutes)');
}
