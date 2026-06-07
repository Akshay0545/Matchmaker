import React from 'react';
import { UserPlus, ShieldCheck, Search, Send, CalendarCheck, Heart, PauseCircle } from 'lucide-react';

const STAGES = [
  { key: 'created',  label: 'Profile Created',       sub: 'Onboarded',            icon: UserPlus,      statuses: ['New'] },
  { key: 'verified', label: 'Verified',               sub: 'Biodata confirmed',    icon: ShieldCheck,   statuses: ['Profiling'] },
  { key: 'matching', label: 'Matching',               sub: 'Finding matches',      icon: Search,        statuses: ['Searching', 'Active'] },
  { key: 'intro',    label: 'Introductions Sent',     sub: 'Match shared',         icon: Send,          statuses: ['Matched'] },
  { key: 'meeting',  label: 'Meeting Scheduled',      sub: 'Getting to know',      icon: CalendarCheck, statuses: [] },
  { key: 'success',  label: 'Success! 🎉',            sub: 'Found their match',    icon: Heart,         statuses: ['Closed'] }
];

function getStageIndex(status) {
  if (status === 'On Hold') return -1;
  for (let i = 0; i < STAGES.length; i++) {
    if (STAGES[i].statuses.includes(status)) return i;
  }
  return 0;
}

export default function JourneyFunnel({ status, onStatusChange }) {
  const activeIdx = getStageIndex(status);
  const isOnHold = status === 'On Hold';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-base">
          <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
            <Heart size={14} className="text-primary-600" />
          </div>
          Matchmaking Journey
        </h3>
        {isOnHold && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
            <PauseCircle size={12} /> On Hold
          </span>
        )}
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center gap-0">
        {STAGES.map((stage, idx) => {
          const done   = !isOnHold && idx < activeIdx;
          const active = !isOnHold && idx === activeIdx;
          const future = isOnHold || idx > activeIdx;
          const Icon   = stage.icon;

          return (
            <React.Fragment key={stage.key}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <button
                  onClick={() => stage.statuses[0] && onStatusChange?.(stage.statuses[0])}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 flex-shrink-0 ${
                    done
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                      : active
                      ? 'bg-white border-primary-500 text-primary-600 shadow-lg ring-4 ring-primary-100'
                      : isOnHold && idx <= 3
                      ? 'bg-orange-100 border-orange-300 text-orange-500'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  } ${stage.statuses[0] ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                  {done ? '✓' : <Icon size={16} />}
                </button>
                <div className="mt-1.5 text-center px-1">
                  <div className={`text-[11px] font-bold leading-tight ${
                    active ? 'text-primary-600' : done ? 'text-slate-700' : 'text-slate-400'
                  }`}>{stage.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 hidden md:block">{stage.sub}</div>
                </div>
              </div>

              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-500 ${
                  done ? 'bg-primary-500' : isOnHold && idx < 3 ? 'bg-orange-200' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="flex sm:hidden flex-col gap-2">
        {STAGES.map((stage, idx) => {
          const done   = !isOnHold && idx < activeIdx;
          const active = !isOnHold && idx === activeIdx;
          const Icon   = stage.icon;
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-sm ${
                done   ? 'bg-primary-600 border-primary-600 text-white'
                : active ? 'bg-white border-primary-500 text-primary-600 ring-2 ring-primary-100'
                : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                {done ? '✓' : <Icon size={13} />}
              </div>
              <div className="flex-1">
                <div className={`text-xs font-bold ${active ? 'text-primary-600' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                  {stage.label}
                </div>
                <div className="text-[10px] text-slate-400">{stage.sub}</div>
              </div>
              {active && <span className="text-[10px] bg-primary-100 text-primary-600 font-bold px-2 py-0.5 rounded-full">Current</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
