import React from 'react';

const STATUS_CONFIG = {
  New: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  Profiling: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Searching: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Matched: { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500' },
  'On Hold': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' }
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['New'];
  return (
    <span className={`badge ${cfg.bg} ${cfg.text} gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

export { STATUS_CONFIG };
