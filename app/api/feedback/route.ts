import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import { createActivityLog } from '@/lib/activity-log';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'STUDENT') return forbiddenResponse('Only students can submit feedback');

    const { complaintId, feedbackType, message, rating, anonymous } = await request.json();

    if (!complaintId || !feedbackType || !message || !rating) {
      return errorResponse('All fields required', 400);
    }

    if (rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    const complaint = await db.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return notFoundResponse('Complaint not found');
    }

    if (complaint.studentId !== user.id) {
      return forbiddenResponse('You can only give feedback on your own complaints');
    }

    if (complaint.status !== 'CLOSED' || !complaint.adminVerification) {
      return errorResponse('Can only give feedback on verified closed complaints', 400);
    }

    if (complaint.feedbackSubmitted) {
      return errorResponse('Feedback already submitted', 409);
    }

    const feedback = await db.feedback.create({
      data: {
        complaintId,
        feedbackType,
        message,
        rating,
        anonymous: anonymous || false,
      },
    });

    await db.complaint.update({
      where: { id: complaintId },
      data: { feedbackSubmitted: true },
    });

    await createActivityLog(
      complaintId,
      user.id,
      'FEEDBACK_SUBMITTED',
      `Feedback submitted with rating ${rating}/5`
    );

    return successResponse({ feedback }, 'Feedback submitted successfully', 201);
  } catch (error) {
    console.error('Submit feedback error:', error);
    return errorResponse('Failed to submit feedback', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'ADMIN') return forbiddenResponse('Only admins can view all feedback');

    const feedbacks = await db.feedback.findMany({
      include: {
        complaint: {
          select: {
            id: true,
            title: true,
            student: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ feedbacks }, 'Feedbacks retrieved');
  } catch (error) {
    console.error('Get feedbacks error:', error);
    return errorResponse('Failed to fetch feedbacks', 500);
  }
}
