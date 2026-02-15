'use client';

import { useApp } from '@/lib/context';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { StatusBadge } from '@/components/status-badge';
import { Timeline } from '@/components/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComplaintDetailPage() {
  const { isAuthenticated, user, loading, complaints } = useApp();
  const router = useRouter();
  const params = useParams();
  const complaintId = params.id as string;

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

  const complaint = complaints.find((c) => c.id === complaintId);

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
                <Link href="/dashboard/student/complaints">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Back to Complaints</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Complaint Details" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard/student/complaints">
              <Button variant="outline" className="mb-6 flex items-center gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back to Complaints
              </Button>
            </Link>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-2">Complaint ID: {complaint.id.slice(0, 8)}...</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
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
                      <p className="text-sm text-slate-900 capitalize">{complaint.priority}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Submitted</p>
                      <p className="text-sm text-slate-900">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {complaint.assignedTechnicianName && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assigned Technician</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><strong>Name:</strong> {complaint.assignedTechnicianName}</p>
                    {complaint.deadline && (
                      <p className="text-sm">
                        <strong>Deadline:</strong> {new Date(complaint.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {complaint.rejectionReason && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-amber-900">Rejection Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-800">{complaint.rejectionReason}</p>
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

              {complaint.status === 'resolved' && !complaint.feedbackSubmitted && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900">Provide Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-emerald-800 mb-4">
                      Your complaint has been resolved. We would appreciate your feedback on the resolution.
                    </p>
                    <Link href="/dashboard/student/feedback">
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        Give Feedback
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
