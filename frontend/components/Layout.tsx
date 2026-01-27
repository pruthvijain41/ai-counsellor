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
  GraduationCap
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { shortlist, fetchShortlist } = useUniversityStore();

  // Fetch data for notifications
  useEffect(() => {
    fetchTasks();
    fetchShortlist();
  }, [fetchTasks, fetchShortlist]);

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

  return (
    <div className="flex h-screen bg-white overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-full shadow-2xl transition-transform active:scale-90"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-1 mb-12">
              <span className="text-orange-500 font-bold text-2xl bebas tracking-tighter">AI</span>
              <span className="text-slate-900 font-bold text-2xl bebas tracking-tighter">COUNSELLOR</span>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300
                    ${isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon size={18} strokeWidth={2} />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6">
            <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.fullName}&background=f97316&color=fff&rounded=true`}
                    className="w-10 h-10 rounded-xl"
                    alt="Avatar"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-widest">{user.fullName}</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest">Study Abroad Applicant</p>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Sign Out <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#fafafa]">
        {/* Header */}
        <header className="sticky top-0 z-30 w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 bebas tracking-widest uppercase">
              {currentTitle}
            </h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-orange-500 transition-all"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                          <p className="text-sm text-slate-400">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              navigate(notif.link);
                              setIsNotificationsOpen(false);
                            }}
                            className="w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-all text-left border-b border-slate-50 last:border-0"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                              <notif.icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-400 truncate">{notif.description}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            {/* Profile button */}
            <button
              onClick={() => navigate('/profile')}
              className="glass-dark px-6 md:px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
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