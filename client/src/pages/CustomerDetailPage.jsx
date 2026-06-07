import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Heart, FileText, MapPin, Phone, Mail, GraduationCap,
  Briefcase, DollarSign, Building2, Calendar, ChevronDown, Search,
  SlidersHorizontal, Trash2, Send, Clock, TrendingUp, PlusCircle, Star,
  Sparkles, AlertCircle, CheckCircle2, ChevronUp, Cpu, Brain, Filter, X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import MatchCard from '../components/MatchCard';
import SendMatchModal from '../components/SendMatchModal';
import JourneyFunnel from '../components/JourneyFunnel';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['New', 'Profiling', 'Searching', 'Active', 'Matched', 'On Hold', 'Closed'];
const RELIGIONS = ['Any', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist'];
const KIDS_OPTS = ['Any', 'Yes', 'No', 'Maybe'];
const RELOCATE_OPTS = ['Any', 'Yes', 'No', 'Maybe'];

function fmt(inc) {
  if (!inc) return '—';
  return inc >= 100000 ? `₹${(inc / 100000).toFixed(1)} LPA` : `₹${inc.toLocaleString('en-IN')}`;
}

function Avatar({ name, gender }) {
  const initials = [name?.split(' ')[0]?.[0], name?.split(' ')[1]?.[0]].filter(Boolean).join('');
  const g = gender === 'Female' ? 'from-fuchsia-400 via-pink-400 to-rose-500' : 'from-blue-400 via-indigo-500 to-violet-500';
  return (
    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center text-white font-extrabold text-3xl shadow-lg flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Row({ label, value, icon: Icon }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />}
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</div>
        <div className="text-sm font-semibold text-slate-700 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function LifestylePill({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-3 text-center border ${highlight ? 'bg-primary-50 border-primary-100' : 'bg-slate-50 border-slate-100'}`}>
      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</div>
      <div className={`text-sm font-bold mt-1 ${highlight ? 'text-primary-700' : 'text-slate-700'}`}>{value}</div>
    </div>
  );
}

// ── Smart Filters Panel ──────────────────────────────────────────────────────
function SmartFilters({ matches, filters, setFilters, onClose }) {
  const cities = [...new Set(matches.map(m => m.city))].sort();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <Filter size={15} className="text-primary-500" /> Smart Filters
        </h4>
        <button onClick={() => setFilters({ ageMin:18, ageMax:50, incomeMin:0, incomeMax:10000000, city:'Any', religion:'Any', kids:'Any', relocate:'Any' })}
          className="text-xs text-primary-500 hover:text-primary-700 font-semibold">Reset all</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Age range */}
        <div className="col-span-2">
          <label className="label">Age Range: {filters.ageMin}–{filters.ageMax} yrs</label>
          <div className="flex items-center gap-2">
            <input type="range" min={18} max={50} value={filters.ageMin}
              onChange={e => setFilters(f => ({ ...f, ageMin: +e.target.value }))}
              className="flex-1 accent-primary-600" />
            <input type="range" min={18} max={60} value={filters.ageMax}
              onChange={e => setFilters(f => ({ ...f, ageMax: +e.target.value }))}
              className="flex-1 accent-primary-600" />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="label">City</label>
          <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
            className="input py-2 px-2.5 text-xs cursor-pointer">
            <option value="Any">Any City</option>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Religion */}
        <div>
          <label className="label">Religion</label>
          <select value={filters.religion} onChange={e => setFilters(f => ({ ...f, religion: e.target.value }))}
            className="input py-2 px-2.5 text-xs cursor-pointer">
            {RELIGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Kids */}
        <div>
          <label className="label">Wants Kids</label>
          <select value={filters.kids} onChange={e => setFilters(f => ({ ...f, kids: e.target.value }))}
            className="input py-2 px-2.5 text-xs cursor-pointer">
            {KIDS_OPTS.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>

        {/* Relocation */}
        <div>
          <label className="label">Open to Relocate</label>
          <select value={filters.relocate} onChange={e => setFilters(f => ({ ...f, relocate: e.target.value }))}
            className="input py-2 px-2.5 text-xs cursor-pointer">
            {RELOCATE_OPTS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Income */}
        <div className="col-span-2">
          <label className="label">Min Income: {filters.incomeMin >= 100000 ? `₹${(filters.incomeMin/100000).toFixed(0)}L` : `₹${filters.incomeMin}`} / yr</label>
          <input type="range" min={0} max={5000000} step={100000} value={filters.incomeMin}
            onChange={e => setFilters(f => ({ ...f, incomeMin: +e.target.value }))}
            className="w-full accent-primary-600" />
        </div>
      </div>
    </div>
  );
}

