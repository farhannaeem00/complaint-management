'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const { user, logout, notifications, markNotificationAsRead } = useApp();
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotificationOpen(!notificationOpen); setProfileOpen(false); }}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">No notifications</div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {notifications.slice(0, 20).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                          !notification.read ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <p className="font-medium text-sm text-slate-900">{notification.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotificationOpen(false); }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-slate-900 hidden sm:inline">{user?.name}</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-600 capitalize">{user?.role}</p>
                  {user?.department && <p className="text-xs text-slate-500">{user.department}</p>}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
