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
    if (user.role !== 'ADMIN') return forbiddenResponse('Only admins can assign complaints');

    const { technicianId, deadline } = await request.json();

    if (!technicianId || !deadline) {
      return errorResponse('Technician and deadline required', 400);
    }

    const complaint = await db.complaint.findUnique({
      where: { id: (await params).id },
    });

    if (!complaint) {
      return notFoundResponse('Complaint not found');
    }

    // Verify technician exists
    const technician = await db.user.findUnique({
      where: { id: technicianId },
    });

    if (!technician || technician.role !== 'TECHNICIAN') {
      return errorResponse('Invalid technician', 400);
    }

    // Update complaint
    const updatedComplaint = await db.complaint.update({
      where: { id: (await params).id },
      data: {
        technicianId,
        deadline: new Date(deadline),
        status: 'ASSIGNED',
      },
      include: {
        category: true,
        student: {
          select: { id: true, name: true, email: true }
        },
        technician: {
          select: { id: true, name: true, email: true, department: true }
        },
      },
    });

    // Create activity log
    await createActivityLog(
      complaint.id,
      user.id,
      'COMPLAINT_ASSIGNED',
      `Assigned to ${technician.name}`
    );

    // Notify technician
    await createNotification(
      technicianId,
      'New Assignment',
      `You have been assigned complaint: ${complaint.title}`,
      'ASSIGNED'
    );

    return successResponse({ complaint: updatedComplaint }, 'Complaint assigned successfully');
  } catch (error) {
    console.error('Assign complaint error:', error);
    return errorResponse('Failed to assign complaint', 500);
  }
}
