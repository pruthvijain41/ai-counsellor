
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Github, Loader2, GraduationCap } from 'lucide-react';
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
    <div className="min-h-screen flex items-stretch bg-white selection:bg-orange-500 selection:text-white font-sans">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-10 md:px-24 py-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-6 text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-1 mb-8">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-14 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-900"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gmail.com"
                  className="w-full pl-14 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-900"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
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
                  className="w-full pl-14 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-900"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Connecting...
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] relative overflow-hidden"
              >
                {/* Progress Bar background */}
                <div className="absolute bottom-0 left-0 h-1 bg-orange-500/10 w-full">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 45, ease: "linear" }}
                    className="h-full bg-orange-500"
                  />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin text-orange-500" />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">System Booting</span>
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-tighter">Est. 45s</span>
                  </div>

                  <div className="space-y-4">
                    {/* Rotating Facts / Messages */}
                    <div className="min-h-[40px]">
                      <LoadingMessage />
                    </div>

                    <div className="pt-4 border-t border-slate-200/60">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        Troubleshooting
                      </p>
                      <ul className="text-[10px] text-slate-500 font-medium space-y-1.5 ml-3.5">
                        <li>• Avoid refreshing for the first 60 seconds.</li>
                        <li>• If login fails, your "Wake Signal" was still sent—try again immediately.</li>
                        <li>• Check your internet connection if the bar stops moving.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


          </form>

          <p className="mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {mode === 'login' ? "New candidate?" : "Already registered?"}{' '}
            <Link to={mode === 'login' ? '/signup' : '/login'} className="text-orange-500 hover:underline">
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative Side - Matched Landing Aesthetic */}
      <div className="hidden lg:block w-[45%] bg-white relative overflow-hidden border-l border-slate-100">
        {/* Background Giant Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <h1 className="bebas text-[15vw] leading-none text-slate-900 select-none flex flex-col items-center">
            <span>FUTURE</span>
            <span>LEARN</span>
          </h1>
        </div>

        {/* Dynamic Visual Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-10 text-center">
          <div className="mb-8">
            <SmartStrategy size="md" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-5xl font-bold mb-4 bebas tracking-[0.2em] text-slate-900">ENGINEERED SUCCESS</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] leading-loose max-w-sm mx-auto">
              Access global data networks and precision AI matching to secure your seat at the world's leading universities.
            </p>
          </motion.div>
        </div>

        {/* Subtle Accents */}
        <div className="absolute top-10 right-10 w-32 h-32 border border-slate-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 border border-slate-50 rounded-full opacity-50"></div>
      </div>
    </div>
  );
};

export default Auth;
