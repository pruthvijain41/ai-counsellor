import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  Users,
  Globe,
  ArrowRight,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';

const Landing: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFC] selection:bg-amber-500 selection:text-white overflow-x-hidden lexend relative">
      {/* Visual background layers */}
      <div className="fixed inset-0 -z-30 bg-[#FDFDFC]"></div>
      <div className="fixed inset-0 -z-20 opacity-40 mesh-gradient"></div>
      <div className="fixed inset-0 -z-10 grain opacity-[0.03] pointer-events-none"></div>

      {/* Luxury Navigation - Reimagined as Architectural Floating Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 md:pt-10 px-6 pointer-events-none">
        <nav
          className={`pointer-events-auto transition-all duration-700 ease-[0.16, 1, 0.3, 1] flex items-center justify-between px-6 md:px-10 h-16 md:h-20 rounded-full border border-white/20 shadow-2xl overflow-hidden glass-nav ${isScrolled
            ? 'w-full md:w-[95%] max-w-7xl bg-white/80 backdrop-blur-2xl translate-y-[-10px]'
            : 'w-full max-w-[1400px] bg-white/10 backdrop-blur-md'
            }`}
        >
          {/* Grain texture specifically for navbar */}
          <div className="absolute inset-0 grain opacity-[0.05] pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isScrolled ? 'bg-slate-900 rotate-[360deg]' : 'bg-white shadow-xl rotate-0'}`}>
              <span className={`font-black text-xl md:text-2xl outfit leading-none ${isScrolled ? 'text-white' : 'text-slate-900'}`}>AI</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-xs md:text-sm outfit tracking-[0.3em] uppercase leading-none transition-colors duration-500 ${isScrolled ? 'text-slate-900' : 'text-slate-800'}`}>
                COUNSELLOR
              </span>
              <span className={`text-[8px] font-bold tracking-[0.4em] uppercase opacity-50 mt-1 transition-colors duration-500 ${isScrolled ? 'text-slate-500' : 'text-slate-400'}`}>
                Premium Support
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-12 relative z-10">
            <div className="hidden lg:flex items-center gap-8">
              {['Universities', 'Process', 'Success'].map((item, i) => (
                <a
                  key={i}
                  href={`#${item.toLowerCase()}`}
                  className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 hover:text-amber-500 ${isScrolled ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <Link to="/login" className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] transition-colors duration-500 ${isScrolled ? 'text-slate-400 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>
                Login
              </Link>
              <Link
                to="/signup"
                className={`group relative overflow-hidden flex items-center gap-3 px-6 md:px-8 h-10 md:h-12 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 ${isScrolled
                  ? 'bg-slate-900 text-white hover:bg-amber-500'
                  : 'bg-white text-slate-900 hover:bg-amber-500 hover:text-white shadow-xl shadow-white/10'
                  }`}
              >
                <span className="relative z-10">Start Journey</span>
                <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section - Architectural Layout */}
      <section className="relative pt-40 md:pt-60 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen flex flex-col justify-end">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 right-12 w-[30vw] h-[30vw] rounded-full bg-amber-500/10 blur-[120px] -z-10"
        ></motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-12 lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-full mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Neural Admission Engine v4.0</span>
              </div>

              <h1 className="outfit text-6xl md:text-8xl lg:text-[9.5rem] font-black text-slate-900 leading-[0.85] tracking-tight mb-8">
                ARCHITECT<br />
                <span className="flex items-center gap-6">
                  YOUR <span className="text-amber-500 italic font-light drop-shadow-sm">FUTURE</span>
                </span>
              </h1>
            </motion.div>
          </div>

          <div className="md:col-span-12 lg:col-span-3 pb-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-sm mb-10"
            >
              Stop guessing. Our guided AI platform transforms complex study-abroad decisions into a clear, execution-ready roadmap.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-6 p-2 pr-10 border border-slate-200 rounded-full hover:border-amber-500 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-500">
                  <Zap size={24} fill="currentColor" />
                </div>
                <span className="text-slate-900 font-bold text-sm uppercase tracking-widest">
                  Initialize Masterplan
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats - Horizontal Scroll Aesthetic */}
      <section className="py-32 px-6 md:px-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
            {[
              { label: 'Partners', value: '4,500+', icon: GraduationCap, detail: 'GLOBAL REACH' },
              { label: 'Regions', value: '32+', icon: Globe, detail: 'STRATEGIC HUBS' },
              { label: 'Users', value: '250K+', icon: Users, detail: 'SUCCESSFUL JOURNEYS' },
              { label: 'Success', value: '98%', icon: Sparkles, detail: 'VERIFIED RATE' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex flex-col group"
              >
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                  <div className="w-4 h-px bg-slate-200 group-hover:w-8 group-hover:bg-amber-500 transition-all duration-500"></div>
                  {stat.label}
                </div>
                <span className="outfit text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-2 group-hover:text-amber-500 transition-colors duration-500">
                  {stat.value}
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">{stat.detail}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Editorial Maximalism (Sticky Parallax Stack) */}
      <section id="features" className="relative bg-[#FDFDFC] pt-32 pb-64 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-32 md:mb-64">
            <h2 className="outfit text-6xl md:text-[12rem] font-black text-slate-900 leading-[0.75] tracking-tighter sticky top-40 z-0">
              CORE<br />
              <span className="text-amber-500 italic">SYSTEMS</span>
            </h2>
            <div className="max-w-md mt-20 md:mt-0 text-slate-500 text-xl font-medium leading-relaxed">
              We've digitized the wisdom of thousands of human counselors into a single, cohesive neural network. Each layer represents a precise stage of your global journey.
            </div>
          </div>

          <div className="flex flex-col gap-[30vh]">
            {/* Feature 1 - Sticky Reveal */}
            <div className="sticky top-40 h-[80vh] flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ margin: "-200px" }}
                className="relative bg-slate-900 rounded-[3rem] md:rounded-[5rem] p-12 md:p-24 overflow-hidden shadow-2xl group"
              >
                <div className="absolute inset-0 grain opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 p-12 text-[10rem] md:text-[15rem] font-black text-white/5 outfit leading-none select-none">01</div>

                <div className="relative z-10 max-w-2xl">
                  <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-12 shadow-xl shadow-amber-500/20">
                    <Activity size={32} />
                  </div>
                  <span className="text-amber-500 text-[10px] md:text-xs font-bold tracking-[0.6em] uppercase block mb-6">Precision Diagnostic</span>
                  <h3 className="outfit text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 italic">PROFILE ANALYSIS</h3>
                  <p className="text-white/60 text-lg md:text-2xl font-medium leading-relaxed max-w-xl">
                    Strategic academic evaluation to identify your competitive edge. We analyze GPA, impact, and extracurricular weight with sub-second neural latency.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Feature 2 - Sticky Reveal */}
            <div className="sticky top-52 h-[80vh] flex flex-col justify-end translate-y-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ margin: "-200px" }}
                className="relative bg-white border border-slate-100 rounded-[3rem] md:rounded-[5rem] p-12 md:p-24 overflow-hidden shadow-2xl group"
              >
                <div className="absolute top-0 right-0 p-12 text-[10rem] md:text-[15rem] font-black text-slate-50 outfit leading-none select-none">02</div>

                <div className="relative z-10 max-w-2xl">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-12 shadow-xl shadow-slate-900/10">
                    <Layers size={32} />
                  </div>
                  <span className="text-slate-400 text-[10px] md:text-xs font-bold tracking-[0.6em] uppercase block mb-6">Algorithm Match</span>
                  <h3 className="outfit text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 italic">INTELLIGENT MATCH</h3>
                  <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed max-w-xl">
                    AI-driven matching based on tuition, ranking, and acceptance probabilities. No more guesswork; just data-driven fits for your specific goals.
                  </p>
                  <button className="mt-12 group flex items-center gap-4 text-xs font-bold tracking-[0.4em] uppercase text-amber-600">
                    EXPLORE FITS <div className="w-12 h-px bg-amber-200 group-hover:w-24 group-hover:bg-amber-500 transition-all duration-700"></div>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Feature 3 - Sticky Reveal */}
            <div className="sticky top-64 h-[80vh] flex flex-col justify-end translate-y-40">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ margin: "-200px" }}
                className="relative bg-amber-500 rounded-[3rem] md:rounded-[5rem] p-12 md:p-24 overflow-hidden shadow-2xl group"
              >
                <div className="absolute top-0 right-0 p-12 text-[10rem] md:text-[15rem] font-black text-white/10 outfit leading-none select-none">03</div>

                <div className="relative z-10 max-w-2xl text-white">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-12 shadow-xl shadow-slate-900/20">
                    <ShieldCheck size={32} />
                  </div>
                  <span className="text-white/60 text-[10px] md:text-xs font-bold tracking-[0.6em] uppercase block mb-6">Execution Path</span>
                  <h3 className="outfit text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 italic text-shadow">VICTORY ROADMAP</h3>
                  <p className="text-white/80 text-lg md:text-2xl font-medium leading-relaxed max-w-xl">
                    End-to-end task tracking and AI documentation support to ensure your success. Your personal mission control for the global transition.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pathway - Immersive Blueprint (Vertical Flow) */}
      <section className="relative bg-slate-900 py-64 overflow-hidden">
        <div className="absolute inset-0 grain opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900"></div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-64 text-center md:text-left gap-20">
            <h2 className="outfit text-6xl md:text-[15rem] font-black text-white leading-[0.7] tracking-tighter">
              THE<br />
              <span className="text-amber-500 italic">SUCCESS</span><br />
              BLUEPRINT
            </h2>
            <div className="md:max-w-xs text-amber-500/40 text-[10px] font-black tracking-[0.5em] uppercase border-l-2 border-amber-500/20 pl-8 h-40 flex items-center">
              SYSTEM PROCESS VER. 9.1
            </div>
          </div>

          <div className="relative">
            {/* The Vertical Conduit */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500 via-slate-700 to-transparent md:-translate-x-1/2"></div>

            <div className="flex flex-col gap-64">
              {[
                { step: '01', title: 'BUILD PROFILE', desc: 'Securely sync your academic milestones. Connect your datasets and verified credentials.' },
                { step: '02', title: 'DISCOVER programs', desc: 'Curated recommendations powered by massive data matching algorithms. Explore 10,000+ programs.' },
                { step: '03', title: 'SHORTLIST goals', desc: 'Strategically lock your primary goals. Comparative analysis of tuition, ROI and culture.' },
                { step: '04', title: 'APPLY now', desc: 'Guided execution for every submission. Automate the friction out of paperwork and visa protocols.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`flex flex-col md:flex-row items-center gap-12 md:gap-32 ${i % 2 === 0 ? 'md:text-right' : 'md:flex-row-reverse md:text-left'}`}
                >
                  <div className="flex-1 hidden md:block">
                    <div className="text-[10rem] font-black text-white/5 outfit leading-none select-none">{item.step}</div>
                  </div>

                  <div className="relative">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-slate-900 border-4 border-amber-500 flex items-center justify-center text-amber-500 font-black outfit text-2xl relative z-10 bg-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                      {item.step}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500 opacity-20 blur-3xl rounded-full"></div>
                  </div>

                  <div className="flex-1">
                    <h3 className="outfit text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase">{item.title}</h3>
                    <p className="text-white/40 text-lg md:text-2xl font-medium leading-relaxed max-w-xl">{item.desc}</p>
                    <div className={`mt-8 w-24 h-1.5 bg-amber-500 ${i % 2 === 0 ? 'ml-auto' : ''}`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal Editorial */}
      <footer className="bg-slate-900 text-white py-24 md:py-40 px-6 md:px-12 overflow-hidden relative">
        <motion.div
          style={{ y: y2 }}
          className="absolute -bottom-40 -left-40 w-[60vw] h-[60vw] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"
        ></motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-32">
            <div className="max-w-xl">
              <h2 className="outfit text-5xl md:text-8xl font-black tracking-tight leading-[0.85] mb-12">
                READY FOR THE<br />
                <span className="text-amber-500 italic">NEXT CHAPTER?</span>
              </h2>
              <Link
                to="/signup"
                className="group flex items-center gap-6 text-2xl font-black outfit hover:text-amber-500 transition-colors duration-500 uppercase tracking-tighter"
              >
                Join AI Counsellor Today <ArrowRight size={40} className="group-hover:translate-x-4 transition-transform duration-500" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-20">
              <div className="flex flex-col gap-6">
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">Navigation</span>
                <a href="#" className="font-bold text-lg hover:text-amber-500 transition-colors">Universities</a>
                <a href="#" className="font-bold text-lg hover:text-amber-500 transition-colors">Support</a>
                <a href="#" className="font-bold text-lg hover:text-amber-500 transition-colors">Success Stories</a>
              </div>
              <div className="flex flex-col gap-6">
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">Legal</span>
                <a href="#" className="font-bold text-lg hover:text-amber-500 transition-colors">Privacy</a>
                <a href="#" className="font-bold text-lg hover:text-amber-500 transition-colors">Terms</a>
                <a href="#" className="font-bold text-lg hover:text-amber-500 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-black text-2xl outfit leading-none">AI</span>
              <span className="font-bold text-2xl outfit leading-none">COUNSELLOR</span>
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
              © 2026 AI COUNSELLOR • BUILT FOR BOLD FUTURES
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;