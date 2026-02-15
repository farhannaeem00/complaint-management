'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/context';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Star } from 'lucide-react';

const FEEDBACK_TYPES = ['ACADEMIC', 'FACILITY', 'GENERAL'];

export default function FeedbackPage() {
  const { isAuthenticated, user, loading, complaints, submitFeedback } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    complaintId: '',
    feedbackType: 'GENERAL',
    message: '',
    rating: 5,
    anonymous: false,
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push('/login');
    return null;
  }

  // Only show resolved complaints that haven't had feedback yet
  const resolvedComplaints = complaints.filter(
    (c) => (c.status === 'resolved' || c.status === 'closed') && !c.feedbackSubmitted
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.complaintId) {
      toast({
        title: 'Error',
        description: 'Please select a complaint to provide feedback for',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your feedback',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({
        complaintId: formData.complaintId,
        feedbackType: formData.feedbackType,
        message: formData.message,
        rating: formData.rating,
        anonymous: formData.anonymous,
      });

      toast({
        title: 'Thank You!',
        description: 'Your feedback has been submitted successfully.',
      });

      setFormData({ complaintId: '', feedbackType: 'GENERAL', message: '', rating: 5, anonymous: false });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Share Your Feedback" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/dashboard/student">
              <Button variant="ghost" className="mb-6 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-indigo-600" />
                Share Your Feedback
              </h1>
              <p className="text-slate-600">Help us improve your experience</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                {resolvedComplaints.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-2">No resolved complaints available for feedback.</p>
                    <p className="text-sm text-slate-500">
                      Feedback can only be submitted for resolved complaints that have been verified by an admin.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Select Complaint *
                      </label>
                      <select
                        value={formData.complaintId}
                        onChange={(e) => setFormData({ ...formData, complaintId: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Choose a complaint...</option>
                        {resolvedComplaints.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Feedback Type *
                      </label>
                      <select
                        value={formData.feedbackType}
                        onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {FEEDBACK_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Rating *
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="p-1"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Your Feedback *
                      </label>
                      <Textarea
                        placeholder="Share your thoughts about the resolution..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={6}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={formData.anonymous}
                        onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="anonymous" className="cursor-pointer">
                        <span className="text-sm font-medium text-slate-900">Submit anonymously</span>
                        <p className="text-xs text-slate-600">{"Your name won't be visible to others"}</p>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
