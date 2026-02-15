'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline } from '@/components/timeline';
import { StatusBadge } from '@/components/status-badge';
import { useApp } from '@/lib/context';
import { ArrowLeft, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user, loading, complaints, technicians, assignComplaint, verifyComplaint } = useApp();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [deadline, setDeadline] = useState('');

  const complaint = complaints.find((c) => c.id === params.id);

  useEffect(() => {
    if (complaint) {
      setSelectedTechnician(complaint.assignedTechnicianId || '');
      setDeadline(complaint.deadline ? complaint.deadline.split('T')[0] : '');
    }
  }, [complaint?.id]);

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

  if (!complaint) {
    return (
      <div className="flex h-screen bg-slate-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar title="Complaint Details" />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600 mb-4">Complaint not found</p>
                <Link href="/dashboard/admin/complaints">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Back to Complaints</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const isOverdue = complaint.deadline && new Date(complaint.deadline) < new Date() && complaint.status !== 'resolved' && complaint.status !== 'closed';

  const handleAssign = async () => {
    if (!selectedTechnician) {
      toast({ title: 'Error', description: 'Please select a technician', variant: 'destructive' });
      return;
    }
    if (!deadline) {
      toast({ title: 'Error', description: 'Please set a deadline', variant: 'destructive' });
      return;
    }

    setActionLoading(true);
    try {
      await assignComplaint(complaint.id, selectedTechnician, new Date(deadline).toISOString());
      toast({ title: 'Success', description: 'Technician assigned successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to assign', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await verifyComplaint(complaint.id);
      toast({ title: 'Success', description: 'Complaint verified and closed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to verify', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Complaint Details" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard/admin/complaints">
              <Button variant="outline" className="mb-6 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Complaints
              </Button>
            </Link>

            {isOverdue && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Overdue Complaint</p>
                  <p className="text-sm text-red-700">This complaint has passed its deadline.</p>
                </div>
              </div>
            )}

            {complaint.rejectionReason && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Task Rejected by Technician</p>
                  <p className="text-sm text-amber-700">Reason: {complaint.rejectionReason}</p>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{complaint.title}</CardTitle>
                      <p className="text-slate-600">ID: {complaint.id.slice(0, 8)}...</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Student Name</p>
                      <p className="font-semibold text-slate-900">{complaint.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Category</p>
                      <p className="font-semibold text-slate-900 capitalize">{complaint.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Department</p>
                      <p className="font-semibold text-slate-900">{complaint.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Priority</p>
                      <p className={`font-semibold ${
                        complaint.priority === 'high' ? 'text-red-600'
                          : complaint.priority === 'medium' ? 'text-amber-600'
                            : 'text-green-600'
                      }`}>
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Description</p>
                    <p className="text-slate-900 leading-relaxed">{complaint.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Technician Assignment - only show for pending/rejected complaints */}
              {(complaint.status === 'pending' || complaint.status === 'rejected') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Assign Technician
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Select Technician</label>
                        <select
                          value={selectedTechnician}
                          onChange={(e) => setSelectedTechnician(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Choose a technician...</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name} - {tech.department}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">Set Deadline</label>
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAssign}
                      disabled={actionLoading || !selectedTechnician || !deadline}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {actionLoading ? 'Assigning...' : 'Assign Technician'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Show current assignment for non-pending complaints */}
              {complaint.assignedTechnicianName && complaint.status !== 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assigned Technician</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>Name:</strong> {complaint.assignedTechnicianName}</p>
                    {complaint.deadline && (
                      <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                        <strong>Deadline:</strong> {new Date(complaint.deadline).toLocaleDateString()}
                        {isOverdue ? ' (OVERDUE)' : ''}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Verify & Close - only for resolved complaints not yet verified */}
              {complaint.status === 'resolved' && !complaint.adminVerification && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Verify & Close
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-emerald-800 mb-4">
                      The technician has marked this complaint as resolved. Verify and close it to allow the student to submit feedback.
                    </p>
                    <Button
                      onClick={handleVerify}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {actionLoading ? 'Verifying...' : 'Verify & Close Complaint'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline events={complaint.timeline} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
