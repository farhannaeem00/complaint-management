import { db } from './db';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'NEW_COMPLAINT' | 'ASSIGNED' | 'REJECTED' | 'DEADLINE_MISSED' | 'RESOLVED' | 'VERIFIED'
) {
  try {
    await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function notifyAdmins(title: string, message: string, type: any) {
  const admins = await db.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  for (const admin of admins) {
    await createNotification(admin.id, title, message, type);
  }
}
