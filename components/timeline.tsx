import { TimelineEvent } from '@/lib/context';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Check className="w-5 h-5 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-slate-400" />;
      case 'assigned':
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 border-4 border-white">
              {getStatusIcon(event.status)}
            </div>
            {index !== events.length - 1 && (
              <div className="w-0.5 h-12 bg-slate-200 mt-2" />
            )}
          </div>
          <div className="pt-2 pb-6">
            <h4 className="font-medium text-slate-900 capitalize">{event.status.replace('-', ' ')}</h4>
            <p className="text-sm text-slate-600 mt-1">{event.description}</p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(event.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
