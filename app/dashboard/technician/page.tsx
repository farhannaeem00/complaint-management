'use client';

import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { StatCard } from '@/components/stat-card';
import { ComplaintCard } from '@/components/complaint-card';
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TechnicianDashboard() {
  const { isAuthenticated, user, loading, complaints, dashboardStats } = useApp();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'technician') {
    router.push('/login');
    return null;
  }

  const now = new Date();
  const overdueCount = complaints.filter((c) => c.deadline && c.status !== 'resolved' && c.status !== 'closed' && new Date(c.deadline) < now).length;
  const activeComplaints = complaints.filter((c) => c.status !== 'resolved' && c.status !== 'closed').slice(0, 5);

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Technician Dashboard" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2 text-balance">Welcome, {user?.name}!</h1>
              <p className="text-slate-600">Manage your assigned tasks and track progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Assigned"
                value={dashboardStats.assignedComplaints ?? 0}
                icon={<ClipboardList className="w-6 h-6" />}
                color="indigo"
              />
              <StatCard
                label="In Progress"
                value={dashboardStats.inProgressComplaints ?? 0}
                icon={<Clock className="w-6 h-6" />}
                color="amber"
              />
              <StatCard
                label="Completed"
                value={dashboardStats.resolvedComplaints ?? 0}
                icon={<CheckCircle className="w-6 h-6" />}
                color="emerald"
              />
              <StatCard
                label="Overdue"
                value={dashboardStats.overdueComplaints ?? overdueCount}
                icon={<AlertTriangle className="w-6 h-6" />}
                color="red"
              />
            </div>

            {overdueCount > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Attention Required</p>
                  <p className="text-sm text-red-700">You have {overdueCount} overdue task(s) that need immediate attention.</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Active Tasks</h2>
                <Link href="/dashboard/technician/assigned">
                  <Button variant="outline" className="bg-transparent">View All</Button>
                </Link>
              </div>

              {activeComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No active tasks assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeComplaints.map((complaint) => {
                    const isOverdue = complaint.deadline && new Date(complaint.deadline) < now && complaint.status !== 'resolved';
                    return (
                      <div key={complaint.id} className={isOverdue ? 'ring-2 ring-red-300 rounded-lg' : ''}>
                        <ComplaintCard
                          complaint={complaint}
                          href={`/dashboard/technician/complaints/${complaint.id}`}
                          showDeadline
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
