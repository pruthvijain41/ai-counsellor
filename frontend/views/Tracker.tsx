
import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import LockedOverlay from '../components/LockedOverlay';
import { UserProfile } from '../types';
import {
  Calendar,
  ChevronRight,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ClipboardList,
  FormInput,
  Loader2,
  Sparkles,
  Plus
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useUniversityStore } from '../store/universityStore';

interface TrackerProps {
  user: UserProfile;
}

const Tracker: React.FC<TrackerProps> = ({ user }) => {
  const [viewMode, setViewMode] = React.useState<'list' | 'timeline'>('list');
  const { shortlist, fetchShortlist } = useUniversityStore();

  // Fetch shortlist to check for locked universities
  useEffect(() => {
    fetchShortlist();
  }, [fetchShortlist]);

  // Lock check: Tracker requires at least one locked university
  const hasLockedUniversities = shortlist.some(u => u.status === 'LOCKED');

  if (!hasLockedUniversities) {
    return (
      <LockedOverlay
        user={user}
        title="Tracker Locked"
        message="Lock at least one university in your shortlist to unlock the Strategic Tracker. Locking universities enables application-specific task generation and deadline tracking."
        actionLink="/shortlist"
        actionLabel="Go to Shortlist"
        icon="lock"
      />
    );
  }
  const {
    tasks,
    isLoading,
    isGenerating,
    filter,
    fetchTasks,
    generateTasks,
    completeTask,
    setFilter
  } = useTaskStore();

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleTask = async (id: string, isCompleted: boolean) => {
    if (!isCompleted) {
      await completeTask(id);
    }
  };

  const handleGenerateTasks = async () => {
    await generateTasks();
  };

  const categories = ['All', 'DOC', 'EXAM', 'FORM', 'SOP', 'VISA'];
  const filteredTasks = tasks.filter(t => filter === 'All' || t.type === filter);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const criticalTasks = tasks.filter(t => t.priority === 'HIGH' && !t.is_completed).length;

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-50 text-red-600 border-red-100';
      case 'MEDIUM': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  // Get category icon
  const getCategoryIcon = (type: string | null) => {
    switch (type) {
      case 'DOC':
      case 'SOP':
        return <FileText size={14} className="text-orange-500" />;
      case 'EXAM':
        return <Clock size={14} className="text-orange-500" />;
      case 'FORM':
      case 'VISA':
        return <FormInput size={14} className="text-orange-500" />;
      default:
        return <ClipboardList size={14} className="text-orange-500" />;
    }
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No deadline';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout user={user} fullWidth={true}>
      <div className="max-w-7xl mx-auto w-full h-full p-6 md:p-10">
        <div className="space-y-10 md:space-y-16 selection:bg-orange-500 selection:text-white">
          {/* Enhanced Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {[
              { label: 'Total Missions', value: totalTasks, color: 'text-slate-800', icon: 'task_alt', gradient: 'from-slate-500/5 to-slate-500/10' },
              { label: 'Completed', value: completedTasks, color: 'text-emerald-500', icon: 'check_circle', gradient: 'from-emerald-500/5 to-emerald-500/10' },
              { label: 'Critical Ops', value: criticalTasks, color: 'text-red-500', icon: 'emergency', gradient: 'from-red-500/5 to-red-500/10' },
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-8 md:p-10 bg-white/40 backdrop-blur-md border border-white/50 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-between shadow-xl shadow-slate-200/20 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-5xl md:text-6xl font-black bebas tracking-wider ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
                <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-white/80 rounded-2xl flex items-center justify-center shadow-lg border border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <span className={`material-symbols-outlined text-2xl md:text-3xl ${stat.color} opacity-80`}>{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6">
            <div className="flex items-center gap-2.5 p-2 bg-white/40 backdrop-blur-md border border-white/60 rounded-[2rem] shadow-sm shadow-slate-200/40 overflow-x-auto no-scrollbar max-w-full">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${filter === cat ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30' : 'text-slate-400 hover:text-slate-700 hover:bg-white/40'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex bg-white/40 backdrop-blur-md border border-white/60 p-2 rounded-[2rem] shadow-sm shadow-slate-200/40">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-3 px-7 py-3.5 rounded-2xl transition-all duration-500 ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30' : 'text-slate-300 hover:text-slate-600'}`}
              >
                <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">List</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-3 px-7 py-3.5 rounded-2xl transition-all duration-500 ${viewMode === 'timeline' ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30' : 'text-slate-300 hover:text-slate-600'}`}
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Timeline</span>
              </button>
            </div>
          </div>

          {/* Task List or Timeline */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-slate-500 font-medium">Loading tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-24 glass-panel bg-white/30 backdrop-blur-md border border-white/50 rounded-[3rem] animate-in fade-in zoom-in duration-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-orange-500 shadow-2xl mx-auto mb-8 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <div className="absolute inset-0 bg-orange-500 rounded-[2rem] animate-ping opacity-10"></div>
                <ClipboardList className="w-10 h-10" />
              </div>

              <div className="relative z-10">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4 opacity-70">
                  {tasks.length === 0
                    ? "Mission Parameters Required"
                    : "Category Sequence Empty"
                  }
                </p>

                <h4 className="text-3xl md:text-4xl font-black text-slate-800 bebas tracking-widest mb-4 uppercase">
                  {tasks.length === 0
                    ? "Initialize Strategic Protocol"
                    : `${filter} Ops Not Found`
                  }
                </h4>

                <p className="text-[13px] text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed opacity-80">
                  {tasks.length === 0
                    ? "Lock your top universities in the Shortlist to enable AI-powered task generation and deadline tracking."
                    : `We haven't detected any ${filter} specific tasks for your current mission profile. Try generating new strategy or switching categories.`
                  }
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  {tasks.length === 0 ? (
                    <button
                      onClick={() => window.location.hash = '/shortlist'}
                      className="flex items-center gap-3 px-10 py-5 btn-gradient text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-orange-500/30"
                    >
                      <span className="material-symbols-outlined text-[18px]">target</span>
                      <span>Go to Shortlist</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateTasks}
                      disabled={isGenerating}
                      className="flex items-center gap-3 px-10 py-5 btn-gradient text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-orange-500/30 disabled:opacity-70"
                    >
                      <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>{isGenerating ? 'Syncing...' : 'Generate with AI'}</span>
                    </button>
                  )}

                  {tasks.length > 0 && (
                    <button
                      onClick={() => setFilter('All')}
                      className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-orange-500 transition-colors"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-6 md:space-y-10">
              {filteredTasks.map(task => (
                <div key={task.id} className={`group p-8 md:p-12 bg-white/40 backdrop-blur-md border border-white/60 transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] flex flex-col md:flex-row md:items-center justify-between hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden ${task.is_completed ? 'opacity-50 grayscale-[0.3]' : 'shadow-xl shadow-slate-200/40'}`}>
                  {task.priority === 'HIGH' && !task.is_completed && (
                    <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-red-500/60"></div>
                  )}
                  <div className="flex items-center gap-6 md:gap-10 relative z-10">
                    <button
                      onClick={() => handleToggleTask(task.id, task.is_completed)}
                      disabled={task.is_completed}
                      className={`transition-all duration-500 relative flex items-center justify-center group/check shrink-0 ${task.is_completed ? 'text-emerald-500' : 'text-slate-200 hover:text-orange-500'}`}
                    >
                      <span className="material-symbols-outlined text-[32px] md:text-[44px] font-light">
                        {task.is_completed ? 'check_circle' : 'circle'}
                      </span>
                      {!task.is_completed && (
                        <span className="material-symbols-outlined text-[16px] md:text-[20px] absolute opacity-0 group-hover/check:opacity-100 transition-opacity">check</span>
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 md:gap-5 mb-3 md:mb-4">
                        <h5 className={`text-xl md:text-3xl font-black tracking-tight leading-tight transition-all uppercase bebas ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {task.title}
                        </h5>
                        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border border-transparent ${task.priority === 'HIGH' ? 'bg-red-500 text-white shadow-red-500/20' :
                          task.priority === 'MEDIUM' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                          {task.priority} ALERT
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 md:gap-8 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[16px] text-orange-500 opacity-70">
                            {task.type === 'DOC' || task.type === 'SOP' ? 'description' :
                              task.type === 'EXAM' ? 'history_edu' :
                                task.type === 'FORM' || task.type === 'VISA' ? 'assignment' : 'task'}
                          </span>
                          {task.type || 'General Status'}
                        </span>
                        {task.university_name && (
                          <span className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            {task.university_name}
                          </span>
                        )}
                        <span className="flex items-center gap-2.5 text-slate-700">
                          <span className="material-symbols-outlined text-[18px] text-orange-500">event</span>
                          <span className="text-orange-500">Deadline: {formatDate(task.deadline)}</span>
                        </span>
                      </div>
                      {task.description && (
                        <p className="mt-5 text-[14px] text-slate-500 font-medium leading-relaxed max-w-3xl opacity-70">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 md:mt-0 flex items-center justify-end relative z-10 px-4">
                    <button className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-all bg-white/50 border border-white rounded-2xl shadow-sm hover:shadow-xl hover:scale-110">
                      <span className="material-symbols-outlined text-[32px]">chevron_right</span>
                    </button>
                  </div>
                  <div className="absolute right-0 bottom-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] -mr-40 -mb-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative py-12 px-4 md:px-14">
              {/* Premium Timeline Rail */}
              <div className="absolute left-10 md:left-20 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>

              {/* Strategy Milestone Banner */}
              {filteredTasks.filter(t => !t.is_completed).length > 0 && (
                <div className="mb-24 ml-16 md:ml-32 p-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] group-hover:opacity-100 transition-opacity opacity-70"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-20 h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 ring-4 ring-orange-500/20">
                      <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.5em] mb-3 leading-none opacity-80">Critical Mission Status</p>
                      <h4 className="text-3xl font-black mb-3 tracking-wider text-white bebas uppercase">Deployment Phase Active</h4>
                      <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-2xl">High-priority targets detected. Synchronize your application protocols to maintain admission trajectory. All systems are go.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Items Grouped by Month */}
              {Object.entries(
                filteredTasks.reduce((acc, task) => {
                  const date = task.deadline ? new Date(task.deadline) : new Date(8640000000000000); // Far future for no deadline
                  const key = task.deadline
                    ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
                    : 'FLEXIBLE SCHEDULE';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(task);
                  return acc;
                }, {} as Record<string, typeof tasks>)
              ).sort((a, b) => {
                if (a[0] === 'FLEXIBLE SCHEDULE') return 1;
                if (b[0] === 'FLEXIBLE SCHEDULE') return -1;
                return new Date(a[0]).getTime() - new Date(b[0]).getTime();
              }).map(([month, monthTasks]) => (
                <div key={month} className="mb-24 last:mb-0 relative">
                  {/* Month Indicator */}
                  <div className="flex items-center gap-8 mb-16 relative z-10">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-white border-[8px] border-slate-50 rounded-full flex-shrink-0 flex items-center justify-center shadow-xl">
                      <div className="w-3 h-3 md:w-5 md:h-5 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)]"></div>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-800 bebas tracking-[0.15em] uppercase">{month}</h3>
                  </div>

                  {/* Task Sequence */}
                  <div className="space-y-10 ml-16 md:ml-36">
                    {monthTasks.map(task => (
                      <div key={task.id} className={`glass-panel p-8 md:p-12 bg-white/40 backdrop-blur-md border border-white/60 rounded-[3rem] hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 relative overflow-hidden ${task.priority === 'HIGH' && !task.is_completed ? 'ring-2 ring-red-500/20' : 'shadow-xl shadow-slate-200/40'}`}>
                        {task.priority === 'HIGH' && !task.is_completed && (
                          <div className="absolute top-0 left-0 w-2 h-full bg-red-500/60"></div>
                        )}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                          <div className="flex items-start gap-8">
                            <button
                              onClick={() => handleToggleTask(task.id, task.is_completed)}
                              disabled={task.is_completed}
                              className={`mt-1.5 transition-all duration-500 relative flex items-center justify-center group/check shrink-0 ${task.is_completed ? 'text-emerald-500' : 'text-slate-200 hover:text-orange-500'}`}
                            >
                              <span className="material-symbols-outlined text-[36px] md:text-[44px] font-light">
                                {task.is_completed ? 'check_circle' : 'circle'}
                              </span>
                              {!task.is_completed && (<span className="material-symbols-outlined text-base absolute opacity-0 group-hover/check:opacity-100 transition-opacity">check</span>)}
                            </button>
                            <div>
                              <h5 className={`font-black text-xl md:text-3xl mb-4 tracking-tight leading-tight uppercase bebas ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</h5>
                              {task.university_name && (
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5 mb-6">
                                  <span className="material-symbols-outlined text-[16px]">school</span>
                                  {task.university_name}
                                </p>
                              )}
                              {task.description && <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-2xl opacity-70 mb-8">{task.description}</p>}

                              <div className="flex flex-wrap gap-4">
                                <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border border-transparent ${task.priority === 'HIGH' ? 'bg-red-500 text-white shadow-red-500/20' :
                                  task.priority === 'MEDIUM' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                  {task.priority} ALERT
                                </span>
                                <span className="px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-white border border-slate-100 text-slate-400 shadow-sm flex items-center gap-2.5">
                                  <span className="material-symbols-outlined text-[14px] text-orange-500">category</span>
                                  {task.type || 'MISSION'}
                                </span>
                                {task.deadline && (
                                  <span className="px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-orange-50 text-orange-600 border border-orange-100 shadow-sm flex items-center gap-2.5">
                                    <span className="material-symbols-outlined text-[14px]">event</span>
                                    {new Date(task.deadline).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] -mr-24 -mb-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout >
  );
};

export default Tracker;
