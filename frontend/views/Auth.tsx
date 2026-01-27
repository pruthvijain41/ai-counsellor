
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Github, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface AuthProps {
  mode: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    let success = false;

    if (mode === 'signup') {
      success = await signUp(formData.email, formData.password, formData.fullName);
      if (success) {
        navigate('/onboarding');
      }
    } else {
      success = await signIn(formData.email, formData.password);
      if (success) {
        // Check if onboarded, redirect accordingly
        const profile = useAuthStore.getState().profile;
        if (profile?.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white selection:bg-orange-500 selection:text-white font-sans">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-10 md:px-24 py-20">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12 text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-1 mb-16">
              <span className="text-orange-500 font-bold text-3xl bebas tracking-tighter">AI</span>
              <span className="text-slate-900 font-bold text-3xl bebas tracking-tighter">COUNSELLOR</span>
            </Link>
            <h1 className="text-5xl font-bold text-slate-900 mb-4 bebas tracking-widest uppercase">
              {mode === 'login' ? 'Welcome Back' : 'Join the Elite'}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              {mode === 'login'
                ? 'Continue your journey to global excellence'
                : 'Architect your academic future today'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-900"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gmail.com"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-900"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                {mode === 'login' && <a href="#" className="text-[10px] text-orange-500 font-bold uppercase tracking-widest hover:underline">Reset?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-900"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Login' : 'Register'} <ArrowRight size={16} />
                </>
              )}
            </button>


          </form>

          <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {mode === 'login' ? "New candidate?" : "Already registered?"}{' '}
            <Link to={mode === 'login' ? '/signup' : '/login'} className="text-orange-500 hover:underline">
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative Side - Matched Landing Aesthetic */}
      <div className="hidden lg:block w-[45%] bg-slate-900 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
          alt="Mountains"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-black"></div>

        {/* Dynamic Visual Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white px-20 text-center">
          <div className="mb-12 relative">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-white shadow-2xl flex items-center justify-center relative orange-glow border-[10px] border-orange-500/5 floating">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full"></div>
              <User size={120} className="text-orange-500 drop-shadow-2xl" strokeWidth={1} />
            </div>

            {/* Accents */}
            <div className="absolute top-0 -right-4 w-20 h-1 bg-orange-500 rotate-45 rounded-full shadow-lg shadow-orange-500/40"></div>
            <div className="absolute bottom-0 -left-4 w-20 h-1 bg-orange-500 rotate-45 rounded-full shadow-lg shadow-orange-500/40"></div>
          </div>

          <h2 className="text-5xl font-bold mb-6 bebas tracking-[0.2em] text-white">ENGINEERED SUCCESS</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] leading-loose max-w-sm">
            Access global data networks and precision AI matching to secure your seat at the world's leading universities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
