import React from 'react';
import { Link } from 'react-router-dom';
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
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <h1 className="hero-bg-text bebas select-none flex flex-col items-center gap-2 md:flex-row md:gap-16">
            <span>FUTURE</span>
            <span>LEARN</span>
          </h1>
        </div>

        {/* 100x Better Neural Strategy Engine Visual - CONTENT RESTORED */}
        <div className="relative z-10 float-subtle flex flex-col items-center mb-16 md:mb-10">
          <div className="relative w-80 h-80 md:w-[680px] md:h-[680px] flex items-center justify-center">
            
            {/* Outer Neural Lattice Ring 1 */}
            <div className="absolute inset-0 border-[1px] border-slate-200/40 rounded-full neural-orbit">
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-200 rounded-full"></div>
            </div>

            {/* Middle Data Transmission Ring */}
            <div className="absolute inset-12 md:inset-20 border-[1.5px] border-dashed border-orange-200/30 rounded-full neural-orbit-reverse">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-5 h-5 bg-white border border-orange-200 rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
               </div>
            </div>

            {/* Inner Scanning Core Boundary */}
            <div className="absolute inset-24 md:inset-40 border-[1px] border-slate-100 rounded-full opacity-40"></div>

            {/* Main Central Engine Core */}
            <div className="relative z-20 w-56 h-56 md:w-[460px] md:h-[460px] rounded-full bg-white shadow-2xl flex items-center justify-center orange-glow border-4 md:border-[16px] border-orange-500/5 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-white to-transparent rounded-full transition-transform duration-700 group-hover:scale-110"></div>
              
              {/* Active Scanner Laser Visual */}
              <div className="absolute inset-0 scanner-sweep bg-gradient-to-b from-orange-500/0 via-orange-500/20 to-orange-500/0 z-10 pointer-events-none opacity-50"></div>
              
              {/* Inner Floating Tech Geometry */}
              <div className="absolute inset-10 md:inset-20 border-[0.5px] border-orange-100 rounded-full animate-pulse opacity-50"></div>
              
              <div className="flex flex-col items-center relative z-20 pulse-breathing text-center">
                <GraduationCap size={90} className="text-orange-500 drop-shadow-[0_10px_10px_rgba(249,115,22,0.3)] md:w-52 md:h-52" strokeWidth={0.8} />
                <div className="mt-4 md:mt-6 px-6 py-2 md:px-10 md:py-3 bg-slate-900 text-white rounded-full text-[9px] md:text-[12px] font-bold tracking-[0.4em] md:tracking-[0.5em] bebas shadow-2xl shadow-slate-900/20 transition-all group-hover:bg-orange-600 group-hover:scale-110">
                  SMART STRATEGY
                </div>
                <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Counseling Ready</span>
                </div>
              </div>

              {/* Data Floating Elements */}
              <div className="absolute top-1/4 left-8 md:left-16 text-slate-200 group-hover:text-orange-400 transition-all duration-700 delay-100 group-hover:-translate-y-2">
                <BrainCircuit size={22} className="md:w-8 md:h-8" />
              </div>
              <div className="absolute top-1/4 right-8 md:right-16 text-slate-200 group-hover:text-orange-400 transition-all duration-700 delay-200 group-hover:-translate-y-2">
                <Cpu size={22} className="md:w-8 md:h-8" />
              </div>
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-slate-100 group-hover:text-orange-300 transition-all duration-1000 group-hover:scale-125">
                <Database size={24} className="md:w-9 md:h-9" />
              </div>
            </div>

            {/* Luxury Tech Stabilizers */}
            <div className="absolute top-0 right-0 md:top-16 md:right-16 w-20 md:w-40 h-1.5 md:h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent rotate-45 rounded-full opacity-40 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 md:bottom-16 md:left-16 w-20 md:w-40 h-1.5 md:h-2 bg-gradient-to-l from-transparent via-orange-500 to-transparent rotate-45 rounded-full opacity-40 group-hover:opacity-100 transition-all duration-700"></div>
            
            {/* Small Orbiting Labels */}
            <div className="absolute -top-12 md:-top-20 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-slate-100 rounded-full shadow-sm text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Network size={12} className="text-orange-500" /> GUIDED AI ADMISSIONS
            </div>
          </div>
        </div>

        {/* Content Overlays - TEXT RESTORED */}
        <div className="relative z-20 text-center max-w-3xl px-6">
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
        </div>

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
                <div key={i} className="flex flex-col items-center py-6 md:py-10 px-2 md:px-4 group hover:bg-white/60 transition-all duration-500">
                  <div className="mb-2 md:mb-4 text-orange-500 group-hover:scale-125 transition-all duration-700">
                    <stat.icon size={18} className="md:w-6 md:h-6" strokeWidth={1.5} />
                  </div>
                  <p className="text-xl md:text-4xl font-extrabold text-slate-900 bebas tracking-widest mb-0.5">{stat.value}</p>
                  <p className="text-[7px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                  <div className="mt-2 md:mt-4 flex items-center gap-1">
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[6px] md:text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{stat.detail}</span>
                  </div>
                </div>
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
              <div key={i} className="flex-1 relative group">
                <div className="absolute -top-10 md:-top-12 -left-2 md:-left-4 text-6xl md:text-9xl font-bold text-slate-50/70 bebas pointer-events-none select-none group-hover:text-orange-50 transition-colors duration-500">
                  0{i + 1}
                </div>
                
                <div className="relative z-10 p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:border-orange-200">
                  <div className={`mb-6 md:mb-8 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                    feature.color === 'orange' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' : 'bg-slate-900 text-white group-hover:bg-orange-500 group-hover:text-white'
                  }`}>
                    <feature.icon size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  
                  <p className="text-[9px] md:text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-2">{feature.subtitle}</p>
                  <h3 className="bebas text-3xl md:text-4xl text-slate-900 mb-4 md:mb-6 tracking-widest leading-none group-hover:text-orange-500 transition-colors">{feature.title}</h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium mb-6 md:mb-8">
                    {feature.desc}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-4 md:pt-6 border-t border-slate-50">
                    <div className="w-8 h-1 bg-slate-100 rounded-full group-hover:w-16 group-hover:bg-orange-500 transition-all duration-500"></div>
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors">SYSTEM READY</span>
                  </div>
                </div>
              </div>
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
              <div key={i} className="relative z-10 text-center group">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-slate-300 group-hover:text-orange-500 group-hover:border-orange-500 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mx-auto mb-6 md:mb-8 shadow-xl border-4 border-slate-50 bebas tracking-tighter transition-all duration-500">
                  {item.step}
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3 tracking-tight group-hover:text-orange-500 transition-colors">{item.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium px-4">{item.desc}</p>
              </div>
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