import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();

    let stats: any = {};

    if (user.role === 'STUDENT') {
      const totalComplaints = await db.complaint.count({
        where: { studentId: user.id }
      });

      const pendingComplaints = await db.complaint.count({
        where: { studentId: user.id, status: 'PENDING' }
      });

      const inProgressComplaints = await db.complaint.count({
        where: {
          studentId: user.id,
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
        }
      });

      const resolvedComplaints = await db.complaint.count({
        where: { studentId: user.id, status: { in: ['RESOLVED', 'CLOSED'] } }
      });

      stats = {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
      };
    } else if (user.role === 'TECHNICIAN') {
      const assignedComplaints = await db.complaint.count({
        where: { technicianId: user.id, status: 'ASSIGNED' }
      });

      const inProgressComplaints = await db.complaint.count({
        where: { technicianId: user.id, status: 'IN_PROGRESS' }
      });

      const resolvedComplaints = await db.complaint.count({
        where: { technicianId: user.id, status: { in: ['RESOLVED', 'CLOSED'] } }
      });

      const overdueComplaints = await db.complaint.count({
        where: {
          technicianId: user.id,
          status: 'ESCALATED'
        }
      });

      stats = {
        assignedComplaints,
        inProgressComplaints,
        resolvedComplaints,
        overdueComplaints,
      };
    } else if (user.role === 'ADMIN') {
      const totalComplaints = await db.complaint.count();
      const pendingComplaints = await db.complaint.count({ where: { status: 'PENDING' } });
      const inProgressComplaints = await db.complaint.count({
        where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } }
      });
      const resolvedComplaints = await db.complaint.count({
        where: { status: { in: ['RESOLVED', 'CLOSED'] } }
      });
      const overdueComplaints = await db.complaint.count({ where: { status: 'ESCALATED' } });
      const rejectedComplaints = await db.complaint.count({ where: { status: 'REJECTED' } });

      const totalStudents = await db.user.count({ where: { role: 'STUDENT' } });
      const totalTechnicians = await db.user.count({ where: { role: 'TECHNICIAN' } });

      const feedbacks = await db.feedback.findMany({ select: { rating: true } });
      const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0';

      stats = {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        overdueComplaints,
        rejectedComplaints,
        totalStudents,
        totalTechnicians,
        averageRating,
        totalFeedbacks: feedbacks.length,
      };
    }

    return successResponse({ stats }, 'Statistics retrieved');
  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse('Failed to fetch statistics', 500);
  }
}
