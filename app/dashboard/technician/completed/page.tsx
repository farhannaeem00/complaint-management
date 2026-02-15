'use client';

import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ComplaintCard } from '@/components/complaint-card';
import { CheckCircle } from 'lucide-react';

export default function TechnicianCompletedPage() {
  const { isAuthenticated, user, loading, complaints } = useApp();
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

  const completedComplaints = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed');

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Completed Tasks" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <h1 className="text-2xl font-bold text-slate-900">Completed Tasks</h1>
              </div>
              <span className="text-sm text-slate-600">{completedComplaints.length} task(s)</span>
            </div>

            {completedComplaints.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600">No completed tasks yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    href={`/dashboard/technician/complaints/${complaint.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
