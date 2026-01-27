
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
      <div className="space-y-10 selection:bg-orange-500 selection:text-white">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.4em] mb-2">Application Progress</p>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 bebas tracking-widest uppercase">TASK TRACKER</h3>
          </div>
          <button
            onClick={handleGenerateTasks}
            disabled={isGenerating}
            className="flex items-center gap-3 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 disabled:opacity-70"
          >
            {isGenerating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating...</>
            ) : (
              <><Sparkles size={18} /> AI Generate Tasks</>
            )}
          </button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Missions', value: totalTasks, color: 'bg-white text-slate-900' },
            { label: 'Completed', value: completedTasks, color: 'bg-white text-emerald-500' },
            { label: 'Critical Ops', value: criticalTasks, color: 'bg-white text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-between shadow-sm group hover:border-orange-200 transition-all duration-500">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-4xl font-bold bebas tracking-widest ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
                <ClipboardList size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex bg-white border border-slate-100 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <ClipboardList size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">List</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === 'timeline' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <Calendar size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Timeline</span>
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
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div key={task.id} className={`group p-6 md:p-8 bg-white border transition-all duration-500 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between hover:shadow-2xl hover:border-orange-100 ${task.is_completed ? 'opacity-60 grayscale' : 'border-slate-100'}`}>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={task.is_completed}
                    className={`transition-all duration-500 ${task.is_completed ? 'text-emerald-500 scale-110' : 'text-slate-200 hover:text-orange-500'}`}
                  >
                    {task.is_completed ? <CheckCircle2 size={40} /> : <Circle size={40} strokeWidth={1.5} />}
                  </button>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h5 className={`text-xl font-bold tracking-tight transition-all ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </h5>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                        {task.priority} ALERT
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(task.type)}
                        {task.type || 'General'}
                      </span>
                      {task.university_name && (
                        <span className="flex items-center gap-2">
                          <AlertCircle size={14} className="text-slate-300" /> {task.university_name}
                        </span>
                      )}
                      <span className="flex items-center gap-2 text-slate-900">
                        <Calendar size={14} className="text-orange-500" /> DEADLINE: {formatDate(task.deadline)}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 md:mt-0 flex items-center justify-end">
                  <button className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-all bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative py-10 px-4 md:px-10">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-14 top-0 bottom-0 w-0.5 bg-slate-100"></div>

            {/* Next Milestone Banner */}
            {filteredTasks.filter(t => !t.is_completed).length > 0 && (
              <div className="mb-16 ml-12 md:ml-20 p-6 bg-slate-900 rounded-[2rem] border border-slate-800 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl text-orange-500">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-1">Critical Milestone</p>
                    <h4 className="text-xl font-bold mb-2">Upcoming Deadlines Detected</h4>
                    <p className="text-sm text-slate-400">Your application strategy requires attention. Focus on high-priority tasks to maintain momentum.</p>
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
              <div key={month} className="mb-16 last:mb-0 relative">
                {/* Month Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white border-4 border-slate-50 rounded-full flex-shrink-0 relative z-10 shadow-sm">
                    <div className="absolute inset-0 m-auto w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 bebas tracking-widest">{month}</h3>
                </div>

                {/* Tasks */}
                <div className="space-y-6 ml-12 md:ml-20">
                  {monthTasks.map(task => (
                    <div key={task.id} className={`p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:border-orange-100 transition-all duration-300 ${task.priority === 'HIGH' && !task.is_completed ? 'border-l-4 border-l-red-500' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => handleToggleTask(task.id, task.is_completed)}
                            disabled={task.is_completed}
                            className={`mt-1 transition-all ${task.is_completed ? 'text-emerald-500' : 'text-slate-200 hover:text-orange-500'}`}
                          >
                            {task.is_completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                          </button>
                          <div>
                            <h5 className={`font-bold text-lg mb-1 ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h5>
                            {task.university_name && (
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                <AlertCircle size={10} /> {task.university_name}
                              </p>
                            )}
                            {task.description && <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{task.description}</p>}

                            <div className="flex flex-wrap gap-2 mt-4">
                              <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className="px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                                {task.type || 'GENERAL'}
                              </span>
                              {task.deadline && (
                                <span className="px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1">
                                  <Calendar size={10} /> {new Date(task.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
