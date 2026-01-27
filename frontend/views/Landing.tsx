import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  MapPin,
  Sparkles,
  ClipboardCheck,
  Users,
  Globe,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  Cpu,
  BrainCircuit,
  Database,
  Network,
  ShieldCheck
} from 'lucide-react';
import SmartStrategy from '../components/SmartStrategy';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-orange-500 selection:text-white bg-white">
      {/* Background Scenic Elements */}
      <div className="absolute inset-0 -z-20">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover opacity-10 grayscale"
          alt="Mountains"
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      </div>

      {/* Floating Capsule Navbar */}
      <div className="fixed top-4 md:top-8 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="glass-nav rounded-full px-4 md:px-8 py-2 md:py-2.5 flex items-center justify-between gap-2 md:gap-12 capsule-shadow min-w-[280px] md:min-w-[400px] max-w-7xl">
          <div className="flex items-center gap-1 pr-3 md:pr-6 border-r border-slate-100/50">
            <span className="text-orange-500 font-bold text-base md:text-xl bebas tracking-tighter">AI</span>
            <span className="text-slate-900 font-bold text-base md:text-xl bebas tracking-tighter">COUNSELLOR</span>
          </div>

          <div className="flex items-center gap-3 md:gap-8">
            <Link to="/login" className="hidden sm:block text-[10px] md:text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors uppercase tracking-widest">
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 md:px-7 py-2 md:py-2.5 bg-slate-900 text-white rounded-full font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-40">
        {/* Giant Background Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <h1 className="hero-bg-text bebas select-none flex flex-col items-center gap-2 md:flex-row md:gap-16">
            <span>FUTURE</span>
            <span>LEARN</span>
          </h1>
        </motion.div>

        {/* 100x Better Neural Strategy Engine Visual - CONTENT RESTORED */}
        <SmartStrategy />

        {/* Content Overlays - TEXT RESTORED */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-20 text-center max-w-3xl px-6"
        >
          <h2 className="text-2xl md:text-5xl font-semibold text-slate-900 mb-4 tracking-tight leading-tight">
            Plan Your Journey with a<br className="hidden md:block" /> Guided AI Counsellor
          </h2>
          <p className="text-slate-500 font-medium mb-12 md:text-xl max-w-xl mx-auto leading-relaxed">
            From profile building to university shortlisting — get step-by-step guidance powered by AI that truly understands
          </p>
          <div className="flex flex-col items-center gap-6">
            <Link
              to="/signup"
              className="px-10 py-4 md:px-14 md:py-5 bg-slate-900 text-white rounded-full font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95"
            >
              Start Your Journey
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">
                Login
              </Link>
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
              <a href="#features" className="text-[10px] font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-[0.2em]">
                Learn More
              </a>
            </div>
          </div>
        </motion.div>

        {/* Mist Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-64 md:h-96 mist-overlay z-10 pointer-events-none"></div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-30 -mt-24 md:-mt-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-nav rounded-[2.5rem] md:rounded-[3rem] p-1.5 md:p-2 capsule-shadow border border-slate-200/50 overflow-hidden">
            <div className="bg-white/40 rounded-[2.2rem] md:rounded-[2.5rem] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {[
                { label: 'Universities', value: '4,500+', icon: GraduationCap, detail: 'GLOBAL NETWORK' },
                { label: 'Countries', value: '30+', icon: Globe, detail: 'STRATEGIC HUBS' },
                { label: 'Students', value: '250K+', icon: Users, detail: 'ACTIVE TALENT' },
                { label: 'Victory Rate', value: '98%', icon: Sparkles, detail: 'AI PRECISION' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex flex-col items-center py-6 md:py-10 px-2 md:px-4 group hover:bg-white/60 transition-all duration-500"
                >
                  <div className="mb-2 md:mb-4 text-orange-500 group-hover:scale-125 transition-all duration-700">
                    <stat.icon size={18} className="md:w-6 md:h-6" strokeWidth={1.5} />
                  </div>
                  <p className="text-xl md:text-4xl font-extrabold text-slate-900 bebas tracking-widest mb-0.5">{stat.value}</p>
                  <p className="text-[7px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                  <div className="mt-2 md:mt-4 flex items-center gap-1">
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[6px] md:text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{stat.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights - TEXT RESTORED */}
      <section id="features" className="relative z-20 py-24 md:py-48 bg-white px-6 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-50 -z-10 hidden md:block"></div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 md:gap-12">
            {[
              {
                title: 'PROFILE DIAGNOSTIC',
                subtitle: 'PRECISION ANALYSIS',
                desc: 'Strategic academic evaluation to identify your competitive edge for global rankings.',
                icon: Activity,
                color: 'orange'
              },
              {
                title: 'INTELLIGENT MATCH',
                subtitle: 'ALGORITHMIC FIT',
                desc: 'AI-driven university matching based on tuition, ranking, and acceptance probabilities.',
                icon: Layers,
                color: 'slate'
              },
              {
                title: 'VICTORY ROADMAP',
                subtitle: 'GUIDED EXECUTION',
                desc: 'End-to-end task tracking and AI documentation support to ensure your success.',
                icon: ShieldCheck,
                color: 'orange'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="flex-1 relative group"
              >
                <div className="absolute -top-10 md:-top-12 -left-2 md:-left-4 text-6xl md:text-9xl font-bold text-slate-50/70 bebas pointer-events-none select-none transition-colors duration-500">
                  0{i + 1}
                </div>

                <div className="relative z-10 p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] shadow-xl border-orange-100">
                  <motion.div
                    initial={{ scale: 0.8, backgroundColor: "rgb(248, 250, 252)" }} // slate-50
                    whileInView={{ scale: 1.1, backgroundColor: "rgb(249, 115, 22)" }} // orange-500
                    transition={{ duration: 0.6, delay: i * 0.2 + 0.4 }}
                    className="mb-6 md:mb-8 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white"
                  >
                    <feature.icon size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
                  </motion.div>

                  <p className="text-[9px] md:text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-2">{feature.subtitle}</p>
                  <motion.h3
                    initial={{ color: "rgb(15, 23, 42)" }} // slate-900
                    whileInView={{ color: "rgb(249, 115, 22)" }} // orange-500
                    transition={{ duration: 0.6, delay: i * 0.2 + 0.5 }}
                    className="bebas text-3xl md:text-4xl mb-4 md:mb-6 tracking-widest leading-none"
                  >
                    {feature.title}
                  </motion.h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium mb-6 md:mb-8">
                    {feature.desc}
                  </p>

                  <div className="flex items-center gap-2 pt-4 md:pt-6 border-t border-slate-50">
                    <motion.div
                      initial={{ width: "2rem", backgroundColor: "rgb(241, 245, 249)" }} // slate-100
                      whileInView={{ width: "4rem", backgroundColor: "rgb(249, 115, 22)" }} // orange-500
                      transition={{ duration: 0.6, delay: i * 0.2 + 0.6 }}
                      className="h-1 rounded-full"
                    />
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-900 uppercase tracking-widest">SYSTEM READY</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - TEXT RESTORED */}
      <section className="relative z-20 py-24 md:py-32 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 bebas tracking-widest uppercase">THE SUCCESS PATHWAY</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-slate-200 z-0"></div>
            {[
              { step: '01', title: 'BUILD PROFILE', desc: 'Input your academic and personal milestones.' },
              { step: '02', title: 'DISCOVER', desc: 'Explore AI-curated university recommendations.' },
              { step: '03', title: 'SHORTLIST', desc: 'Select institutions and lock your primary goals.' },
              { step: '04', title: 'APPLY', desc: 'Follow a custom checklist for every submission.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative z-10 text-center group"
              >
                <motion.div
                  initial={{ scale: 0.8, color: "rgb(203, 213, 225)", borderColor: "rgb(248, 250, 249)" }} // slate-300, slate-50
                  whileInView={{ scale: 1.1, color: "rgb(249, 115, 22)", borderColor: "rgb(249, 115, 22)" }} // orange-500
                  transition={{ duration: 0.6, delay: i * 0.2 + 0.3 }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mx-auto mb-6 md:mb-8 shadow-xl border-4 bebas tracking-tighter"
                >
                  {item.step}
                </motion.div>
                <motion.h3
                  initial={{ color: "rgb(15, 23, 42)" }} // slate-900
                  whileInView={{ color: "rgb(249, 115, 22)" }} // orange-500
                  transition={{ duration: 0.6, delay: i * 0.2 + 0.4 }}
                  className="text-base md:text-lg font-bold mb-2 md:mb-3 tracking-tight"
                >
                  {item.title}
                </motion.h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-900 py-16 md:py-24 px-6 border-t border-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-12 border-b border-slate-100 pb-12 md:pb-16 text-center md:text-left">
            <div className="flex items-center gap-1">
              <span className="text-orange-500 font-bold text-3xl md:text-4xl tracking-tighter bebas">AI</span>
              <span className="text-slate-900 font-bold text-3xl md:text-4xl tracking-tighter bebas">COUNSELLOR</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-slate-400 font-bold text-[9px] md:text-xs uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-orange-500 transition-colors">Universities</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Support</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Success</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="px-6 md:px-8 py-2.5 md:py-3 bg-slate-900 text-white rounded-full font-bold text-[9px] md:text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200">
                Get Started <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>

          <div className="mt-12 md:mt-16 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
            <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">© 2024 AI COUNSELLOR • ENGINEERED FOR SUCCESS</p>
            <div className="flex gap-6 md:gap-8 text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;