import { db } from './db';

export async function createActivityLog(
  complaintId: string,
  userId: string,
  action: string,
  description: string
) {
  try {
    await db.activityLog.create({
      data: {
        complaintId,
        userId,
        action,
        description,
      },
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
}

export async function getComplaintActivityLogs(complaintId: string) {
  return await db.activityLog.findMany({
    where: { complaintId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
}
