'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

export default function SubmitComplaintPage() {
  const { isAuthenticated, user, loading, categories, submitComplaint } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    department: '',
    priority: 'MEDIUM',
    description: '',
  });

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

  // Auto-set department when category changes
  const handleCategoryChange = (categoryId: string) => {
    const selected = categories.find((c) => c.id === categoryId);
    setFormData({
      ...formData,
      categoryId,
      department: selected?.department || formData.department,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.categoryId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitComplaint({
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        department: formData.department,
        priority: formData.priority,
      });

      toast({
        title: 'Success',
        description: 'Your complaint has been submitted successfully',
      });

      router.push('/dashboard/student/complaints');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit complaint',
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
        <Navbar title="Submit Complaint" />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>File a New Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Complaint Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Brief title of your complaint"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Department
                      </label>
                      <Input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Auto-filled from category"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {priorities.map((pri) => (
                        <option key={pri} value={pri}>
                          {pri.charAt(0) + pri.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Provide detailed description of your complaint"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Be specific and provide as much detail as possible to help with resolution
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                    >
                      {submitting ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
