import { ComplaintStatus } from '@/lib/context';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending' },
    assigned: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Assigned' },
    'in-progress': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Progress' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Resolved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    closed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Closed' },
    escalated: { bg: 'bg-red-100', text: 'text-red-700', label: 'Escalated' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`${config.bg} ${config.text} ${sizeClasses} font-medium rounded-full inline-block`}>
      {config.label}
    </span>
  );
}
