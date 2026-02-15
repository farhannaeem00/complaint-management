import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({ user }, 'User retrieved');
  } catch (error) {
    console.error('Get user error:', error);
    return unauthorizedResponse();
  }
}
