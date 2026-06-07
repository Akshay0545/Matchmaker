import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, SlidersHorizontal, Heart, TrendingUp, Clock,
  CheckCircle2, ChevronRight, UserRound, Sparkles, Filter, MapPin,
  Briefcase, Star, ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['All', 'New', 'Profiling', 'Searching', 'Active', 'Matched', 'On Hold', 'Closed'];

const STATUS_COLORS = {
  New: 'bg-slate-100 text-slate-600',
  Profiling: 'bg-blue-100 text-blue-700',
  Searching: 'bg-amber-100 text-amber-700',
  Active: 'bg-emerald-100 text-emerald-700',
  Matched: 'bg-rose-100 text-rose-700',
  'On Hold': 'bg-orange-100 text-orange-700',
  Closed: 'bg-slate-100 text-slate-500'
};

function Avatar({ name, gender, size = 'md' }) {
  const initials = [name?.split(' ')[0]?.[0], name?.split(' ')[1]?.[0]].filter(Boolean).join('');
  const g = gender === 'Female'
    ? 'from-fuchsia-400 via-pink-400 to-rose-500'
    : 'from-blue-400 via-indigo-500 to-violet-500';
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-md`}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, from, to, subtext }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${to} p-5 text-white shadow-lg`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-4xl font-extrabold">{value}</p>
          {subtext && <p className="text-white/60 text-xs mt-1">{subtext}</p>}
        </div>
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  useEffect(() => {
    api.get('/customers')
      .then(r => setCustomers(r.data))
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: customers.length,
    active: customers.filter(c => ['Active', 'Searching'].includes(c.status)).length,
    matched: customers.filter(c => c.status === 'Matched').length,
    new: customers.filter(c => c.status === 'New').length
  };

  const filtered = customers.filter(c => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = name.includes(q) || c.city.toLowerCase().includes(q) || c.designation?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchGender = genderFilter === 'All' || c.gender === genderFilter;
    return matchSearch && matchStatus && matchGender;
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50/40">
      <Navbar />

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-rose-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-rose-50/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-gold-300 fill-gold-300" />
                <span className="text-gold-300 text-xs font-bold uppercase tracking-widest">Matchmaker Dashboard</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight">
                {greeting}, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-primary-200 mt-1 text-sm">
                You have <span className="text-white font-bold">{stats.active}</span> clients actively searching · <span className="text-white font-bold">{stats.new}</span> new this month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 text-white text-center min-w-[80px]">
                <div className="text-2xl font-extrabold">{stats.matched}</div>
                <div className="text-xs text-primary-200">Matched 💑</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 text-white text-center min-w-[80px]">
                <div className="text-2xl font-extrabold">{stats.total}</div>
                <div className="text-xs text-primary-200">Total Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-10">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="Total Clients" value={stats.total} icon={Users}
            from="from-primary-500" to="to-rose-600" subtext={`${stats.active} actively looking`} />
          <StatCard label="Searching" value={stats.active} icon={TrendingUp}
            from="from-emerald-400" to="to-teal-600" subtext="Active pipeline" />
          <StatCard label="Matched" value={stats.matched} icon={Heart}
            from="from-pink-500" to="to-fuchsia-600" subtext="Successful matches" />
          <StatCard label="New Joiners" value={stats.new} icon={Clock}
            from="from-amber-400" to="to-orange-500" subtext="Awaiting profiling" />
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-5 border border-rose-100/60">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10 bg-slate-50 border-slate-200 text-sm"
                placeholder="Search name, city, designation…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="input py-2.5 px-3 text-sm cursor-pointer bg-slate-50 border-slate-200 flex-shrink-0"
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value)}
              >
                <option value="All">All Genders</option>
                <option value="Male">♂ Male</option>
                <option value="Female">♀ Female</option>
              </select>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                {['list', 'grid'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${viewMode === mode ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                    {mode === 'list' ? '≡ List' : '⊞ Grid'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 mt-3 flex-wrap">
            <Filter size={13} className="text-slate-400 self-center mr-1" />
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Client Listing ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm">Loading clients…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <UserRound size={52} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-medium">No clients match your filter</p>
            <button onClick={() => { setSearch(''); setStatusFilter('All'); setGenderFilter('All'); }}
              className="mt-3 text-sm text-primary-500 hover:text-primary-700 font-semibold">
              Clear filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2.5">
            {filtered.map(c => <ListCard key={c.id} customer={c} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(c => <GridCard key={c.id} customer={c} />)}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          Showing {filtered.length} of {customers.length} clients
        </p>
      </div>
    </div>
  );
}

function ListCard({ customer: c }) {
  return (
    <Link to={`/customer/${c.id}`}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-warm transition-all duration-200 flex items-center gap-4 px-5 py-4">
      <Avatar name={`${c.firstName} ${c.lastName}`} gender={c.gender} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 text-base">{c.firstName} {c.lastName}</span>
          <StatusBadge status={c.status} />
        </div>
        <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1"><MapPin size={11} />{c.city}</span>
          <span className="text-slate-300">·</span>
          <span>{c.age} yrs</span>
          <span className="text-slate-300">·</span>
          <span>{c.gender === 'Male' ? '♂' : '♀'}</span>
          <span className="text-slate-300">·</span>
          <span>{c.maritalStatus}</span>
        </div>
      </div>
      <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0 text-right">
        <span className="text-sm font-semibold text-slate-700">{c.designation}</span>
        <span className="text-xs text-slate-400">{c.company}</span>
      </div>
      <div className="hidden lg:block flex-shrink-0">
        <span className="text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-lg font-medium">
          {c.religion} {c.caste ? `· ${c.caste}` : ''}
        </span>
      </div>
      <ChevronRight size={17} className="text-slate-300 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
    </Link>
  );
}

function GridCard({ customer: c }) {
  return (
    <Link to={`/customer/${c.id}`}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-warm transition-all duration-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Avatar name={`${c.firstName} ${c.lastName}`} gender={c.gender} size="lg" />
        <StatusBadge status={c.status} />
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-base">{c.firstName} {c.lastName}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{c.age} yrs · {c.maritalStatus}</p>
      </div>
      <div className="space-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><MapPin size={11} className="text-primary-400" />{c.city}</div>
        <div className="flex items-center gap-1.5"><Briefcase size={11} className="text-primary-400" />{c.designation}</div>
        <div className="flex items-center gap-1.5"><Star size={11} className="text-primary-400" />{c.religion} {c.caste ? `· ${c.caste}` : ''}</div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">{c.company}</span>
        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
      </div>
    </Link>
  );
}
