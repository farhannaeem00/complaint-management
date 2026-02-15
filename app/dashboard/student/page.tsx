'use client';

import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { StatCard } from '@/components/stat-card';
import { ComplaintCard } from '@/components/complaint-card';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StudentDashboard() {
  const { isAuthenticated, user, loading, complaints, dashboardStats } = useApp();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    router.push('/login');
    return null;
  }

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Student Dashboard" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2 text-balance">Welcome back, {user?.name}!</h1>
              <p className="text-slate-600">Track your complaints and manage your submissions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                label="Total Complaints"
                value={dashboardStats.totalComplaints ?? complaints.length}
                icon={<FileText className="w-6 h-6" />}
                color="indigo"
              />
              <StatCard
                label="In Progress"
                value={dashboardStats.inProgressComplaints ?? 0}
                icon={<AlertCircle className="w-6 h-6" />}
                color="amber"
              />
              <StatCard
                label="Resolved"
                value={dashboardStats.resolvedComplaints ?? 0}
                icon={<CheckCircle className="w-6 h-6" />}
                color="emerald"
              />
            </div>

            <div className="mb-8">
              <Link href="/dashboard/student/complaint/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
                  Submit New Complaint
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Complaints</h2>
              {recentComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No complaints submitted yet</p>
                  <Link href="/dashboard/student/complaint/new">
                    <Button variant="outline" className="mt-4 bg-transparent">
                      Submit Your First Complaint
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      href={`/dashboard/student/complaints/${complaint.id}`}
                    />
                  ))}
                  {complaints.length > 5 && (
                    <Link href="/dashboard/student/complaints">
                      <Button variant="outline" className="w-full bg-transparent">
                        View All Complaints
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
