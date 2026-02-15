'use client';

import { useApp } from '@/lib/context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  ClipboardList,
  LogOut,
  Zap,
} from 'lucide-react';

export function DashboardSidebar() {
  const { user } = useApp();
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const studentLinks = [
    { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/student/complaints', label: 'My Complaints', icon: FileText },
    { href: '/dashboard/student/complaint/new', label: 'Submit Complaint', icon: MessageSquare },
    { href: '/dashboard/student/feedback', label: 'Give Feedback', icon: MessageSquare },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/complaints', label: 'All Complaints', icon: ClipboardList },
    { href: '/dashboard/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  ];

  const technicianLinks = [
    { href: '/dashboard/technician', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/technician/assigned', label: 'Assigned Tasks', icon: ClipboardList },
    { href: '/dashboard/technician/completed', label: 'Completed', icon: FileText },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'technician'
        ? technicianLinks
        : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900">SCFMS</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                isActive(link.href)
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 mb-2">Logged in as</p>
        <p className="text-sm font-medium text-slate-900 capitalize">{user?.role}</p>
        <p className="text-xs text-slate-600">{user?.email}</p>
      </div>
    </aside>
  );
}
