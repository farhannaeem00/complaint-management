import { Complaint } from '@/lib/context';
import { StatusBadge } from './status-badge';
import { ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ComplaintCardProps {
  complaint: Complaint;
  href?: string;
  showDeadline?: boolean;
}

export function ComplaintCard({ complaint, href, showDeadline }: ComplaintCardProps) {
  const priorityColor = {
    low: 'text-slate-600 bg-slate-100',
    medium: 'text-amber-700 bg-amber-100',
    high: 'text-red-700 bg-red-100',
  };

  const isOverdue = complaint.deadline && new Date(complaint.deadline) < new Date() && complaint.status !== 'resolved';

  const content = (
    <div className={`bg-white border rounded-lg p-4 hover:border-indigo-300 transition ${isOverdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 line-clamp-2">{complaint.title}</h3>
          <p className="text-xs text-slate-600 mt-1">ID: {complaint.id}</p>
        </div>
        <StatusBadge status={complaint.status} size="sm" />
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{complaint.description}</p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded capitalize font-medium ${priorityColor[complaint.priority]}`}>
            {complaint.priority}
          </span>
          <span className="text-slate-600">{complaint.category}</span>
          {showDeadline && complaint.deadline && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
              {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {new Date(complaint.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        {href && <ChevronRight className="w-4 h-4 text-slate-400" />}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block hover:no-underline">
      {content}
    </Link>
  ) : (
    content
  );
}
