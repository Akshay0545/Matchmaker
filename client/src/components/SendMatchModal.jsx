import React, { useState } from 'react';
import { X, Send, Heart, MapPin, Briefcase, DollarSign, GraduationCap, Sparkles, Edit3 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const LABEL_CFG = {
  'High Potential Match': { bg:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', stars:'⭐⭐⭐' },
  'Strong Match':         { bg:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200',    stars:'⭐⭐' },
  'Good Match':           { bg:'bg-amber-50',   text:'text-amber-700',   border:'border-amber-200',   stars:'⭐' },
  'Possible Match':       { bg:'bg-orange-50',  text:'text-orange-700',  border:'border-orange-200',  stars:'' },
  'Low Compatibility':    { bg:'bg-slate-50',   text:'text-slate-600',   border:'border-slate-200',   stars:'' }
};

function fmtInc(inc) {
  if (!inc) return '—';
  return inc >= 100000 ? `₹${(inc / 100000).toFixed(1)}L / yr` : `₹${inc.toLocaleString('en-IN')} / yr`;
}

export default function SendMatchModal({ customer, match, onClose, onSent }) {
  const [loading, setLoading] = useState(false);
  const [introText, setIntroText] = useState(match.introText || '');
  const cfg = LABEL_CFG[match.matchLabel] || LABEL_CFG['Good Match'];
  const initials = [match.firstName?.[0], match.lastName?.[0]].filter(Boolean).join('');

  const handleSend = async () => {
    setLoading(true);
    try {
      await api.post(`/customers/${customer.id}/send-match`, {
        matchId: match.id,
        matchName: `${match.firstName} ${match.lastName}`,
        introText,
        score: match.matchScore
      });
      toast.success(`Match sent to ${customer.firstName}! 💌`);
      onSent();
      onClose();
    } catch {
      toast.error('Failed to send match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'slideUp 0.25s ease' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-600 to-rose-500">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart size={16} className="text-white fill-white/50" />
            </div>
            <div>
              <h2 className="text-base font-bold">Send Match Introduction</h2>
              <p className="text-[11px] text-primary-200">A personalised email will be sent to {customer.firstName}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* ── Match summary card ── */}
          <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0 shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-800 text-lg">{match.firstName} {match.lastName}</h3>
                  <span className={`badge ${cfg.bg} ${cfg.text} border ${cfg.border} text-xs`}>
                    {cfg.stars} {match.matchLabel}
                  </span>
                  {match.aiPowered && (
                    <span className="badge bg-violet-50 text-violet-700 border border-violet-200 text-xs gap-1">
                      <Sparkles size={9} /> AI
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  {[
                    [MapPin, `${match.city}, ${match.country}`],
                    [Briefcase, match.designation],
                    [DollarSign, fmtInc(match.income)],
                    [GraduationCap, `${match.degree} · ${match.college}`]
                  ].map(([Icon, val], i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Icon size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-3xl font-extrabold ${cfg.text}`}>{match.matchScore}%</div>
                <div className="text-xs text-slate-400">match score</div>
              </div>
            </div>
          </div>

          {/* ── Key reasons ── */}
          {match.matchReasons?.length > 0 && (
            <div>
              <p className="label">Why this match works</p>
              <div className="flex flex-wrap gap-1.5">
                {match.matchReasons.filter(r => !r.startsWith('⚠️')).slice(0, 4).map((r, i) => (
                  <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">{r}</span>
                ))}
                {match.matchReasons.filter(r => r.startsWith('⚠️')).slice(0, 2).map((r, i) => (
                  <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── AI-generated intro ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="label flex items-center gap-1.5 mb-0">
                {match.aiPowered
                  ? <><span className="w-4 h-4 bg-violet-100 rounded text-violet-600 flex items-center justify-center"><Sparkles size={9} /></span> Gemini AI–Generated Email</>
                  : <><span className="w-4 h-4 bg-slate-100 rounded text-slate-600 flex items-center justify-center text-[9px] font-bold">AI</span> Introduction Email</>
                }
              </div>
              <span className="flex items-center gap-1 text-[10px] text-slate-400"><Edit3 size={10} /> Editable</span>
            </div>
            <textarea rows={11} className="input text-sm leading-relaxed resize-none font-sans"
              value={introText} onChange={e => setIntroText(e.target.value)} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSend} disabled={loading}
            className="btn-primary flex-1 justify-center bg-gradient-to-r from-primary-600 to-rose-500 hover:from-primary-700 hover:to-rose-600">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
              : <><Send size={15} /> Send Introduction</>}
          </button>
        </div>
      </div>
    </div>
  );
}
