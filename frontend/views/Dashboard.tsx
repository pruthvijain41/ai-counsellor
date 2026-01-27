
import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { UserProfile } from '../types';
import {
  Trophy,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  ArrowUpRight,
  Loader2,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTaskStore } from '../store/taskStore';
import { useUniversityStore } from '../store/universityStore';
import { useAuthStore } from '../store/authStore';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { profile } = useAuthStore();
  const { tasks, isLoading: tasksLoading, fetchTasks } = useTaskStore();
  const { shortlist, isLoading: shortlistLoading, fetchShortlist } = useUniversityStore();

  // Fetch real data on mount
  useEffect(() => {
    fetchTasks();
    fetchShortlist();
  }, [fetchTasks, fetchShortlist]);

  // Calculate real readiness score based on profile
  const calculateReadiness = () => {
    let score = 0;
    const checks = [
      { field: profile?.education_level, weight: 10 },
      { field: profile?.major, weight: 10 },
      { field: profile?.intended_degree, weight: 10 },
      { field: profile?.preferred_countries?.length, weight: 10 },
      { field: profile?.budget_max, weight: 10 },
      { field: profile?.ielts_status === 'Completed', weight: 15 },
      { field: profile?.gre_status === 'Completed', weight: 10 },
      { field: profile?.sop_status === 'Ready', weight: 15 },
      { field: shortlist.filter(s => s.status === 'LOCKED').length > 0, weight: 10 },
    ];

    checks.forEach(c => {
      if (c.field) score += c.weight;
    });

    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness();
  const data = [
    { name: 'Ready', value: readinessScore },
    { name: 'Pending', value: 100 - readinessScore },
  ];
  const COLORS = ['#f97316', '#f1f5f9'];

  // Determine current stage based on profile state
  const getCurrentStage = () => {
    const lockedCount = shortlist.filter(s => s.status === 'LOCKED').length;
    const shortlistedCount = shortlist.length;

    if (!profile?.onboarding_completed) return 1;
    if (shortlistedCount === 0) return 2;
    if (lockedCount === 0) return 3;
    return 4;
  };

  const currentStage = getCurrentStage();
  const stages = [
    { name: 'Profile', status: currentStage > 1 ? 'completed' : currentStage === 1 ? 'current' : 'upcoming' },
    { name: 'Discovery', status: currentStage > 2 ? 'completed' : currentStage === 2 ? 'current' : 'upcoming' },
    { name: 'Shortlist', status: currentStage > 3 ? 'completed' : currentStage === 3 ? 'current' : 'upcoming' },
    { name: 'Apps', status: currentStage > 4 ? 'completed' : currentStage === 4 ? 'current' : 'upcoming' },
    { name: 'Visa', status: 'upcoming' },
  ];

  // Get incomplete tasks for display (limit 3)
  const pendingTasks = tasks
    .filter(t => !t.is_completed)
    .slice(0, 3);

  // Get locked universities for display
  const lockedUniversities = shortlist.filter(s => s.status === 'LOCKED').slice(0, 2);
  const hasLockedUniversities = lockedUniversities.length > 0;

  // Get shortlisted (not locked) universities as TOP MATCHES
  const shortlistedUniversities = shortlist.filter(s => s.status === 'SHORTLISTED').slice(0, 3);
  const hasShortlistedUniversities = shortlistedUniversities.length > 0;

  // Profile strength assessment
  const getProfileStrength = () => {
    if (readinessScore >= 70) return { label: 'Strong', color: 'text-emerald-500' };
    if (readinessScore >= 40) return { label: 'Average', color: 'text-orange-500' };
    return { label: 'Needs Work', color: 'text-red-500' };
  };

  const profileStrength = getProfileStrength();

  return (
    <Layout user={user}>
      <div className="grid grid-cols-12 gap-8 selection:bg-orange-500 selection:text-white">

        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Welcome Card */}
          <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col md:flex-row items-center tour-dashboard">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-100/50 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex-1 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 border border-white rounded-full">
                <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></span>
                <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Status: In Progress</span>
              </div>
              <h3 className="text-4xl lg:text-5xl font-display font-extrabold text-slate-800 leading-tight">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 uppercase bebas">{user.fullName?.split(' ')[0] || 'Applicant'}</span>
              </h3>
              <p className="text-slate-600 max-w-sm leading-relaxed text-sm">
                Your application strength is {readinessScore}%.
                {currentStage < 4 ? " Follow your roadmap to reach a perfect score." : " Focus on submission protocols."}
              </p>
              <div className="pt-4">
                <Link to="/tracker" className="inline-flex px-8 py-4 btn-gradient text-white rounded-2xl font-bold items-center gap-3 hover:scale-[1.02] transition-transform shadow-lg text-xs uppercase tracking-widest">
                  EXECUTE CHECKLIST
                  <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                </Link>
              </div>
            </div>
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 mt-8 md:mt-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-amber-100 rounded-full opacity-30 animate-pulse"></div>
              <span className="material-symbols-outlined text-[100px] lg:text-[140px] text-orange-400/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">auto_awesome</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Readiness Widget */}
            <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="font-display font-bold text-lg text-slate-800 uppercase bebas tracking-widest">Profile Strength</h4>
                  <p className="text-[10px] text-slate-500 tracking-widest font-bold uppercase mt-1">AI Score Engine</p>
                </div>
                <div className="relative flex items-center justify-center w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle className="text-white/40" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-[var(--accent)]" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213.6" strokeDashoffset={`${213.6 * (1 - readinessScore / 100)}`} strokeLinecap="round" strokeWidth="6"></circle>
                  </svg>
                  <span className="absolute text-lg font-extrabold text-slate-800">{readinessScore}%</span>
                </div>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Academics</span>
                  <span className={`text-[9px] px-2.5 py-1 ${profileStrength.label === 'Strong' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-orange-500/10 text-orange-600 border-orange-200'} font-bold rounded-lg border uppercase tracking-wider`}>
                    {profileStrength.label}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exams</span>
                  <span className={`text-[9px] px-2.5 py-1 ${profile?.ielts_status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-orange-500/10 text-orange-600 border-orange-200'} font-bold rounded-lg border uppercase tracking-wider`}>
                    {profile?.ielts_status === 'Completed' ? 'READY' : 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SOP Status</span>
                  <span className={`text-[9px] px-2.5 py-1 ${profile?.sop_status === 'Ready' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-amber-500/10 text-amber-600 border-amber-200'} font-bold rounded-lg border uppercase tracking-wider`}>
                    {profile?.sop_status === 'Ready' ? 'READY' : profile?.sop_status === 'Draft' ? 'OPTIMIZING' : 'MISSING'}
                  </span>
                </div>
              </div>
              <Link to="/profile" className="mt-auto w-full py-4 btn-light-refined text-slate-700 rounded-2xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">bolt</span>
                Boost Score
              </Link>
            </div>

            {/* Mission Tracker */}
            <div className="glass-panel rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-10">
                <h4 className="font-display font-bold text-lg text-slate-800 uppercase bebas tracking-widest">Mission Phase</h4>
                <span className="text-[10px] px-3 py-1 bg-white/60 border border-white/80 text-[var(--accent)] font-bold rounded-full tracking-widest">PHASE {currentStage} / 5</span>
              </div>
              <div className="space-y-6">
                {stages.slice(0, 3).map((stage, i) => (
                  <div key={i} className="flex items-center gap-4 relative">
                    {i < 2 && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-200/50 -z-10"></div>}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${stage.status === 'completed' ? 'bg-emerald-500' : stage.status === 'current' ? 'bg-[var(--accent)] ring-4 ring-orange-100' : 'border-2 border-slate-300 bg-white'}`}>
                      {stage.status === 'completed' ? (
                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                      ) : stage.status === 'current' ? (
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                      ) : null}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${stage.status === 'completed' ? 'text-slate-400 line-through' : stage.status === 'current' ? 'text-slate-800 tracking-wide' : 'text-slate-500 opacity-40 uppercase'}`}>
                        {stage.name === 'Profile' ? 'Profile & Strategy' : stage.name === 'Discovery' ? 'Discovery & Shortlist' : 'Application Lock'}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="mt-8 p-5 bg-gradient-to-br from-white/80 to-white/40 border border-white rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Goal</p>
                  <p className="text-sm font-bold text-slate-700">
                    {currentStage === 2 ? 'Shortlist Universities' :
                      currentStage === 3 ? 'Lock Your Targets' :
                        currentStage === 4 ? 'Complete Applications' : 'Academic Profile Setup'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="glass-panel rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100/50 rounded-xl flex items-center justify-center text-[var(--accent)]">
                  <span className="material-symbols-outlined">checklist</span>
                </div>
                <h4 className="font-display font-bold text-xl text-slate-800 uppercase bebas tracking-widest">Pending Actions</h4>
              </div>
              <Link to="/tracker" className="text-[10px] font-bold text-[var(--accent)] tracking-widest uppercase hover:opacity-70 transition-opacity">View Checklist</Link>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="p-10 text-center bg-white/30 rounded-3xl border border-white border-dashed">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">task_alt</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocol Clear</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="group flex items-center gap-5 p-5 bg-white/30 border border-white hover:border-orange-200 hover:bg-white/60 rounded-2xl transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center text-orange-400 group-hover:bg-orange-50 transition-colors bg-white shadow-sm">
                      <span className="material-symbols-outlined">
                        {task.priority === 'HIGH' ? 'priority_high' : 'description'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-slate-700">{task.title}</h5>
                      <div className="flex gap-4 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className={`w-1 h-1 rounded-full ${task.priority === 'HIGH' ? 'bg-red-400' : 'bg-orange-400'}`}></span> {task.type || 'Task'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <span className={`w-1 h-1 rounded-full ${task.priority === 'HIGH' ? 'bg-amber-400' : 'bg-blue-400'}`}></span> {task.priority}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-orange-400 transition-all">chevron_right</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Locked Targets */}
          <div className="glass-panel rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-display font-bold text-lg text-slate-800 uppercase bebas tracking-widest">Locked Targets</h4>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 uppercase font-black text-[10px]">OK</span>
            </div>

            {shortlistLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : hasLockedUniversities ? (
              <div className="space-y-6 mb-8">
                {lockedUniversities.map((uni, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/30 border border-white rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-700 font-extrabold text-xl shadow-sm bebas">
                      {uni.university_name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h5 className="font-bold text-sm text-slate-800 truncate">{uni.university_name}</h5>
                      <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-xs">location_on</span> {uni.country}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase border border-emerald-200">Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center bg-white/30 rounded-3xl border border-white border-dashed mb-8">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">explore</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Discover targets to unlock your application cockpit</p>
              </div>
            )}

            <Link to="/shortlist" className="w-full py-4 btn-light-refined rounded-2xl font-bold text-[10px] tracking-widest text-slate-700 uppercase flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg text-orange-400">edit_square</span>
              Manage Shortlist
            </Link>
          </div>

          {/* Profile Status Status */}
          <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100/30 rounded-full blur-[40px]"></div>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/50">
              <span className="material-symbols-outlined text-[var(--accent)]">data_saver_on</span>
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-slate-500">Academic Protocol</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center py-4 border-b border-white/30 group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Target Degree</span>
                <span className="text-xs font-bold text-slate-800">{profile?.intended_degree || 'NOT SET'}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/30 group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Preferences</span>
                <span className="text-xs font-bold text-slate-800">{profile?.major || 'STEM GENERAL'}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/30 group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Budget Range</span>
                <span className="text-xs font-bold text-slate-800">
                  {profile?.budget_max ? `$${(profile.budget_min / 1000).toFixed(0)}k – $${(profile.budget_max / 1000).toFixed(0)}k / Yr` : 'NOT SET'}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-white/30 group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">IELTS Rank</span>
                <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1.5">
                  {profile?.ielts_status === 'Completed' ? '8.0' : 'PENDING'} <span className="material-symbols-outlined text-sm">verified_user</span>
                </span>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-4 p-4 bg-white/60 border border-white rounded-2xl relative">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-orange-400">trophy</span>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Next Milestone</p>
                <p className="text-[9px] font-bold text-slate-800 uppercase tracking-wide">Submit Primary Applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
