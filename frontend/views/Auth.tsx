
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import SmartStrategy from '../components/SmartStrategy';

interface AuthProps {
  mode: 'login' | 'signup';
}

const loadingFacts = [
  "Waking up the AI Core... This usually takes 45 seconds on the free tier.",
  "Did you know? Students using AI apply to 30% more scholarships.",
  "Establishing secure handshake with the global university database.",
  "Calculating match probabilities for 4,000+ institutions.",
  "Almost there! The server is warming up for your session.",
  "Did you know? Germany offers tuition-free education at public universities for all international students.",
  "Did you know? Canada's PGWP allows you to work for up to 3 years after graduating.",
  "Did you know? The UK’s Graduate Route visa lets you stay for 2 years after your degree.",
  "Did you know? International students contribute over $40 billion annually to the US economy.",
  "Did you know? Australia has some of the world's most student-friendly cities like Melbourne.",
  "Did you know? AI Counsellor analyzes your profile against 4,000+ institutions in seconds."
];

const LoadingMessage = () => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingFacts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.p
      key={index}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="text-xs text-slate-600 leading-relaxed font-medium transition-all"
    >
      {loadingFacts[index]}
    </motion.p>
  );
};

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
    <div className="min-h-screen flex items-stretch bg-white selection:bg-amber-500 selection:text-white grain overflow-hidden lexend">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-10 md:px-24 py-6 relative z-10 overflow-y-auto lg:overflow-visible no-scrollbar">
        <div className="absolute inset-0 -z-10 mesh-gradient opacity-20"></div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-6 text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-1.5 mb-6 hover:scale-105 transition-transform">
              <span className="text-amber-500 font-black text-2xl outfit tracking-tighter">AI</span>
              <span className="text-slate-900 font-bold text-2xl outfit tracking-tighter">COUNSELLOR</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 outfit tracking-tighter leading-none uppercase">
                {mode === 'login' ? 'Welcome Back' : 'Join the Elite'}
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px] outfit">
                {mode === 'login'
                  ? 'Continue your journey to global excellence'
                  : 'Architect your academic future today'}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="crystal-card p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem]"
          >
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-wider outfit">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 outfit">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full pl-14 pr-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-semibold text-slate-900 outfit text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 outfit">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full pl-14 pr-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-semibold text-slate-900 outfit text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 outfit">Secure Password</label>
                  {mode === 'login' && <a href="#" className="text-[9px] text-amber-500 font-black uppercase tracking-widest hover:underline outfit">Reset?</a>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-semibold text-slate-900 outfit text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-amber-500 transition-all shadow-2xl shadow-slate-200/50 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed outfit mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Synchronizing...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Login' : 'Register'} <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Enhanced Cold Start Loading Overlay */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-amber-50/50 border border-amber-100 rounded-[2rem] relative overflow-hidden"
                >
                  {/* Progress Bar background */}
                  <div className="absolute bottom-0 left-0 h-1 bg-amber-500/10 w-full">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 45, ease: "linear" }}
                      className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white shadow-sm border border-amber-100 rounded-full flex items-center justify-center">
                          <Loader2 size={14} className="animate-spin text-amber-500" />
                        </div>
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest outfit">System Booting</span>
                      </div>
                      <span className="text-[9px] font-black text-amber-500 bg-white border border-amber-100 px-3 py-1 rounded-full uppercase tracking-widest outfit">Est. 45s</span>
                    </div>

                    <div className="space-y-4">
                      {/* Rotating Facts / Messages */}
                      <div className="min-h-[32px] flex items-center">
                        <LoadingMessage />
                      </div>

                      <div className="pt-3 border-t border-amber-200/40">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 outfit">
                          <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                          Diagnostics
                        </p>
                        <ul className="text-[8px] text-slate-500 font-bold space-y-1 ml-3 outfit opacity-80 uppercase tracking-wider">
                          <li>• Signal sent to admission network</li>
                          <li>• Database handshake in progress</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>

          <p className="mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] outfit">
            {mode === 'login' ? "New candidate?" : "Already registered?"}{' '}
            <Link to={mode === 'login' ? '/signup' : '/login'} className="text-amber-500 hover:text-amber-600 transition-colors font-black ml-1">
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative Side */}
      <div className="hidden lg:block w-[45%] bg-white relative overflow-hidden border-l border-slate-100 grain">
        <div className="absolute inset-0 -z-10 mesh-gradient opacity-40"></div>

        {/* Background Giant Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <h1 className="outfit font-black text-[18vw] leading-none text-slate-900 select-none flex flex-col items-center tracking-tighter">
            <span>DREAM</span>
            <span>BUILD</span>
          </h1>
        </div>

        {/* Dynamic Visual Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-12 text-center">
          <div className="mb-12">
            <SmartStrategy size="md" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h2 className="text-5xl font-black mb-6 outfit tracking-tighter text-slate-900 uppercase leading-[0.9]">PRECISION<br />SUCCESS</h2>
            <div className="w-12 h-1.5 bg-amber-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em] leading-loose max-w-sm mx-auto outfit opacity-80">
              Access global data networks and precision AI matching to secure your seat at the world's leading universities.
            </p>
          </motion.div>
        </div>

        {/* Subtle Accents */}
        <div className="absolute top-12 right-12 w-40 h-40 border border-amber-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-12 left-12 w-64 h-64 border border-amber-50 rounded-full opacity-30"></div>
      </div>
    </div>
  );
};

export default Auth;
