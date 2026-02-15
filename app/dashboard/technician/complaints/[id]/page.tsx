'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { StatusBadge } from '@/components/status-badge';
import { Timeline } from '@/components/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle, Play, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function TechnicianComplaintDetailPage() {
  const { isAuthenticated, user, loading, complaints, acceptComplaint, rejectComplaint, resolveComplaint } = useApp();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const complaintId = params.id as string;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const complaint = complaints.find((c) => c.id === complaintId);

  if (!complaint) {
    return (
      <div className="flex h-screen bg-slate-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar title="Task Details" />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600 mb-4">Task not found or not assigned to you</p>
                <Link href="/dashboard/technician/assigned">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Back to Tasks</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const isOverdue = complaint.deadline && new Date(complaint.deadline) < new Date() && complaint.status !== 'resolved' && complaint.status !== 'closed';

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptComplaint(complaintId);
      toast({ title: 'Task Accepted', description: 'You have started working on this task.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to accept task', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({ title: 'Error', description: 'Please provide a reason for rejection', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      await rejectComplaint(complaintId, rejectReason);
      toast({ title: 'Task Rejected', description: 'Admin will reassign this task.' });
      setShowRejectModal(false);
      router.push('/dashboard/technician/assigned');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to reject task', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try {
      await resolveComplaint(complaintId);
      toast({ title: 'Task Resolved', description: 'The complaint has been marked as resolved.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to resolve task', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Task Details" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard/technician/assigned">
              <Button variant="outline" className="mb-6 flex items-center gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back to Tasks
              </Button>
            </Link>

            {isOverdue && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Overdue Task</p>
                  <p className="text-sm text-red-700">This task has passed its deadline. Please complete it as soon as possible.</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-2">Task ID: {complaint.id.slice(0, 8)}...</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-700">{complaint.description}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Category</p>
                      <p className="text-sm text-slate-900 capitalize">{complaint.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Department</p>
                      <p className="text-sm text-slate-900">{complaint.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Priority</p>
                      <p className={`text-sm font-semibold capitalize ${
                        complaint.priority === 'high' ? 'text-red-600' : complaint.priority === 'medium' ? 'text-amber-600' : 'text-green-600'
                      }`}>{complaint.priority}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Deadline</p>
                      <p className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-900'}`}>
                        {complaint.deadline ? new Date(complaint.deadline).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-600 font-medium mb-1">Student</p>
                    <p className="text-sm text-slate-900">{complaint.studentName}</p>
                  </div>
                </CardContent>
              </Card>

              {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {complaint.status === 'assigned' && (
                        <>
                          <Button
                            onClick={handleAccept}
                            disabled={actionLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            {actionLoading ? 'Processing...' : 'Accept & Start Work'}
                          </Button>
                          <Button
                            onClick={() => setShowRejectModal(true)}
                            disabled={actionLoading}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Task
                          </Button>
                        </>
                      )}
                      {complaint.status === 'in-progress' && (
                        <Button
                          onClick={handleResolve}
                          disabled={actionLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {actionLoading ? 'Processing...' : 'Mark as Resolved'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(complaint.status === 'resolved' || complaint.status === 'closed') && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-emerald-900">Task Completed</p>
                        <p className="text-sm text-emerald-700">This task has been successfully resolved.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline events={complaint.timeline} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">Please provide a reason for rejecting this task.</p>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
              <div className="flex gap-4">
                <Button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
