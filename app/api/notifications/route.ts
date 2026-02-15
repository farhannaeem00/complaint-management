import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: user.id,
        read: false,
      }
    });

    return successResponse({ notifications, unreadCount }, 'Notifications retrieved');
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}
