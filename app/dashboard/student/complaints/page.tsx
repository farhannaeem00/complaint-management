'use client';

import { useState } from 'react';
import { useApp, type ComplaintStatus } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ComplaintCard } from '@/components/complaint-card';

export default function ComplaintsListPage() {
  const { isAuthenticated, user, loading, complaints } = useApp();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');

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

  const filteredComplaints = filterStatus === 'all' ? complaints : complaints.filter((c) => c.status === filterStatus);

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="My Complaints" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
              <span className="text-sm text-slate-600">{filteredComplaints.length} complaint(s)</span>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {['all', 'pending', 'assigned', 'in-progress', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600 mb-4">No complaints found</p>
                {filterStatus === 'all' && (
                  <a href="/dashboard/student/complaint/new" className="text-indigo-600 hover:underline">
                    Submit your first complaint
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    href={`/dashboard/student/complaints/${complaint.id}`}
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
