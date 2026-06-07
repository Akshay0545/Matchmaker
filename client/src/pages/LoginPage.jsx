import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Heart, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please enter your credentials');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      toast.success(`Welcome back, ${user.name}! 💖`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-rose-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart size={22} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">The Date Crew</span>
          </div>
          <p className="text-primary-200 text-sm">Internal Matchmaker Platform</p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-gold-300" />
            <span className="text-gold-300 text-sm font-semibold uppercase tracking-widest">Matchmaker Portal</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Where Every<br />
            Story Begins <span className="text-gold-300">✨</span>
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-sm">
            Our intelligent platform helps you find the most compatible matches for your clients using our proprietary compatibility algorithm.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-primary-300 text-sm">Happy Couples</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold">100%</div>
            <div className="text-primary-300 text-sm">Verified Profiles</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold">AI</div>
            <div className="text-primary-300 text-sm">Powered Matching</div>
          </div>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <Heart size={18} className="text-primary-600 fill-primary-600" />
            </div>
            <span className="text-xl font-bold text-primary-800">The Date Crew</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome back 👋</h2>
            <p className="text-slate-500">Sign in to your matchmaker dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. matchmaker1"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-3 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Heart size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-5 bg-primary-50 rounded-2xl border border-primary-100">
            <p className="text-sm font-semibold text-primary-800 mb-3">Demo Credentials</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Username</span>
                <span className="font-mono font-semibold text-slate-700">matchmaker1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password</span>
                <span className="font-mono font-semibold text-slate-700">tdc@2024</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            © 2024 The Date Crew · Powered by Love & AI 💖
          </p>
        </div>
      </div>
    </div>
  );
}
