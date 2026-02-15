import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import { createActivityLog } from '@/lib/activity-log';
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'ADMIN') return forbiddenResponse('Only admins can verify complaints');

    const complaint = await db.complaint.findUnique({
      where: { id: (await params).id },
      include: {
        student: true,
      }
    });

    if (!complaint) {
      return notFoundResponse('Complaint not found');
    }

    if (complaint.status !== 'RESOLVED') {
      return errorResponse('Can only verify resolved complaints', 400);
    }

    const updatedComplaint = await db.complaint.update({
      where: { id: (await params).id },
      data: {
        status: 'CLOSED',
        adminVerification: true,
      },
      include: {
        category: true,
        student: {
          select: { id: true, name: true, email: true }
        },
        technician: {
          select: { id: true, name: true, email: true }
        },
      },
    });

    await createActivityLog(
      complaint.id,
      user.id,
      'COMPLAINT_VERIFIED',
      `Verified and closed by ${user.name}`
    );

    // Notify student
    await createNotification(
      complaint.studentId,
      'Complaint Verified',
      `Your complaint "${complaint.title}" has been verified. You can now submit feedback.`,
      'VERIFIED'
    );

    return successResponse({ complaint: updatedComplaint }, 'Complaint verified and closed');
  } catch (error) {
    console.error('Verify complaint error:', error);
    return errorResponse('Failed to verify complaint', 500);
  }
}
