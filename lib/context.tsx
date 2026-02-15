'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// --- Types matching the backend schema ---

export type UserRole = 'student' | 'admin' | 'technician';
export type ComplaintStatus = 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'rejected' | 'closed' | 'escalated';
export type ComplaintPriority = 'low' | 'medium' | 'high';
export type NotificationType = 'new_complaint' | 'assignment' | 'rejection' | 'deadline_missed' | 'resolved' | 'feedback_received';

export interface TimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
}

export interface Category {
  id: string;
  name: string;
  department?: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  department: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  deadline?: string;
  adminResponse?: string;
  rejectionReason?: string;
  timeline: TimelineEvent[];
  isOverdue?: boolean;
  feedbackSubmitted?: boolean;
  adminVerification?: boolean;
}

export interface Feedback {
  id: string;
  complaintId?: string;
  complaintTitle?: string;
  studentId?: string;
  studentName: string;
  rating?: number;
  comment?: string;
  message?: string;
  type: string;
  feedbackType?: string;
  isAnonymous: boolean;
  anonymous?: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedComplaintId?: string;
  read: boolean;
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  department: string;
  email?: string;
}

// --- Helpers to map backend enums to frontend ---

function mapStatusFromBackend(status: string): ComplaintStatus {
  const map: Record<string, ComplaintStatus> = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in-progress',
    REJECTED: 'rejected',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    ESCALATED: 'escalated',
  };
  return map[status] || 'pending';
}

function mapPriorityFromBackend(priority: string): ComplaintPriority {
  return (priority?.toLowerCase() as ComplaintPriority) || 'medium';
}

function mapRoleFromBackend(role: string): UserRole {
  const map: Record<string, UserRole> = {
    ADMIN: 'admin',
    STUDENT: 'student',
    TECHNICIAN: 'technician',
  };
  return map[role] || 'student';
}

function mapComplaintFromBackend(c: any): Complaint {
  const activityLogs = c.activityLogs || [];
  const timeline: TimelineEvent[] = activityLogs.map((log: any) => ({
    status: mapStatusFromBackend(log.action?.replace('COMPLAINT_', '').replace('STATUS_', '') || 'PENDING'),
    timestamp: log.createdAt,
    description: log.description,
  }));

  // If no activity logs, create a basic timeline from complaint data
  if (timeline.length === 0) {
    timeline.push({
      status: 'pending',
      timestamp: c.createdAt,
      description: 'Complaint submitted',
    });
    if (c.status !== 'PENDING' && c.technician) {
      timeline.push({
        status: 'assigned',
        timestamp: c.updatedAt || c.createdAt,
        description: `Assigned to ${c.technician?.name || 'technician'}`,
      });
    }
    if (c.status === 'IN_PROGRESS') {
      timeline.push({
        status: 'in-progress',
        timestamp: c.updatedAt || c.createdAt,
        description: 'Work in progress',
      });
    }
    if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
      timeline.push({
        status: 'resolved',
        timestamp: c.updatedAt || c.createdAt,
        description: 'Complaint resolved',
      });
    }
  }

  return {
    id: c.id,
    studentId: c.student?.id || c.studentId,
    studentName: c.student?.name || 'Unknown',
    title: c.title,
    description: c.description,
    category: c.category?.name || '',
    categoryId: c.categoryId,
    department: c.department,
    priority: mapPriorityFromBackend(c.priority),
    status: mapStatusFromBackend(c.status),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    assignedTechnicianId: c.technician?.id || c.technicianId || undefined,
    assignedTechnicianName: c.technician?.name || undefined,
    deadline: c.deadline || undefined,
    rejectionReason: c.rejectionReason || undefined,
    adminResponse: undefined,
    timeline,
    isOverdue: c.deadline ? new Date(c.deadline) < new Date() && !['RESOLVED', 'CLOSED'].includes(c.status) : false,
    feedbackSubmitted: c.feedbackSubmitted,
    adminVerification: c.adminVerification,
  };
}

function mapFeedbackFromBackend(f: any): Feedback {
  return {
    id: f.id,
    complaintId: f.complaintId,
    complaintTitle: f.complaint?.title,
    studentName: f.anonymous ? 'Anonymous' : (f.complaint?.student?.name || 'Unknown'),
    rating: f.rating,
    message: f.message,
    comment: f.message,
    type: (f.feedbackType || 'general').toLowerCase(),
    feedbackType: f.feedbackType,
    isAnonymous: f.anonymous,
    anonymous: f.anonymous,
    createdAt: f.createdAt,
  };
}

// --- API helper ---

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }
  return data;
}

