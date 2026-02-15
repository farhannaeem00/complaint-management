'use client';

import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/context';
import { Users, UserCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const { isAuthenticated, user, loading, dashboardStats, technicians } = useApp();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Users" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-indigo-600" />
                Users
              </h1>
              <p className="text-slate-600">View system users overview</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Students</p>
                      <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalStudents ?? 0}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-slate-600">Total Technicians</p>
                    <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalTechnicians ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-slate-600">Avg. Rating</p>
                    <p className="text-3xl font-bold text-amber-600">{dashboardStats.averageRating ?? 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technicians Table */}
            <Card>
              <CardHeader>
                <CardTitle>Technicians</CardTitle>
              </CardHeader>
              <CardContent>
                {technicians.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No technicians found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Email</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Department</th>
                        </tr>
                      </thead>
                      <tbody>
                        {technicians.map((tech) => (
                          <tr key={tech.id} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="py-4 px-4">
                              <p className="font-medium text-slate-900">{tech.name}</p>
                            </td>
                            <td className="py-4 px-4 text-slate-600">{tech.email}</td>
                            <td className="py-4 px-4 text-slate-600">{tech.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
