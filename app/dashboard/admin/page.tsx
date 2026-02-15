'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/context';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { isAuthenticated, user, loading, complaints, dashboardStats } = useApp();
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

  const pending = dashboardStats.pendingComplaints ?? 0;
  const inProgress = dashboardStats.inProgressComplaints ?? 0;
  const resolved = dashboardStats.resolvedComplaints ?? 0;
  const total = dashboardStats.totalComplaints ?? complaints.length;

  // Category distribution from real complaints
  const categoryData = Object.entries(
    complaints.reduce(
      (acc, c) => {
        const cat = c.category || 'Unknown';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([name, value]) => ({ name, value }));

  // Status distribution
  const statusData = [
    { name: 'Pending', value: pending, fill: '#f59e0b' },
    { name: 'In Progress', value: inProgress, fill: '#3b82f6' },
    { name: 'Resolved', value: resolved, fill: '#10b981' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Admin Dashboard" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">System Overview & Management</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Complaints</p>
                      <p className="text-3xl font-bold text-slate-900">{total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Pending</p>
                      <p className="text-3xl font-bold text-amber-600">{pending}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600">{inProgress}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Resolved</p>
                      <p className="text-3xl font-bold text-emerald-600">{resolved}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Feedback</p>
                      <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalFeedbacks ?? 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Resolution Rate</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {total > 0 ? Math.round((resolved / total) * 100) : 0}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Complaints by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-600 py-8">No data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {total > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-600 py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manage Complaints</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">View and update complaint statuses</p>
                  <Link href="/dashboard/admin/complaints">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Go to Complaints</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">View Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">Review student feedback and suggestions</p>
                  <Link href="/dashboard/admin/feedback">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">View Feedback</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
