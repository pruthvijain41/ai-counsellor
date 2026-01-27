import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useUniversityStore } from '../store/universityStore';
import {
  LayoutDashboard,
  Search,
  Star,
  CheckSquare,
  MessageSquare,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  AlertCircle,
  Clock,
  GraduationCap,
  HelpCircle,
  Lock
} from 'lucide-react';
import AppTour from './AppTour';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [runTourManually, setRunTourManually] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { shortlist, fetchShortlist } = useUniversityStore();

  // Fetch data for notifications
  useEffect(() => {
    fetchTasks();
    fetchShortlist();
  }, [fetchTasks, fetchShortlist]);

  // Calculate readiness score to gate features
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
  const isLocked = readinessScore <= 75;
  const lockedPaths = ['/discover', '/shortlist', '/tracker', '/chat'];

  // Generate notifications based on app state
  const notifications = React.useMemo(() => {
    const notifs = [];

    // High priority tasks
    const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH' && !t.is_completed);
    if (highPriorityTasks.length > 0) {
      notifs.push({
        id: 'high-priority',
        icon: AlertCircle,
        color: 'text-red-500 bg-red-50',
        title: `${highPriorityTasks.length} urgent task${highPriorityTasks.length > 1 ? 's' : ''}`,
        description: 'Requires immediate attention',
        link: '/tracker'
      });
    }

    // Pending tasks
    const pendingTasks = tasks.filter(t => !t.is_completed);
    if (pendingTasks.length > 0) {
      notifs.push({
        id: 'pending-tasks',
        icon: Clock,
        color: 'text-orange-500 bg-orange-50',
        title: `${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}`,
        description: 'Complete to progress your applications',
        link: '/tracker'
      });
    }

    // Locked universities
    const lockedUniversities = shortlist.filter(u => u.status === 'LOCKED');
    if (lockedUniversities.length > 0) {
      notifs.push({
        id: 'locked-unis',
        icon: GraduationCap,
        color: 'text-emerald-500 bg-emerald-50',
        title: `${lockedUniversities.length} locked universit${lockedUniversities.length > 1 ? 'ies' : 'y'}`,
        description: 'Application tracking active',
        link: '/shortlist'
      });
    }

    // No locked universities warning
    if (lockedUniversities.length === 0 && shortlist.length > 0) {
      notifs.push({
        id: 'no-locked',
        icon: Star,
        color: 'text-purple-500 bg-purple-50',
        title: 'Lock a university',
        description: 'Start your application journey',
        link: '/shortlist'
      });
    }

    return notifs;
  }, [tasks, shortlist]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Discovery', icon: Search, path: '/discover' },
    { name: 'Shortlist', icon: Star, path: '/shortlist' },
    { name: 'Tracker', icon: CheckSquare, path: '/tracker' },
    { name: 'AI Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const currentPath = location.pathname;
  const currentTitle = navItems.find(item => item.path === currentPath)?.name || 'Overview';

  // Redirect if on a locked page
  useEffect(() => {
    if (isLocked && lockedPaths.includes(currentPath)) {
      navigate('/dashboard');
    }
  }, [isLocked, currentPath, navigate]);

  return (
    <div className="flex h-screen bg-transparent overflow-hidden selection:bg-orange-500 selection:text-white relative">
      <AppTour
        runManually={runTourManually}
        onFinish={() => setRunTourManually(false)}
      />
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 btn-gradient text-white rounded-full shadow-2xl transition-transform active:scale-90"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 glass-sidebar transition-transform duration-300 transform flex flex-col p-8
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-display font-extrabold text-lg tracking-[0.2em] text-slate-800 uppercase bebas">AI COUNCELLOR</h1>
        </div>

        {/* Lock Warning Banner */}
        {isLocked && (
          <div className="mb-6 p-4 bg-orange-50/80 border border-orange-200 rounded-2xl backdrop-blur-sm shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-500">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-orange-600 mb-0.5">Access Restricted</p>
                <p className="text-[9px] font-bold text-slate-600 leading-relaxed">
                  Complete your profile to <span className="text-orange-600">&gt;75%</span> to unlock AI tools.
                </p>
                <button onClick={() => navigate('/profile')} className="mt-2 text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 flex items-center gap-1">
                  Complete Now <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isItemLocked = isLocked && lockedPaths.includes(item.path);

            if (isItemLocked) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 cursor-not-allowed relative group"
                >
                  <span className="material-symbols-outlined absolute right-4 text-sm opacity-50">lock</span>
                  <span className="material-symbols-outlined opacity-50">
                    {item.name === 'Discovery' ? 'explore' :
                      item.name === 'Shortlist' ? 'star' :
                        item.name === 'Tracker' ? 'analytics' :
                          item.name === 'AI Chat' ? 'forum' : 'person'}
                  </span>
                  <span>{item.name}</span>

                  {/* Tooltip on hover */}
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    Unlock at 75% Profile
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300
                  tour-${item.path.replace('/', '')}
                  ${isActive
                    ? 'bg-white/60 border border-white/80 shadow-sm text-[var(--accent)]'
                    : 'text-slate-500 hover:text-[var(--accent)] hover:bg-white/40'}
                `}
              >
                <span className="material-symbols-outlined">
                  {item.name === 'Dashboard' ? 'dashboard' :
                    item.name === 'Discovery' ? 'explore' :
                      item.name === 'Shortlist' ? 'star' :
                        item.name === 'Tracker' ? 'analytics' :
                          item.name === 'AI Chat' ? 'forum' : 'person'}
                </span>
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          {/* Restart Tour Button */}
          <button
            onClick={() => setRunTourManually(true)}
            className="w-full py-3 px-5 bg-orange-50/50 border border-orange-100 rounded-2xl text-[10px] font-bold text-orange-500 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-3 tracking-[0.2em] group/tour shadow-sm"
          >
            <HelpCircle size={16} className="group-hover/tour:rotate-12 transition-transform" />
            RESTART TOUR
          </button>

          <div className="pt-8 border-t border-white/30">
            <div className="flex items-center gap-3 p-4 bg-white/40 border border-white/60 rounded-2xl relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user.fullName?.charAt(0) || 'PR'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate text-slate-800">{user.fullName?.toUpperCase()}</p>
                <p className="text-[10px] text-slate-500 tracking-wider">APPLICANT</p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                title="Logout"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Header */}
        <header className="sticky top-0 z-30 w-full h-24 bg-white/40 backdrop-blur-md border-b border-white/30 flex items-center justify-between px-6 md:px-10">
          <div>
            <h2 className="text-[10px] font-bold text-[var(--accent)] tracking-[0.3em] uppercase mb-1">
              {currentTitle === 'Dashboard' ? 'Overview' : currentTitle}
            </h2>
            <p className="text-2xl font-display font-bold text-slate-800">
              {currentTitle === 'Dashboard' ? 'Student Workspace' : `${currentTitle} Protocol`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-slate-500 hover:bg-white/80 transition-all relative tour-notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-[var(--accent)] rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-4 w-80 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 z-50 overflow-hidden">
                    <div className="p-5 border-b border-white/30">
                      <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">System Alerts</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">notifications_off</span>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Clear Status</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              navigate(notif.link);
                              setIsNotificationsOpen(false);
                            }}
                            className="w-full p-5 flex items-start gap-4 hover:bg-white/50 transition-all text-left border-b border-white/20 last:border-0"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm`}>
                              {/* Map icons to material symbols */}
                              <span className={`material-symbols-outlined ${notif.color.split(' ')[0]}`}>
                                {notif.id === 'high-priority' ? 'warning' :
                                  notif.id === 'pending-tasks' ? 'schedule' :
                                    notif.id === 'locked-unis' ? 'school' : 'star'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                              <p className="text-[10px] text-slate-500 truncate">{notif.description}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-white/30"></div>

            {/* Profile button */}
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 btn-light-refined rounded-2xl font-bold text-[10px] tracking-widest text-slate-700 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">account_circle</span>
              MY PROFILE
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;