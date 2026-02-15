import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-response';
import { getComplaintActivityLogs } from '@/lib/activity-log';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();

    const complaint = await db.complaint.findUnique({
      where: { id: (await params).id },
      include: {
        category: true,
        student: {
          select: { id: true, name: true, email: true, studentId: true, department: true }
        },
        technician: {
          select: { id: true, name: true, email: true, department: true }
        },
        feedbacks: {
          include: {
            complaint: {
              select: { id: true, title: true }
            }
          }
        },
      },
    });

    if (!complaint) {
      return notFoundResponse('Complaint not found');
    }

    // Check permissions
    if (user.role === 'STUDENT' && complaint.studentId !== user.id) {
      return forbiddenResponse('You can only view your own complaints');
    }

    if (user.role === 'TECHNICIAN' && complaint.technicianId !== user.id) {
      return forbiddenResponse('You can only view assigned complaints');
    }

    // Get activity logs
    const activityLogs = await getComplaintActivityLogs(complaint.id);

    return successResponse(
      { complaint, activityLogs },
      'Complaint retrieved'
    );
  } catch (error) {
    console.error('Get complaint error:', error);
    return errorResponse('Failed to fetch complaint', 500);
  }
}
