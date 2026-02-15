import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import { createActivityLog } from '@/lib/activity-log';
import { notifyAdmins, createNotification } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'TECHNICIAN') return forbiddenResponse('Only technicians can mark complaints complete');

    const complaint = await db.complaint.findUnique({
      where: { id: (await params).id },
      include: {
        student: true,
      }
    });

    if (!complaint) {
      return notFoundResponse('Complaint not found');
    }

    if (complaint.technicianId !== user.id) {
      return forbiddenResponse('You can only complete complaints assigned to you');
    }

    if (complaint.status !== 'IN_PROGRESS') {
      return errorResponse(`Cannot complete complaint in ${complaint.status} status`, 400);
    }

    const updatedComplaint = await db.complaint.update({
      where: { id: (await params).id },
      data: { status: 'RESOLVED' },
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
      'COMPLAINT_RESOLVED',
      `Marked as resolved by ${user.name}`
    );

    await notifyAdmins(
      'Complaint Resolved',
      `${user.name} resolved complaint: ${complaint.title}`,
      'RESOLVED'
    );

    // Notify student
    await createNotification(
      complaint.studentId,
      'Complaint Resolved',
      `Your complaint "${complaint.title}" has been resolved`,
      'RESOLVED'
    );

    return successResponse({ complaint: updatedComplaint }, 'Complaint marked as resolved');
  } catch (error) {
    console.error('Complete complaint error:', error);
    return errorResponse('Failed to complete complaint', 500);
  }
}
