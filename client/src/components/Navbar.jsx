import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-rose-100/70 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between py-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-rose-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Heart size={15} className="text-white fill-white" />
          </div>
          <div className="leading-none">
            <span className="font-extrabold text-slate-800 text-[15px] block">The Date Crew</span>
            <span className="text-[9px] text-primary-500 font-bold uppercase tracking-widest">Matchmaker</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {!onDashboard && (
            <Link to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 font-semibold transition-colors px-3 py-1.5 rounded-xl hover:bg-primary-50">
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-[13px] font-bold text-slate-800 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400">{user.role}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-rose-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                {user.avatar || user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <button onClick={handleLogout}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
