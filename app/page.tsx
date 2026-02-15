'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { isAuthenticated, user } = useApp();
  const router = useRouter();

  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      router.push('/dashboard/admin');
    } else if (user.role === 'technician') {
      router.push('/dashboard/technician');
    } else {
      router.push('/dashboard/student');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">SCFMS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          Smart Complaint & Feedback Management System
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Streamline your college's complaint handling process with real-time tracking, efficient assignment, and instant notifications.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              Get Started
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="px-8 bg-transparent">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Key Features</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Everything you need to manage complaints efficiently
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: 'Easy Complaint Filing',
                description: 'Students can submit complaints in just a few clicks with detailed descriptions.',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Efficient Assignment',
                description: 'Admins assign complaints to technicians with deadlines and tracking.',
              },
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: 'Progress Tracking',
                description: 'Complete visibility with timeline updates and real-time notifications.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Smart Notifications',
                description: 'Instant updates keep all stakeholders informed at every stage.',
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: 'Admin Analytics',
                description: 'Comprehensive statistics and complaint analytics dashboard.',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Fast Resolution',
                description: 'Streamlined workflow ensures quick and efficient resolution.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-slate-200 hover:border-indigo-300 transition bg-slate-50"
              >
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">User Roles</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Tailored dashboards for each role
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: 'Student',
                description: 'Submit complaints, track status, and provide feedback',
                features: ['Submit Complaints', 'Track Status', 'Give Feedback', 'View Timeline'],
              },
              {
                role: 'Admin',
                description: 'Manage complaints, assign to technicians, monitor progress',
                features: ['View All Complaints', 'Assign Tasks', 'Set Deadlines', 'Analytics'],
              },
              {
                role: 'Technician',
                description: 'Accept tasks, update progress, and resolve complaints',
                features: ['View Assigned Tasks', 'Update Progress', 'Submit Reports', 'Track Completed'],
              },
            ].map((roleInfo, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-slate-200 p-8 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">{roleInfo.role}</h3>
                <p className="text-slate-600 text-sm mb-6">{roleInfo.description}</p>
                <ul className="space-y-3 mb-6">
                  {roleInfo.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Submit', description: 'Student submits a complaint with details' },
              { step: 2, title: 'Assign', description: 'Admin assigns to a technician with deadline' },
              { step: 3, title: 'Resolve', description: 'Technician works on and resolves the issue' },
              { step: 4, title: 'Feedback', description: 'Student provides feedback on resolution' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-indigo-100 mb-8">Join the platform and streamline your complaint management today</p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Smart Complaint & Feedback Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
