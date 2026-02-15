import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();

    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    if (notification.userId !== user.id) {
      return forbiddenResponse('You can only update your own notifications');
    }

    const updatedNotification = await db.notification.update({
      where: { id },
      data: { read: true },
    });

    return successResponse({ notification: updatedNotification }, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification read error:', error);
    return errorResponse('Failed to update notification', 500);
  }
}
