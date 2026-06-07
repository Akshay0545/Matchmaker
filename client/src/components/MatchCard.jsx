import React, { useState } from 'react';
import { MapPin, Briefcase, GraduationCap, TrendingUp, Send, ChevronDown, ChevronUp, Sparkles, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

const LABEL_CFG = {
  'High Potential Match': { bg:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', bar:'bg-emerald-500', ring:'#10b981', badge:'bg-emerald-500', emoji:'🔥' },
  'Strong Match':         { bg:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200',    bar:'bg-blue-500',    ring:'#3b82f6', badge:'bg-blue-500',    emoji:'⭐' },
  'Good Match':           { bg:'bg-amber-50',   text:'text-amber-700',   border:'border-amber-200',   bar:'bg-amber-500',   ring:'#f59e0b', badge:'bg-amber-500',   emoji:'👍' },
  'Possible Match':       { bg:'bg-orange-50',  text:'text-orange-700',  border:'border-orange-200',  bar:'bg-orange-400',  ring:'#f97316', badge:'bg-orange-400',  emoji:'' },
  'Low Compatibility':    { bg:'bg-slate-50',   text:'text-slate-500',   border:'border-slate-200',   bar:'bg-slate-400',   ring:'#94a3b8', badge:'bg-slate-400',   emoji:'' }
};

const CATEGORIES = [
  { key: 'familyValues', label: 'Family Values',  color: 'bg-rose-500' },
  { key: 'lifeGoals',    label: 'Life Goals',      color: 'bg-violet-500' },
  { key: 'career',       label: 'Career',          color: 'bg-blue-500' },
  { key: 'lifestyle',    label: 'Lifestyle',        color: 'bg-emerald-500' },
  { key: 'practical',    label: 'Practical Fit',   color: 'bg-amber-500' }
];

function fmtInc(inc) {
  if (!inc) return '—';
  return inc >= 100000 ? `₹${(inc / 100000).toFixed(1)}L` : `₹${inc.toLocaleString('en-IN')}`;
}

function ScoreRing({ score, color }) {
  const r = 22, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg viewBox="0 0 52 52" className="w-full h-full -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4.5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-extrabold text-slate-800 leading-none">{score}</span>
        <span className="text-[8px] text-slate-400 font-semibold">/ 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-slate-600 font-medium">{label}</span>
        <span className="text-[11px] font-bold text-slate-700">{score}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function MatchCard({ match, customer, alreadySent, onSendMatch }) {
  const [tab, setTab] = useState('overview'); // 'overview' | 'breakdown' | 'explanation'
  const cfg = LABEL_CFG[match.matchLabel] || LABEL_CFG['Good Match'];
  const initials = [match.firstName?.[0], match.lastName?.[0]].filter(Boolean).join('');
  const positives = match.positives || (match.matchReasons || []).filter(r => !r.startsWith('⚠️'));
  const concerns  = match.concerns  || (match.matchReasons || []).filter(r => r.startsWith('⚠️')).map(r => r.replace('⚠️ ', ''));
  const hasBreakdown = match.breakdown && Object.keys(match.breakdown).length > 0;

  return (
    <div className={`rounded-2xl border ${cfg.border} overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200`}>
      {/* AI badge strip */}
      {match.aiPowered && (
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-3 py-1.5 flex items-center gap-2">
          <Sparkles size={11} className="text-white" />
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">AI Scored</span>
        </div>
      )}

      <div className="p-4">
        {/* ── Header ── */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-slate-800">{match.firstName} {match.lastName}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${cfg.badge}`}>
                {cfg.emoji} {match.matchLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
              <MapPin size={10} /><span>{match.city}</span>
              <span className="text-slate-300">·</span>
              <span>{match.age} yrs · {match.maritalStatus}</span>
            </div>
          </div>
          <ScoreRing score={match.matchScore} color={cfg.ring} />
        </div>

        {/* Score bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${match.matchScore}%` }} />
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
          {[
            [Briefcase,   match.designation],
            [GraduationCap, match.degree],
            [TrendingUp,  `${fmtInc(match.income)} / yr`],
            [null,        `${match.religion}${match.caste ? ` · ${match.caste}` : ''}`]
          ].map(([Icon, val], i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
              {Icon ? <Icon size={11} className="text-slate-400 flex-shrink-0" /> : <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 text-rose-500 flex items-center justify-center text-[8px] flex-shrink-0">✦</span>}
              <span className="truncate">{val}</span>
            </div>
          ))}
        </div>

        {/* ── Sub-tabs ── */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-3 text-[11px] font-semibold">
          {[
            { id:'overview',     label:'Overview' },
            { id:'explanation',  label:'Why This Match?' },
            ...(hasBreakdown ? [{ id:'breakdown', label:'Score Breakdown' }] : [])
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-1.5 transition-colors ${tab === t.id ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div className="space-y-1.5">
            {positives.slice(0,3).map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" />{p}
              </div>
            ))}
            {concerns.slice(0,2).map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />{c}
              </div>
            ))}
          </div>
        )}

        {/* ── Why this match tab ── */}
        {tab === 'explanation' && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              {match.aiPowered ? <Sparkles size={11} className="text-violet-500" /> : <Cpu size={11} className="text-slate-400" />}
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {match.aiPowered ? 'AI-Generated Explanation' : 'Algorithm Analysis'}
              </span>
            </div>
            {positives.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Why this works</p>
                {positives.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 py-1 border-b border-slate-50 last:border-0">
                    <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>{p}
                  </div>
                ))}
              </div>
            )}
            {concerns.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2">Potential Concerns</p>
                {concerns.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700 py-1 border-b border-slate-50 last:border-0">
                    <span className="flex-shrink-0">⚠️</span>{c}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Score breakdown tab ── */}
        {tab === 'breakdown' && hasBreakdown && (
          <div className="space-y-2.5">
            {CATEGORIES.filter(c => match.breakdown[c.key] !== undefined).map(cat => (
              <CategoryBar key={cat.key} label={cat.label} score={match.breakdown[cat.key]} color={cat.color} />
            ))}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          {alreadySent ? (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex-1 justify-center">
              <CheckCircle2 size={12} /> Introduction Sent
            </div>
          ) : (
            <button onClick={() => onSendMatch(match)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-primary-600 to-rose-500 hover:from-primary-700 hover:to-rose-600 px-4 py-1.5 rounded-lg transition-all shadow-sm flex-1 justify-center">
              <Send size={11} /> Send Introduction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
