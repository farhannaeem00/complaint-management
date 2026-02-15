'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/lib/context';
import { AlertTriangle, Clock } from 'lucide-react';

export default function AdminComplaintsPage() {
  const { isAuthenticated, user, loading, complaints } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');

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

  const now = new Date();
  const overdueComplaints = complaints.filter((c) => c.deadline && new Date(c.deadline) < now && c.status !== 'resolved' && c.status !== 'closed');

  const filteredComplaints =
    filter === 'all'
      ? complaints
      : filter === 'overdue'
        ? overdueComplaints
        : complaints.filter((c) => c.status === filter);

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="All Complaints" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Complaints</h1>
                <p className="text-slate-600">Manage and respond to complaints</p>
              </div>
              {overdueComplaints.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{overdueComplaints.length} overdue</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {(['all', 'pending', 'assigned', 'in-progress', 'resolved', 'overdue'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? status === 'overdue'
                        ? 'bg-red-600 text-white'
                        : 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <Card>
              <CardContent className="pt-6">
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No complaints found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Student</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Title</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Category</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Priority</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Deadline</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.map((complaint) => (
                          <tr key={complaint.id} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="py-4 px-4">
                              <p className="font-medium text-slate-900">{complaint.studentName}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-slate-900 max-w-xs truncate">{complaint.title}</p>
                            </td>
                            <td className="py-4 px-4 text-slate-600">{complaint.category}</td>
                            <td className="py-4 px-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                complaint.priority === 'high' ? 'bg-red-100 text-red-700'
                                  : complaint.priority === 'medium' ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                              }`}>
                                {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                complaint.status === 'resolved' || complaint.status === 'closed' ? 'bg-emerald-100 text-emerald-700'
                                  : complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-700'
                                    : complaint.status === 'assigned' ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                              }`}>
                                {complaint.status === 'in-progress' ? 'In Progress' : complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-600">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              {complaint.deadline ? (
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                                  new Date(complaint.deadline) < now && complaint.status !== 'resolved' && complaint.status !== 'closed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {new Date(complaint.deadline) < now && complaint.status !== 'resolved' && complaint.status !== 'closed' ? (
                                    <AlertTriangle className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  {new Date(complaint.deadline).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Not set</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <Link href={`/dashboard/admin/complaints/${complaint.id}`}>
                                <Button variant="ghost" className="text-indigo-600 text-sm bg-transparent">View</Button>
                              </Link>
                            </td>
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
