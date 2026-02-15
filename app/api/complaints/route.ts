import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { createActivityLog } from '@/lib/activity-log';
import { notifyAdmins } from '@/lib/notifications';

// GET - Fetch complaints based on role
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();

    let complaints;

    if (user.role === 'STUDENT') {
      complaints = await db.complaint.findMany({
        where: { studentId: user.id },
        include: {
          category: true,
          student: {
            select: { id: true, name: true, email: true, studentId: true }
          },
          technician: {
            select: { id: true, name: true, email: true, department: true }
          },
          feedbacks: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'TECHNICIAN') {
      complaints = await db.complaint.findMany({
        where: { technicianId: user.id },
        include: {
          category: true,
          student: {
            select: { id: true, name: true, email: true, studentId: true }
          },
          technician: {
            select: { id: true, name: true, email: true, department: true }
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      complaints = await db.complaint.findMany({
        include: {
          category: true,
          student: {
            select: { id: true, name: true, email: true, studentId: true }
          },
          technician: {
            select: { id: true, name: true, email: true, department: true }
          },
          feedbacks: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return successResponse({ complaints }, 'Complaints retrieved');
  } catch (error) {
    console.error('Get complaints error:', error);
    return errorResponse('Failed to fetch complaints', 500);
  }
}

// POST - Create new complaint (STUDENT only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'STUDENT') return forbiddenResponse('Only students can create complaints');

    const { title, description, categoryId, department, priority } = await request.json();

    if (!title || !description || !categoryId || !department) {
      return errorResponse('All fields required', 400);
    }

    const complaint = await db.complaint.create({
      data: {
        title,
        description,
        categoryId,
        department,
        priority: priority || 'MEDIUM',
        studentId: user.id,
        status: 'PENDING',
      },
      include: {
        category: true,
        student: {
          select: { id: true, name: true, email: true, studentId: true }
        },
      },
    });

    // Create activity log
    await createActivityLog(
      complaint.id,
      user.id,
      'COMPLAINT_CREATED',
      `Complaint created: ${title}`
    );

    // Notify admins
    await notifyAdmins(
      'New Complaint',
      `New complaint submitted by ${user.name}: ${title}`,
      'NEW_COMPLAINT'
    );

    return successResponse({ complaint }, 'Complaint created successfully', 201);
  } catch (error) {
    console.error('Create complaint error:', error);
    return errorResponse('Failed to create complaint', 500);
  }
}
