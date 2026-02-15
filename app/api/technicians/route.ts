import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return unauthorizedResponse();
    if (user.role !== 'ADMIN') return forbiddenResponse('Only admins can view technicians');

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    const whereClause: any = { role: 'TECHNICIAN' };
    if (department) {
      whereClause.department = department;
    }

    const technicians = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        _count: {
          select: {
            complaintsAssigned: {
              where: {
                status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    return successResponse({ technicians }, 'Technicians retrieved');
  } catch (error) {
    console.error('Get technicians error:', error);
    return errorResponse('Failed to fetch technicians', 500);
  }
}