// --- Context ---

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, studentId: string, password: string, department?: string) => Promise<void>;
  complaints: Complaint[];
  feedback: Feedback[];
  feedbacks: Feedback[];
  notifications: Notification[];
  technicians: Technician[];
  categories: Category[];
  refreshComplaints: () => Promise<void>;
  refreshFeedback: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  submitComplaint: (data: { title: string; description: string; categoryId: string; department: string; priority: string }) => Promise<void>;
  assignComplaint: (complaintId: string, technicianId: string, deadline: string) => Promise<void>;
  acceptComplaint: (complaintId: string) => Promise<void>;
  rejectComplaint: (complaintId: string, reason: string) => Promise<void>;
  resolveComplaint: (complaintId: string) => Promise<void>;
  verifyComplaint: (complaintId: string) => Promise<void>;
  submitFeedback: (data: { complaintId: string; feedbackType: string; message: string; rating: number; anonymous: boolean }) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  getComplaintsByStudent: (studentId: string) => Complaint[];
  getAssignedComplaints: (technicianId: string) => Complaint[];
  getNotificationsForUser: (userId: string) => Notification[];
  dashboardStats: any;
  refreshStats: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});

  // Check existing session on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      apiFetch('/api/auth/me')
        .then((data) => {
          const u = data.data.user;
          setUser({
            id: u.id,
            name: u.name,
            email: u.email,
            role: mapRoleFromBackend(u.role),
            studentId: u.studentId || undefined,
            department: u.department || undefined,
          });
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshComplaints();
      refreshNotifications();
      refreshStats();
      fetchCategories();
      if (user.role === 'admin') {
        fetchTechnicians();
        refreshFeedback();
      }
    }
  }, [isAuthenticated, user?.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiFetch('/api/categories');
      setCategories(data.data.categories || []);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  }, []);

  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await apiFetch('/api/technicians');
      const techs = (data.data.technicians || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        department: t.department || '',
        email: t.email,
      }));
      setTechnicians(techs);
    } catch (e) {
      console.error('Failed to fetch technicians:', e);
    }
  }, []);

  const refreshComplaints = useCallback(async () => {
    try {
      const data = await apiFetch('/api/complaints');
      const mapped = (data.data.complaints || []).map(mapComplaintFromBackend);
      setComplaints(mapped);
    } catch (e) {
      console.error('Failed to fetch complaints:', e);
    }
  }, []);

  const refreshFeedback = useCallback(async () => {
    try {
      const data = await apiFetch('/api/feedback');
      const mapped = (data.data.feedbacks || []).map(mapFeedbackFromBackend);
      setFeedback(mapped);
    } catch (e) {
      console.error('Failed to fetch feedback:', e);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await apiFetch('/api/notifications');
      const notifs = (data.data.notifications || []).map((n: any) => ({
        id: n.id,
        userId: n.userId,
        type: n.type?.toLowerCase() || '',
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      }));
      setNotifications(notifs);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const data = await apiFetch('/api/dashboard/stats');
      setDashboardStats(data.data.stats || {});
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { token, user: u } = data.data;
    localStorage.setItem('token', token);
    setUser({
      id: u.id,
      name: u.name,
      email: u.email,
      role: mapRoleFromBackend(u.role),
      studentId: u.studentId || undefined,
      department: u.department || undefined,
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setComplaints([]);
    setFeedback([]);
    setNotifications([]);
    setTechnicians([]);
    setCategories([]);
    setDashboardStats({});
  };

  const register = async (name: string, email: string, studentId: string, password: string, department?: string) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, studentId, role: 'STUDENT', department }),
    });
    const { token, user: u } = data.data;
    localStorage.setItem('token', token);
    setUser({
      id: u.id,
      name: u.name,
      email: u.email,
      role: mapRoleFromBackend(u.role),
      studentId: u.studentId || undefined,
      department: u.department || undefined,
    });
    setIsAuthenticated(true);
  };

  const submitComplaint = async (formData: { title: string; description: string; categoryId: string; department: string; priority: string }) => {
    await apiFetch('/api/complaints', {
      method: 'POST',
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        department: formData.department,
        priority: formData.priority.toUpperCase(),
      }),
    });
    await refreshComplaints();
    await refreshStats();
  };

  const assignComplaint = async (complaintId: string, technicianId: string, deadline: string) => {
    await apiFetch(`/api/complaints/${complaintId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianId, deadline }),
    });
    await refreshComplaints();
    await refreshStats();
  };

  const acceptComplaint = async (complaintId: string) => {
    await apiFetch(`/api/complaints/${complaintId}/accept`, {
      method: 'POST',
    });
    await refreshComplaints();
    await refreshStats();
  };

  const rejectComplaint = async (complaintId: string, reason: string) => {
    await apiFetch(`/api/complaints/${complaintId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    await refreshComplaints();
    await refreshStats();
  };

  const resolveComplaint = async (complaintId: string) => {
    await apiFetch(`/api/complaints/${complaintId}/complete`, {
      method: 'POST',
    });
    await refreshComplaints();
    await refreshStats();
  };

  const verifyComplaint = async (complaintId: string) => {
    await apiFetch(`/api/complaints/${complaintId}/verify`, {
      method: 'POST',
    });
    await refreshComplaints();
    await refreshStats();
  };

  const submitFeedback = async (data: { complaintId: string; feedbackType: string; message: string; rating: number; anonymous: boolean }) => {
    await apiFetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        complaintId: data.complaintId,
        feedbackType: data.feedbackType.toUpperCase(),
        message: data.message,
        rating: data.rating,
        anonymous: data.anonymous,
      }),
    });
    await refreshComplaints();
    await refreshFeedback();
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const getComplaintsByStudent = (studentId: string) => {
    return complaints.filter((c) => c.studentId === studentId);
  };

  const getAssignedComplaints = (technicianId: string) => {
    return complaints.filter((c) => c.assignedTechnicianId === technicianId);
  };

  const getNotificationsForUser = (userId: string) => {
    return notifications;
  };

  const value: AppContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    complaints,
    feedback,
    feedbacks: feedback,
    notifications,
    technicians,
    categories,
    refreshComplaints,
    refreshFeedback,
    refreshNotifications,
    submitComplaint,
    assignComplaint,
    acceptComplaint,
    rejectComplaint,
    resolveComplaint,
    verifyComplaint,
    submitFeedback,
    markNotificationAsRead,
    getComplaintsByStudent,
    getAssignedComplaints,
    getNotificationsForUser,
    dashboardStats,
    refreshStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