// ── AI Insights Panel (Notes Analyzer) ──────────────────────────────────────
function AIInsightsPanel({ customerId, insights, onInsights }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim() || text.trim().length < 10) {
      toast.error('Please enter at least a sentence of notes'); return;
    }
    setLoading(true);
    try {
      const r = await api.post(`/customers/${customerId}/analyze-notes`, { notesText: text });
      onInsights(r.data.insights);
      toast.success('AI insights generated! ✨');
    } catch (e) {
      toast.error(e.response?.data?.message || 'AI analysis failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="card border-violet-200 bg-violet-50/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
          <Brain size={14} className="text-violet-600" />
        </div>
        <h4 className="font-bold text-violet-800">AI Notes Analyzer</h4>
        <span className="badge bg-violet-100 text-violet-600 text-[10px] gap-1"><Sparkles size={9} /> Powered by Groq AI</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Paste notes from a client meeting or call. AI extracts key preferences and recommends what to look for in a match.</p>
      <textarea rows={3} className="input text-sm resize-none mb-2 bg-white"
        placeholder="e.g. Met client today. Prefers ambitious partner. Not interested in relocating. Very close with family. Works late hours…"
        value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleGenerate} disabled={loading || !text.trim()}
        className="btn-primary bg-violet-600 hover:bg-violet-700 shadow-none disabled:opacity-40 text-sm py-2">
        {loading
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing…</>
          : <><Sparkles size={14} /> Generate Insights</>}
      </button>

      {insights && (
        <div className="mt-4 space-y-3 border-t border-violet-200 pt-4">
          {insights.personalityInsights && (
            <div className="text-xs bg-white rounded-xl p-3 border border-violet-100 text-slate-700 italic">
              "{insights.personalityInsights}"
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.keyPreferences?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Key Preferences</p>
                {insights.keyPreferences.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg mb-1 border border-emerald-100">
                    <CheckCircle2 size={10} className="mt-0.5 flex-shrink-0" />{p}
                  </div>
                ))}
              </div>
            )}
            {insights.recommendedMatchTraits?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recommended Match Traits</p>
                {insights.recommendedMatchTraits.map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded-lg mb-1 border border-blue-100">
                    <Star size={10} className="mt-0.5 flex-shrink-0" />{t}
                  </div>
                ))}
              </div>
            )}
          </div>
          {insights.concerns?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Watch Out For</p>
              {insights.concerns.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mb-1 border border-amber-100">
                  <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />{c}
                </div>
              ))}
            </div>
          )}
          {insights.nextSteps && (
            <div className="text-xs text-violet-700 bg-violet-100 rounded-xl px-3 py-2 font-semibold border border-violet-200">
              💡 Next Step: {insights.nextSteps}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = { ageMin:18, ageMax:55, incomeMin:0, incomeMax:10000000, city:'Any', religion:'Any', kids:'Any', relocate:'Any' };

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchMeta, setMatchMeta] = useState({ aiEnabled: false, aiScoredCount: 0, aiProvider: null });
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchSearch, setMatchSearch] = useState('');
  const [matchSort, setMatchSort] = useState('score');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [aiInsights, setAiInsights] = useState(null);

  const fetchCustomer = useCallback(() =>
    api.get(`/customers/${id}`).then(r => setCustomer(r.data)), [id]);

  useEffect(() => {
    fetchCustomer().catch(() => toast.error('Customer not found')).finally(() => setLoadingCustomer(false));
  }, [fetchCustomer]);

  const loadMatches = () => {
    if (matches.length > 0) return;
    setLoadingMatches(true);
    api.get(`/matches/${id}`)
      .then(r => { setMatches(r.data.matches); setMatchMeta({ aiEnabled: r.data.aiEnabled, aiScoredCount: r.data.aiScoredCount, aiProvider: r.data.aiProvider }); })
      .catch(() => toast.error('Failed to load matches'))
      .finally(() => setLoadingMatches(false));
  };

  useEffect(() => { if (activeTab === 'matches') loadMatches(); }, [activeTab]);

  const handleStatusChange = async (status) => {
    setStatusUpdating(true);
    try {
      await api.patch(`/customers/${id}/status`, { status });
      setCustomer(p => ({ ...p, status }));
      toast.success(`Status → ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setStatusUpdating(false); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const r = await api.post(`/customers/${id}/notes`, { text: noteText });
      setCustomer(r.data); setNoteText('');
      toast.success('Note saved');
    } catch { toast.error('Failed'); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (noteId) => {
    try { const r = await api.delete(`/customers/${id}/notes/${noteId}`); setCustomer(r.data); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const sentMatchIds = new Set((customer?.sentMatches || []).map(s => s.matchId));

  const filteredMatches = matches
    .filter(m => {
      const n = `${m.firstName} ${m.lastName}`.toLowerCase();
      if (!n.includes(matchSearch.toLowerCase()) && !m.city.toLowerCase().includes(matchSearch.toLowerCase())) return false;
      if (m.age < filters.ageMin || m.age > filters.ageMax) return false;
      if (m.income < filters.incomeMin) return false;
      if (filters.city !== 'Any' && m.city !== filters.city) return false;
      if (filters.religion !== 'Any' && m.religion !== filters.religion) return false;
      if (filters.kids !== 'Any' && m.wantKids !== filters.kids) return false;
      if (filters.relocate !== 'Any' && m.openToRelocate !== filters.relocate) return false;
      return true;
    })
    .sort((a, b) => matchSort === 'score' ? b.matchScore - a.matchScore : a.firstName.localeCompare(b.firstName));

  const activeFilters = Object.entries(filters).filter(([k, v]) => {
    if (k === 'ageMin' && v === 18) return false;
    if (k === 'ageMax' && v === 55) return false;
    if (k === 'incomeMin' && v === 0) return false;
    if (k === 'incomeMax') return false;
    if (v === 'Any' || v === 0) return false;
    return true;
  }).length;

  if (loadingCustomer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50/40">
        <Navbar />
        <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      </div>
    );
  }
  if (!customer) return <div className="text-center py-24 text-slate-400">Customer not found.</div>;

  const TABS = [
    { id: 'profile',  label: 'Profile',   icon: User },
    { id: 'matches',  label: matches.length > 0 ? `Matches (${matches.length})` : 'Matches', icon: Heart },
    { id: 'notes',    label: customer.notes?.length ? `Notes (${customer.notes.length})` : 'Notes', icon: FileText },
    { id: 'history',  label: customer.sentMatches?.length ? `Sent (${customer.sentMatches.length})` : 'Sent', icon: Send }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50/40">
      <Navbar />

      {/* ── Profile hero ── */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-rose-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-primary-200 hover:text-white text-sm font-medium mb-5 transition-colors">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
          <div className="flex items-start gap-5 flex-wrap">
            <Avatar name={`${customer.firstName} ${customer.lastName}`} gender={customer.gender} />
            <div className="flex-1 min-w-0 text-white">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-extrabold">{customer.firstName} {customer.lastName}</h1>
                <StatusBadge status={customer.status} />
                {customer.manglik && <span className="badge bg-red-500/30 text-red-100 border border-red-400/30 text-xs">Manglik</span>}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary-200">
                <span className="flex items-center gap-1"><MapPin size={13} />{customer.city}, {customer.country}</span>
                <span className="flex items-center gap-1"><Calendar size={13} />{customer.age} yrs · Born {customer.dateOfBirth}</span>
                <span className="flex items-center gap-1"><Briefcase size={13} />{customer.designation} at {customer.company}</span>
                <span className="flex items-center gap-1"><DollarSign size={13} />{fmt(customer.income)}</span>
              </div>
              {customer.about && <p className="text-primary-200/80 text-sm italic mt-2 max-w-xl">"{customer.about}"</p>}
            </div>
            <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-3 min-w-[160px]">
              <label className="text-xs text-primary-200 uppercase tracking-wider font-bold block mb-2">Update Status</label>
              <div className="relative">
                <select value={customer.status} onChange={e => handleStatusChange(e.target.value)} disabled={statusUpdating}
                  className="w-full bg-white/20 border border-white/30 rounded-xl py-2 pl-3 pr-8 text-white text-sm font-semibold appearance-none cursor-pointer focus:outline-none">
                  {STATUSES.map(s => <option key={s} className="text-slate-800">{s}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 pb-10">
        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-card mb-5 border border-rose-100/50 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all whitespace-nowrap min-w-[90px] ${
                activeTab === tab.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}>
              <tab.icon size={15} />{tab.label}
            </button>
          ))}
        </div>

        {/* ══ Profile Tab ══ */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            {/* Journey Funnel */}
            <JourneyFunnel status={customer.status} onStatusChange={handleStatusChange} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-base">
                  <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center"><User size={14} className="text-primary-600" /></div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Row label="Gender" value={customer.gender} />
                  <Row label="Religion" value={customer.religion} />
                  <Row label="Caste" value={customer.caste || '—'} />
                  <Row label="Marital Status" value={customer.maritalStatus} />
                  <Row label="Height" value={customer.height ? `${customer.height} cm` : '—'} />
                  <Row label="Horoscope" value={customer.horoscope} />
                  <Row label="Siblings" value={String(customer.siblings ?? '—')} />
                  <Row label="Family Type" value={customer.familyType} />
                  <Row label="Languages" value={(customer.languages || []).join(', ')} />
                  <Row label="Joined" value={customer.joinedDate} />
                </div>
              </div>
              <div className="card">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-base">
                  <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center"><Phone size={14} className="text-primary-600" /></div>
                  Contact & Education
                </h3>
                <div className="space-y-4">
                  <Row icon={Mail} label="Email" value={customer.email} />
                  <Row icon={Phone} label="Phone" value={customer.phone} />
                  <Row icon={GraduationCap} label="College" value={customer.college} />
                  <Row icon={GraduationCap} label="Degree" value={customer.degree} />
                  <Row icon={Building2} label="Company" value={customer.company} />
                  <Row icon={Briefcase} label="Designation" value={customer.designation} />
                  <Row icon={DollarSign} label="Annual Income" value={fmt(customer.income)} />
                </div>
              </div>
              <div className="card lg:col-span-2">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-base">
                  <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center"><Star size={14} className="text-primary-600" /></div>
                  Lifestyle & Preferences
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                  <LifestylePill label="Kids" value={customer.wantKids} highlight />
                  <LifestylePill label="Relocate" value={customer.openToRelocate} highlight />
                  <LifestylePill label="Pets" value={customer.openToPets} />
                  <LifestylePill label="Diet" value={customer.diet} />
                  <LifestylePill label="Smoking" value={customer.smoking} />
                  <LifestylePill label="Drinking" value={customer.drinking} />
                  <LifestylePill label="Family" value={customer.familyType} />
                  <LifestylePill label="Manglik" value={customer.manglik ? 'Yes' : 'No'} />
                  <LifestylePill label="Sign" value={customer.horoscope} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Matches Tab ══ */}
        {activeTab === 'matches' && (
          <div>
            {/* AI status banner */}
            {!loadingMatches && matches.length > 0 && (
              <div className={`rounded-2xl border p-3.5 mb-4 flex items-start gap-3 ${matchMeta.aiEnabled ? 'bg-violet-50 border-violet-200' : 'bg-amber-50 border-amber-200'}`}>
                {matchMeta.aiEnabled ? (
                  <><div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0"><Sparkles size={16} className="text-violet-600" /></div>
                  <div><p className="text-sm font-bold text-violet-800">AI-Powered Analysis Active ✨</p>
                    <p className="text-xs text-violet-600 mt-0.5">Top <strong>{matchMeta.aiScoredCount}</strong> matches scored by {matchMeta.aiProvider || 'AI'} · Includes category breakdown & AI explanations</p>
                  </div></>
                ) : (
                  <><div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0"><AlertCircle size={16} className="text-amber-600" /></div>
                  <div><p className="text-sm font-bold text-amber-800">Rule-Based Algorithm</p>
                    <p className="text-xs text-amber-600 mt-0.5">Add <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> to <code className="bg-amber-100 px-1 rounded">server/.env</code> and enable the API to get AI scoring + category breakdown</p>
                  </div></>
                )}
              </div>
            )}

            {/* Search + filter controls */}
            <div className="flex gap-3 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9 text-sm bg-white" placeholder="Search name, city…"
                  value={matchSearch} onChange={e => setMatchSearch(e.target.value)} />
              </div>
              <button onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || activeFilters > 0 ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>
                <SlidersHorizontal size={15} />
                Filters {activeFilters > 0 && <span className="bg-white/30 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{activeFilters}</span>}
              </button>
              <select className="input py-2.5 px-3 text-sm w-auto cursor-pointer bg-white"
                value={matchSort} onChange={e => setMatchSort(e.target.value)}>
                <option value="score">Best Match First</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>

            {showFilters && <SmartFilters matches={matches} filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />}

            {loadingMatches ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center"><Sparkles size={18} className="text-primary-500" /></div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Analysing profiles…</p>
                  <p className="text-xs text-slate-400 mt-1">{matchMeta.aiEnabled ? 'Gemini AI computing compatibility' : 'Running compatibility algorithm'}</p>
                </div>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Heart size={48} className="mx-auto mb-3 opacity-20" />
                <p>No matches found</p>
                {activeFilters > 0 && <button onClick={() => setFilters(DEFAULT_FILTERS)} className="mt-2 text-sm text-primary-500 font-semibold">Clear filters</button>}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-sm text-slate-500">
                    <span className="font-bold text-slate-700">{filteredMatches.length}</span> matches
                    {activeFilters > 0 && <span className="text-xs text-slate-400"> (filtered from {matches.length})</span>}
                    {matchMeta.aiEnabled && matchMeta.aiScoredCount > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                        <Sparkles size={10} /> {matchMeta.aiScoredCount} AI-scored
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3 text-xs text-slate-500">
                    {[['bg-emerald-500','🔥 High Potential'],['bg-blue-500','⭐ Strong'],['bg-amber-500','👍 Good']].map(([color,label]) => (
                      <span key={label} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${color}`}></span>{label}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMatches.map(m => (
                    <MatchCard key={m.id} match={m} customer={customer}
                      alreadySent={sentMatchIds.has(m.id)} onSendMatch={setSelectedMatch} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ Notes Tab ══ */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* AI Insights Panel */}
            <AIInsightsPanel customerId={id} insights={aiInsights} onInsights={setAiInsights} />

            {/* Add note */}
            <div className="card">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <PlusCircle size={16} className="text-primary-500" /> Add Note
              </h3>
              <textarea rows={3} className="input text-sm resize-none"
                placeholder="Notes from a call or meeting…"
                value={noteText} onChange={e => setNoteText(e.target.value)} />
              <button onClick={handleAddNote} disabled={addingNote || !noteText.trim()}
                className="btn-primary mt-3 disabled:opacity-40 disabled:cursor-not-allowed">
                {addingNote ? 'Saving…' : 'Save Note'}
              </button>
            </div>

            {!customer.notes?.length ? (
              <div className="text-center py-12 text-slate-400">
                <FileText size={40} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notes yet</p>
              </div>
            ) : customer.notes.map(note => (
              <div key={note.id} className="card border-l-4 border-l-primary-300">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-700 leading-relaxed flex-1">{note.text}</p>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <Clock size={11} />
                  {new Date(note.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  <span>·</span><span className="font-medium text-slate-500">{note.author}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ Sent History Tab ══ */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {!customer.sentMatches?.length ? (
              <div className="text-center py-16 text-slate-400">
                <Send size={40} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No matches sent yet</p>
              </div>
            ) : customer.sentMatches.map(rec => (
              <div key={rec.id} className="card">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {rec.matchName?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{rec.matchName}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Clock size={10} />
                        {new Date(rec.sentAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        <span>·</span><TrendingUp size={10} /> Score: {rec.score}%
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100 gap-1">
                    <CheckCircle2 size={11} /> Introduction Sent
                  </span>
                </div>
                {rec.introText && (
                  <details className="mt-3 group">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 select-none">View email sent →</summary>
                    <pre className="mt-2 text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-xl p-3 leading-relaxed font-sans border border-slate-100">{rec.introText}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMatch && (
        <SendMatchModal customer={customer} match={selectedMatch}
          onClose={() => setSelectedMatch(null)} onSent={fetchCustomer} />
      )}
    </div>
  );
}
