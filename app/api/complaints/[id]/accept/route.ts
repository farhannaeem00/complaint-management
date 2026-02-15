import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import { createActivityLog } from '@/lib/activity-log';
import { notifyAdmins } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'TECHNICIAN') return forbiddenResponse('Only technicians can accept complaints');

    const complaint = await db.complaint.findUnique({
      where: { id: (await params).id },
    });

    if (!complaint) {
      return notFoundResponse('Complaint not found');
    }

    if (complaint.technicianId !== user.id) {
      return forbiddenResponse('You can only accept complaints assigned to you');
    }

    if (complaint.status !== 'ASSIGNED') {
      return errorResponse(`Cannot accept complaint in ${complaint.status} status`, 400);
    }

    const updatedComplaint = await db.complaint.update({
      where: { id: (await params).id },
      data: { status: 'IN_PROGRESS' },
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
      'COMPLAINT_ACCEPTED',
      `Complaint accepted by ${user.name}`
    );

    await notifyAdmins(
      'Complaint Accepted',
      `${user.name} accepted complaint: ${complaint.title}`,
      'ASSIGNED'
    );

    return successResponse({ complaint: updatedComplaint }, 'Complaint accepted successfully');
  } catch (error) {
    console.error('Accept complaint error:', error);
    return errorResponse('Failed to accept complaint', 500);
  }
}
