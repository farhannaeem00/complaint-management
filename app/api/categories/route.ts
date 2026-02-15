import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();

    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
    });

    return successResponse({ categories }, 'Categories retrieved');
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}
