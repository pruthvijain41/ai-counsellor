import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  Users,
  Globe,
  ArrowRight,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';
import SmartStrategy from '../components/SmartStrategy';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-amber-500 selection:text-white bg-white grain lexend">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 -z-20 mesh-gradient opacity-60"></div>
      <div className="absolute inset-0 -z-10 bg-white/60"></div>

      {/* Floating Capsule Navbar */}
      <div className="fixed top-6 md:top-8 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="glass-nav rounded-full px-4 md:px-8 py-2 md:py-3 flex items-center justify-between gap-4 md:gap-12 capsule-shadow min-w-[300px] md:min-w-[500px] max-w-7xl border border-white/20">
          <div className="flex items-center gap-1.5 pr-4 md:pr-8 border-r border-slate-200/50">
            <span className="text-amber-500 font-black text-lg md:text-2xl outfit tracking-tighter">AI</span>
            <span className="text-slate-900 font-bold text-lg md:text-2xl outfit tracking-tighter">COUNSELLOR</span>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/login" className="hidden sm:block text-[10px] md:text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-[0.2em]">
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 md:px-8 py-2 md:py-3 bg-slate-900 text-white rounded-full font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-slate-200/50 hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden">
        {/* Giant Background Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ willChange: 'transform, opacity' }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <h1 className="hero-bg-text flex flex-col items-center gap-4 md:flex-row md:gap-24">
            <span>DREAM</span>
            <span>BUILD</span>
          </h1>
        </motion.div>

        {/* 100x Better Neural Strategy Engine Visual */}
        <SmartStrategy />

        {/* Content Overlays */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ willChange: 'transform, opacity' }}
          className="relative z-20 text-center max-w-4xl px-6 mt-12 md:mt-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full mb-8">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-widest">The Future of Abroad Counseling</span>
          </div>

          <h2 className="heading-xl text-3xl md:text-6xl text-slate-900 mb-6 leading-[0.95] tracking-tighter">
            Architect Your Future<br /> with <span className="text-amber-500 underline decoration-amber-200/50 underline-offset-8">Precision AI</span>
          </h2>
          <p className="text-slate-500 font-medium mb-10 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Our guided AI platform transforms complex study-abroad decisions into a clear, execution-ready roadmap.
          </p>
          <div className="flex flex-col items-center gap-8">
            <Link
              to="/signup"
              className="group relative px-12 py-5 md:px-16 md:py-6 bg-slate-900 text-white rounded-full font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-amber-500 transition-all shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Masterplan <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <div className="flex items-center gap-8">
              <a href="#features" className="text-[11px] font-bold text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-[0.25em]">
                Explore System
              </a>
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
              <Link to="/login" className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.25em]">
                Partner Login
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Mist Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-64 md:h-96 mist-overlay z-10 pointer-events-none"></div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-30 -mt-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-nav rounded-[2.5rem] md:rounded-[4rem] p-1.5 md:p-3 capsule-shadow border border-white/40 overflow-hidden">
            <div className="bg-white/40 rounded-[2.2rem] md:rounded-[3.2rem] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {[
                { label: 'Partners', value: '4,500+', icon: GraduationCap, detail: 'GLOBAL REACH' },
                { label: 'Regions', value: '32+', icon: Globe, detail: 'STRATEGIC HUBS' },
                { label: 'Users', value: '250K+', icon: Users, detail: 'SUCCESSFUL JOURNEYS' },
                { label: 'Success', value: '98%', icon: Sparkles, detail: 'VERIFIED RATE' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ willChange: 'transform, opacity' }}
                  className="flex flex-col items-center py-6 md:py-12 px-2 md:px-4 group hover:bg-white/80 transition-all duration-500"
                >
                  <div className="mb-3 md:mb-5 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                    <stat.icon size={20} className="md:w-7 md:h-7" strokeWidth={1.5} />
                  </div>
                  <p className="text-2xl md:text-5xl font-black text-slate-900 outfit tracking-tight mb-1">{stat.value}</p>
                  <p className="text-[8px] md:text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em]">{stat.label}</p>
                  <div className="mt-3 md:mt-5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[7px] md:text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{stat.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="relative z-20 py-32 md:py-56 bg-white px-6 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-50 -z-10 hidden md:block"></div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            {[
              {
                title: 'PROFILE DIAGNOSTIC',
                subtitle: 'SYSTEM ANALYSIS',
                desc: 'Strategic academic evaluation to identify your competitive edge for global rankings.',
                icon: Activity,
                color: 'indigo'
              },
              {
                title: 'INTELLIGENT MATCH',
                subtitle: 'ALGORITHMIC FIT',
                desc: 'AI-driven university matching based on tuition, ranking, and acceptance probabilities.',
                icon: Layers,
                color: 'amber'
              },
              {
                title: 'VICTORY ROADMAP',
                subtitle: 'GUIDED EXECUTION',
                desc: 'End-to-end task tracking and AI documentation support to ensure your success.',
                icon: ShieldCheck,
                color: 'indigo'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ willChange: 'transform, opacity' }}
                className="flex-1 relative group"
              >
                <div className="absolute -top-12 md:-top-16 -left-4 md:-left-6 text-7xl md:text-[10rem] font-bold text-slate-50/80 outfit pointer-events-none select-none transition-colors duration-500">
                  0{i + 1}
                </div>

                <div className="relative z-10 p-10 md:p-14 crystal-card rounded-[3rem] md:rounded-[4rem]">
                  <motion.div
                    initial={{ scale: 0.8, backgroundColor: "rgb(248, 250, 252)" }} // slate-50
                    whileInView={{ scale: 1.1, backgroundColor: "rgb(245, 158, 11)" }} // amber-500
                    transition={{ duration: 0.6, delay: i * 0.2 + 0.4 }}
                    className="mb-8 md:mb-10 w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20"
                  >
                    <feature.icon size={32} className="md:w-10 md:h-10" strokeWidth={1.5} />
                  </motion.div>

                  <p className="text-[10px] md:text-[12px] font-bold text-amber-600 uppercase tracking-[0.35em] mb-3">{feature.subtitle}</p>
                  <motion.h3
                    className="outfit text-3xl md:text-5xl font-extrabold mb-6 md:mb-8 tracking-tight leading-none"
                  >
                    {feature.title}
                  </motion.h3>
                  <p className="text-sm md:text-lg text-slate-500 leading-relaxed font-medium mb-8 md:mb-10">
                    {feature.desc}
                  </p>

                  <div className="flex items-center gap-3 pt-6 md:pt-10 border-t border-slate-100">
                    <motion.div
                      initial={{ width: "2rem", backgroundColor: "rgb(241, 245, 249)" }} // slate-100
                      whileInView={{ width: "5rem", backgroundColor: "rgb(245, 158, 11)" }} // amber-500
                      transition={{ duration: 0.6, delay: i * 0.2 + 0.6 }}
                      className="h-1.5 rounded-full"
                    />
                    <span className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest outfit">READY</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-20 py-24 md:py-40 bg-slate-50/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 md:mb-28">
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 outfit tracking-tighter uppercase leading-none">THE AI SUCCESS<br />PATHWAY</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-slate-200 z-0 opacity-50"></div>
            {[
              { step: '01', title: 'BUILD PROFILE', desc: 'Securely sync your academic milestones.' },
              { step: '02', title: 'DISCOVER', desc: 'Curated recommendations powered by massive data.' },
              { step: '03', title: 'SHORTLIST', desc: 'Strategically lock your primary goals.' },
              { step: '04', title: 'APPLY', desc: 'Guided execution for every submission.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ willChange: 'transform, opacity' }}
                className="relative z-10 text-center group"
              >
                <motion.div
                  initial={{ scale: 0.8, color: "rgb(203, 213, 225)", borderColor: "rgb(248, 250, 249)" }}
                  whileInView={{ scale: 1.1, color: "rgb(15, 23, 42)", borderColor: "rgb(245, 158, 11)" }}
                  transition={{ duration: 0.6, delay: i * 0.2 + 0.3 }}
                  className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-xl md:text-3xl font-black mx-auto mb-8 md:mb-10 shadow-2xl border-4 outfit"
                >
                  {item.step}
                </motion.div>
                <motion.h3
                  className="text-lg md:text-2xl font-black text-slate-900 mb-3 md:mb-4 outfit tracking-tight uppercase"
                >
                  {item.title}
                </motion.h3>
                <p className="text-xs md:text-base text-slate-500 leading-relaxed font-semibold px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-900 py-24 md:py-32 px-6 border-t border-slate-100 relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-slate-100 pb-20 text-center md:text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-black text-4xl outfit tracking-tighter">AI</span>
              <span className="text-slate-900 font-bold text-4xl outfit tracking-tighter">COUNSELLOR</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.35em]">
              <a href="#" className="hover:text-amber-500 transition-colors outfit">Universities</a>
              <a href="#" className="hover:text-amber-500 transition-colors outfit">Support</a>
              <a href="#" className="hover:text-amber-500 transition-colors outfit">Success</a>
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/signup"
                className="px-8 md:px-10 py-3 md:py-4 bg-slate-900 text-white rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-slate-200"
              >
                Join Now <ArrowRight size={14} className="inline ml-1.5" />
              </Link>
            </div>
          </div>

          <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest outfit">© 2026 AI COUNSELLOR • BUILT FOR BOLD FUTURES</p>
            <div className="flex gap-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest outfit">
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