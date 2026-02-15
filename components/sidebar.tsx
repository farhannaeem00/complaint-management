'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Zap,
  Users,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

const STUDENT_ROUTES = [
  { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/student/complaints', label: 'My Complaints', icon: FileText },
  { href: '/dashboard/student/feedback', label: 'Give Feedback', icon: MessageSquare },
];

const ADMIN_ROUTES = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/complaints', label: 'All Complaints', icon: FileText },
  { href: '/dashboard/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
];

export function Sidebar() {
  const { user, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const routes = user?.role === 'admin' ? ADMIN_ROUTES : STUDENT_ROUTES;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-indigo-600 text-white p-2 rounded-lg"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6 z-40 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative overflow-y-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold">IssueFlow</h1>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-8 pb-6 border-b border-slate-700">
            <p className="text-sm font-medium">Logged in as</p>
            <p className="text-lg font-bold text-indigo-400">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            const Icon = route.icon;
            return (
              <Link key={route.href} href={route.href}>
                <button
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{route.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-slate-700 pt-6">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
