'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/context';
import { MessageSquare, Star } from 'lucide-react';

export default function AdminFeedbackPage() {
  const { isAuthenticated, user, loading, feedbacks } = useApp();
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

  const filteredFeedback = filter === 'all'
    ? feedbacks
    : feedbacks.filter((f) => f.type === filter);

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Student Feedback" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-indigo-600" />
                Student Feedback
              </h1>
              <p className="text-slate-600">Review student feedback from resolved complaints</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-1">Total Feedback</p>
                  <p className="text-3xl font-bold text-slate-900">{feedbacks.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-1">Average Rating</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {feedbacks.length > 0
                      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
                      : 'N/A'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600 mb-1">Anonymous</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {feedbacks.filter((f) => f.anonymous).length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {(['all', 'academic', 'facility', 'general'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No feedback found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFeedback.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              fb.type === 'academic' ? 'bg-indigo-100 text-indigo-700'
                                : fb.type === 'facility' ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {fb.type.charAt(0).toUpperCase() + fb.type.slice(1)}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{fb.studentName}</p>
                              {fb.complaintTitle && (
                                <p className="text-xs text-slate-500">Re: {fb.complaintTitle}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {fb.rating && (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < fb.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-500">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <p className="text-slate-900 leading-relaxed">{fb.message}</p>
                        </div>
                      </div>
                    ))}
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
