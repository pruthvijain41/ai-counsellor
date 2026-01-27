
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 selection:bg-orange-500 selection:text-white">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Welcome Card */}
          <div className="p-12 bg-white border border-slate-100 rounded-[3rem] flex items-center justify-between overflow-hidden relative shadow-sm group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-4">Your Dashboard</p>
              <h3 className="text-5xl font-bold text-slate-900 mb-4 bebas tracking-widest">WELCOME, {user.fullName?.split(' ')[0]?.toUpperCase() || 'STUDENT'}</h3>
              <p className="text-slate-400 mb-10 max-w-sm text-sm font-medium leading-relaxed">
                Your admission strategy is {readinessScore}% optimized.
                {currentStage < 4
                  ? ` Progress to Stage ${currentStage + 1} by completing your tasks.`
                  : ' You are in application mode!'}
              </p>
              <Link to="/tracker" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-slate-100 active:scale-95">
                Execute Checklist <ChevronRight size={14} />
              </Link>
            </div>
            <div className="hidden xl:block absolute -right-16 -top-16 w-80 h-80 bg-orange-50 rounded-full group-hover:scale-105 transition-transform duration-1000"></div>
            <Zap size={140} className="hidden xl:block absolute right-12 top-1/2 -translate-y-1/2 text-orange-500 opacity-10 group-hover:opacity-20 transition-all duration-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Readiness Widget - Powered by AI Analysis */}
            <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-[100%] transition-all group-hover:scale-110"></div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1 bebas tracking-widest uppercase">PROFILE STRENGTH</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Analysis Protocol</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          innerRadius={20}
                          outerRadius={30}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-900">{readinessScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Academics */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academics</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${profileStrength.label === 'Strong' ? 'bg-emerald-100 text-emerald-600' :
                      profileStrength.label === 'Average' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {profileStrength.label}
                    </span>
                  </div>

                  {/* Exams */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exams</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${profile?.ielts_status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                      {profile?.ielts_status === 'Completed' ? 'Ready' : 'Pending'}
                    </span>
                  </div>

                  {/* SOP */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SOP</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${profile?.sop_status === 'Ready' ? 'bg-emerald-100 text-emerald-600' :
                      profile?.sop_status === 'Draft' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {profile?.sop_status || 'Missing'}
                    </span>
                  </div>
                </div>

                <Link to="/profile" className="w-full py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all text-center">
                  Boost Profile Score
                </Link>
              </div>
            </div>

            {/* Stage Tracker */}
            <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-bold text-slate-900 bebas tracking-widest uppercase">MISSION PHASE</h4>
                <span className="text-[10px] font-bold text-orange-600 px-4 py-1.5 bg-orange-50 rounded-full uppercase tracking-widest border border-orange-100">Step {currentStage} of 5</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-4">
                {stages.map((stage, i) => (
                  <div key={i} className="flex-1">
                    <div className={`h-2 rounded-full mb-4 transition-all duration-700 ${stage.status === 'completed' ? 'bg-emerald-500 shadow-lg shadow-emerald-100' :
                      stage.status === 'current' ? 'bg-orange-500 shadow-xl shadow-orange-100 animate-pulse' : 'bg-slate-100'
                      }`} />
                    <p className={`text-[9px] font-bold text-center truncate uppercase tracking-[0.15em] ${stage.status === 'current' ? 'text-orange-500' :
                      stage.status === 'completed' ? 'text-emerald-500' : 'text-slate-300'
                      }`}>{stage.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks & To-Dos */}
          <div className="p-12 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-3xl font-bold text-slate-900 bebas tracking-widest uppercase">APPLICATION CHECKLIST</h4>
              </div>
              <Link to="/tracker" className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] hover:underline">View All Tasks</Link>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-10">
                {hasLockedUniversities ? (
                  <>
                    <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-4" />
                    <p className="text-slate-400 font-medium">All tasks completed! Visit the tracker to generate more.</p>
                  </>
                ) : (
                  <>
                    <Lock size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-400 font-medium mb-2">Lock at least one university to unlock application tasks.</p>
                    <Link to="/shortlist" className="text-orange-500 font-bold text-sm hover:underline">Go to Shortlist →</Link>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="group p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] flex items-center justify-between hover:bg-white hover:border-orange-200 transition-all duration-500 hover:shadow-xl hover:shadow-slate-100">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${task.priority === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-white text-orange-500 shadow-sm border border-slate-100 group-hover:bg-orange-500 group-hover:text-white'
                        }`}>
                        {task.priority === 'HIGH' ? <AlertCircle size={24} /> : <Clock size={24} />}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-lg tracking-tight mb-1">{task.title}</h5>
                        <div className="flex items-center gap-3">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{task.type || 'Task'}</p>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${task.priority === 'HIGH' ? 'text-red-500' : 'text-slate-600'}`}>{task.priority}</p>
                        </div>
                      </div>
                    </div>
                    <Link to="/tracker" className="w-12 h-12 flex items-center justify-center text-slate-200 hover:text-emerald-500 transition-colors bg-white rounded-full border border-slate-100 group-hover:border-emerald-200 shadow-sm">
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-10">
          {/* Locked Universities */}
          <div className="p-12 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
            <h4 className="text-3xl font-bold text-slate-900 bebas tracking-widest mb-10 uppercase">
              {hasLockedUniversities ? 'LOCKED TARGETS' : 'TOP MATCHES'}
            </h4>

            {shortlistLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : hasLockedUniversities ? (
              <div className="space-y-10">
                {lockedUniversities.map((uni, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold bebas text-2xl shadow-lg border border-slate-50">
                        {uni.university_name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md text-white">
                        <Lock size={12} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h5 className="font-bold text-slate-900 truncate text-lg tracking-tight mb-1">{uni.university_name}</h5>
                      <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-4">
                        <MapPin size={12} className="text-orange-500" /> {uni.country}
                      </div>
                      <span className="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] border bg-emerald-50 text-emerald-600 border-emerald-100">
                        LOCKED
                      </span>
                    </div>
                  </div>
                ))}
                <Link to="/shortlist" className="block w-full py-5 text-center bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 mt-4">
                  Manage Shortlist
                </Link>
              </div>
            ) : hasShortlistedUniversities ? (
              <div className="space-y-8">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your Shortlisted Universities</p>
                {shortlistedUniversities.map((uni, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold bebas text-xl shadow-md border border-slate-50">
                        {uni.university_name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h5 className="font-bold text-slate-900 truncate tracking-tight mb-1">{uni.university_name}</h5>
                      <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-2">
                        <MapPin size={10} className="text-orange-500" /> {uni.country}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${uni.enriched_data?.match_type === 'Dream' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        uni.enriched_data?.match_type === 'Safe' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                        {uni.enriched_data?.match_type || 'Target'}
                      </span>
                    </div>
                  </div>
                ))}
                <Link to="/shortlist" className="block w-full py-4 text-center bg-orange-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 mt-4">
                  Lock a University to Continue
                </Link>
              </div>
            ) : (
              <div className="text-center py-10">
                <Target size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium mb-4">Discover and shortlist universities to see them here.</p>
                <Link to="/discover" className="block w-full py-5 text-center bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-orange-600 transition-all shadow-xl shadow-slate-200">
                  Launch Discovery Engine
                </Link>
              </div>
            )}
          </div>

          {/* Profile Summary */}
          <div className="p-12 bg-slate-900 text-white rounded-[3rem] overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-black/50"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Calendar size={22} className="text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">PROFILE STATUS</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs text-slate-400">Target Degree</span>
                  <span className="text-sm font-bold">{profile?.intended_degree || 'Not Set'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs text-slate-400">Countries</span>
                  <span className="text-sm font-bold">{profile?.preferred_countries?.length || 0} selected</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs text-slate-400">Budget</span>
                  <span className="text-sm font-bold">${profile?.budget_min?.toLocaleString() || 0} - ${profile?.budget_max?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs text-slate-400">IELTS</span>
                  <span className={`text-sm font-bold ${profile?.ielts_status === 'Completed' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {profile?.ielts_status || 'Not Started'}
                  </span>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                <Trophy size={40} className="text-orange-500 opacity-20" />
                <div className="text-right">
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Next Goal</p>
                  <p className="text-xs font-bold text-white tracking-widest bebas uppercase">
                    {currentStage === 2 ? 'Shortlist Universities' :
                      currentStage === 3 ? 'Lock Your Targets' :
                        currentStage === 4 ? 'Complete Applications' : 'Complete Profile'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
