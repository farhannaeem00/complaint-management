import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue';
  trend?: { value: number; isPositive: boolean };
}

export function StatCard({ label, value, icon, color = 'indigo', trend }: StatCardProps) {
  const colorConfig: Record<string, { bg: string; iconBg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
    red: { bg: 'bg-red-50', iconBg: 'bg-red-100', text: 'text-red-600' },
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
  };

  const config = colorConfig[color];

  return (
    <div className={`${config.bg} rounded-lg p-6 border border-slate-200`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`${config.iconBg} ${config.text} rounded-lg p-3`}>{icon}</div>
      </div>
      {trend && (
        <p className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
        </p>
      )}
    </div>
  );
}
