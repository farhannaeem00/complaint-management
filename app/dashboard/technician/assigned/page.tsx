'use client';

import { useState } from 'react';
import { useApp, type ComplaintStatus } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ComplaintCard } from '@/components/complaint-card';

export default function TechnicianAssignedPage() {
  const { isAuthenticated, user, loading, complaints } = useApp();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all' | 'overdue'>('all');

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
  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') {
      return c.deadline && new Date(c.deadline) < now && c.status !== 'resolved' && c.status !== 'closed';
    }
    return c.status === filterStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Assigned Tasks" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Assigned Tasks</h1>
              <span className="text-sm text-slate-600">{filteredComplaints.length} task(s)</span>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {['all', 'assigned', 'in-progress', 'resolved', 'overdue'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as typeof filterStatus)}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    filterStatus === status
                      ? status === 'overdue' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600">No tasks found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => {
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
        </main>
      </div>
    </div>
  );
}
