
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
    <Layout user={user}>
      <div className="space-y-8 md:space-y-12 selection:bg-orange-500 selection:text-white">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2 md:mb-3 opacity-80">Application Progress</p>
            <h3 className="text-4xl md:text-6xl font-black text-slate-800 bebas tracking-[0.05em] uppercase leading-none">Task Tracker</h3>
          </div>
          <button
            onClick={handleGenerateTasks}
            disabled={isGenerating}
            className="flex items-center justify-center gap-3 md:gap-4 px-8 py-4 md:px-10 md:py-5 btn-gradient text-white rounded-[1.5rem] md:rounded-[1.8rem] font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-orange-500/30 disabled:opacity-70 disabled:translate-y-0 w-full md:w-auto"
          >
            <span className={`material-symbols-outlined text-[16px] md:text-[18px] ${isGenerating ? 'animate-spin' : ''}`}>
              {isGenerating ? 'refresh' : 'auto_awesome'}
            </span>
            <span>{isGenerating ? 'Generating...' : 'AI Generate Tasks'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { label: 'Total Missions', value: totalTasks, color: 'text-slate-800', icon: 'task_alt', gradient: 'from-slate-500/5 to-slate-500/10' },
            { label: 'Completed', value: completedTasks, color: 'text-emerald-500', icon: 'check_circle', gradient: 'from-emerald-500/5 to-emerald-500/10' },
            { label: 'Critical Ops', value: criticalTasks, color: 'text-red-500', icon: 'emergency', gradient: 'from-red-500/5 to-red-500/10' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-10 bg-white/60 backdrop-blur-md border-white rounded-[3.5rem] flex items-center justify-between shadow-xl shadow-slate-100/50 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-6xl font-black bebas tracking-[0.05em] ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
              <div className="relative z-10 w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-slate-50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <span className={`material-symbols-outlined text-3xl ${stat.color} opacity-80`}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
          <div className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-md border border-white rounded-[1.8rem] shadow-sm shadow-slate-200/50 overflow-x-auto no-scrollbar max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${filter === cat ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex bg-white/60 backdrop-blur-md border border-white p-1.5 rounded-[1.8rem] shadow-sm shadow-slate-200/50">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-300 ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">List</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-300 ${viewMode === 'timeline' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
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
          <div className="text-center py-20">
            <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium mb-4">
              {tasks.length === 0
                ? "No tasks yet. Lock some universities and generate tasks with AI!"
                : "No tasks in this category."
              }
            </p>
            {tasks.length === 0 && (
              <button
                onClick={handleGenerateTasks}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-widest hover:underline"
              >
                <Plus size={16} /> Generate Tasks
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-5 md:space-y-8">
            {filteredTasks.map(task => (
              <div key={task.id} className={`group p-6 md:p-10 bg-white/60 backdrop-blur-md border border-white transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col md:flex-row md:items-center justify-between hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:-translate-y-1 relative overflow-hidden ${task.is_completed ? 'opacity-50 grayscale-[0.5]' : 'shadow-xl shadow-slate-100/50'}`}>
                {task.priority === 'HIGH' && !task.is_completed && (
                  <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-red-500/80"></div>
                )}
                <div className="flex items-center gap-4 md:gap-8 relative z-10">
                  <button
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={task.is_completed}
                    className={`transition-all duration-500 relative flex items-center justify-center group/check shrink-0 ${task.is_completed ? 'text-emerald-500' : 'text-slate-200 hover:text-orange-500'}`}
                  >
                    <span className="material-symbols-outlined text-[28px] md:text-[36px] font-light">
                      {task.is_completed ? 'check_circle' : 'circle'}
                    </span>
                    {!task.is_completed && (
                      <span className="material-symbols-outlined text-[14px] md:text-[18px] absolute opacity-0 group-hover/check:opacity-100 transition-opacity">check</span>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2 md:mb-3">
                      <h5 className={`text-lg md:text-2xl font-black tracking-tight leading-none transition-all ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </h5>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border border-transparent ${task.priority === 'HIGH' ? 'bg-red-500 text-white shadow-red-500/20' :
                        task.priority === 'MEDIUM' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                        {task.priority} ALERT
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[16px] text-orange-500">
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
                      <span className="flex items-center gap-2.5 text-slate-800">
                        <span className="material-symbols-outlined text-[16px] text-orange-500">event</span>
                        Deadline: {formatDate(task.deadline)}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-4 text-[13px] text-slate-500 font-medium leading-relaxed max-w-2xl opacity-80">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-8 md:mt-0 flex items-center justify-end relative z-10">
                  <button className="w-14 h-14 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-all bg-white border border-slate-50 rounded-2xl shadow-sm hover:shadow-md hover:scale-110">
                    <span className="material-symbols-outlined text-[28px]">chevron_right</span>
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mb-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative py-12 px-4 md:px-14">
            {/* Timeline Line */}
            <div className="absolute left-10 md:left-20 top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500/0 via-slate-100 to-slate-100/0"></div>

            {/* Next Milestone Banner */}
            {filteredTasks.filter(t => !t.is_completed).length > 0 && (
              <div className="mb-20 ml-16 md:ml-32 p-8 bg-white/60 backdrop-blur-xl rounded-[3.5rem] border border-white shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[80px] group-hover:opacity-100 transition-opacity opacity-70"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="w-16 h-16 btn-gradient rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-orange-500/20 ring-4 ring-orange-500/5">
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2 leading-none">Critical Milestone Alert</p>
                    <h4 className="text-2xl font-black mb-2 tracking-tight text-slate-800">Deployment Strategy Required</h4>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-2xl opacity-80">High-priority targets detected in the near-term horizon. Focus mission parameters on pending clearances to maintain protocol synchronization.</p>
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
              <div key={month} className="mb-20 last:mb-0 relative">
                {/* Month Header */}
                <div className="flex items-center gap-6 mb-12 relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-[6px] border-slate-50 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 md:w-6 md:h-6 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 bebas tracking-[0.1em]">{month}</h3>
                </div>

                {/* Tasks */}
                <div className="space-y-8 ml-16 md:ml-32">
                  {monthTasks.map(task => (
                    <div key={task.id} className={`glass-panel p-8 bg-white/60 backdrop-blur-md border border-white rounded-[3rem] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden ${task.priority === 'HIGH' && !task.is_completed ? 'ring-2 ring-red-500/20' : 'shadow-xl shadow-slate-100/50'}`}>
                      {task.priority === 'HIGH' && !task.is_completed && (
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                      )}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                        <div className="flex items-start gap-6">
                          <button
                            onClick={() => handleToggleTask(task.id, task.is_completed)}
                            disabled={task.is_completed}
                            className={`mt-1.5 transition-all duration-500 ${task.is_completed ? 'text-emerald-500' : 'text-slate-200 hover:text-orange-500'}`}
                          >
                            <span className="material-symbols-outlined text-[32px]">
                              {task.is_completed ? 'check_circle' : 'circle'}
                            </span>
                          </button>
                          <div>
                            <h5 className={`font-black text-xl mb-2 tracking-tight ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</h5>
                            {task.university_name && (
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-[14px]">school</span>
                                {task.university_name}
                              </p>
                            )}
                            {task.description && <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-2xl opacity-80">{task.description}</p>}

                            <div className="flex flex-wrap gap-3 mt-6">
                              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border border-transparent ${task.priority === 'HIGH' ? 'bg-red-500 text-white shadow-red-500/20' :
                                task.priority === 'MEDIUM' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                {task.priority} ALERT
                              </span>
                              <span className="px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] bg-white border border-slate-100 text-slate-400 shadow-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[12px] text-orange-500">category</span>
                                {task.type || 'GENERAL'}
                              </span>
                              {task.deadline && (
                                <span className="px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] bg-orange-50 text-orange-600 border border-orange-100 shadow-sm flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[12px]">event</span>
                                  {new Date(task.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-0 bottom-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tracker;
