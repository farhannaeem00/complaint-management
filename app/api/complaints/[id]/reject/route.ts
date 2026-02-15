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
    if (user.role !== 'TECHNICIAN') return forbiddenResponse('Only technicians can reject complaints');

    const { reason } = await request.json();

    if (!reason) {
      return errorResponse('Rejection reason required', 400);
    }

    const complaint = await db.complaint.findUnique({
      where: { id: (await params).id },
    });

    if (!complaint) {
      return notFoundResponse('Complaint not found');
    }

    if (complaint.technicianId !== user.id) {
      return forbiddenResponse('You can only reject complaints assigned to you');
    }

    const updatedComplaint = await db.complaint.update({
      where: { id: (await params).id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        technicianId: null,
      },
      include: {
        category: true,
        student: {
          select: { id: true, name: true, email: true }
        },
      },
    });

    await createActivityLog(
      complaint.id,
      user.id,
      'COMPLAINT_REJECTED',
      `Rejected by ${user.name}. Reason: ${reason}`
    );

    await notifyAdmins(
      'Complaint Rejected',
      `${user.name} rejected complaint: ${complaint.title}`,
      'REJECTED'
    );

    return successResponse({ complaint: updatedComplaint }, 'Complaint rejected');
  } catch (error) {
    console.error('Reject complaint error:', error);
    return errorResponse('Failed to reject complaint', 500);
  }
}
