
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { UserProfile } from '../types';
import { Lock, Unlock, Trash2, Send, GraduationCap, ChevronRight, LayoutGrid, List as ListIcon, ShieldCheck, Loader2, Globe, AlertTriangle, X } from 'lucide-react';
import { useUniversityStore } from '../store/universityStore';
import { useTaskStore } from '../store/taskStore';

interface ShortlistProps {
  user: UserProfile;
}

const Shortlist: React.FC<ShortlistProps> = ({ user }) => {
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [deleteWarning, setDeleteWarning] = useState<{ open: boolean; name: string }>({ open: false, name: '' });
  const { shortlist, isLoading, fetchShortlist, lockUniversity, unlockUniversity, removeFromShortlist } = useUniversityStore();
  const { fetchTasks } = useTaskStore();

  // Fetch shortlist on mount
  useEffect(() => {
    fetchShortlist();
  }, [fetchShortlist]);

  const handleLock = async (id: string) => {
    await lockUniversity(id);
  };

  const handleUnlock = async () => {
    if (unlockModal.id) {
      await unlockUniversity(unlockModal.id);
      // Refetch tasks since associated tasks are deleted on unlock
      await fetchTasks();
      setUnlockModal({ open: false, id: '', name: '' });
    }
  };

  const handleRemove = async (item: any) => {
    if (item.status === 'LOCKED') {
      setDeleteWarning({ open: true, name: item.university_name });
      return;
    }
    await removeFromShortlist(item.id);
    // Refetch tasks since associated tasks are deleted on remove
    await fetchTasks();
  };

  const lockedCount = shortlist.filter(i => i.status === 'LOCKED').length;
  const shortlistedCount = shortlist.filter(i => i.status === 'SHORTLISTED').length;

  // Get match type color
  const getTypeColor = (type: string | undefined) => {
    switch (type) {
      case 'Dream': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Target': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Safe': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <Layout user={user} fullWidth={true}>
      <div className="max-w-7xl mx-auto w-full h-full p-6 md:p-10">
        <div className="space-y-8 md:space-y-12 selection:bg-orange-500 selection:text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
            <div>
              <h3 className="text-3xl md:text-5xl font-black text-slate-800 bebas tracking-[0.1em] uppercase">University Shortlist</h3>
              <p className="text-slate-500 font-bold mt-2 uppercase text-[9px] md:text-[11px] tracking-widest opacity-70">Manage your selection and lock institutions to start application tasks.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-slate-500 font-medium">Loading shortlist...</span>
            </div>
          ) : shortlist.length === 0 ? (
            <div className="text-center py-20">
              <Globe size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium mb-4">Your shortlist is empty.</p>
              <a href="#/discover" className="text-orange-500 font-bold text-sm uppercase tracking-widest hover:underline">
                Discover Universities →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {shortlist.map(item => (
                    <div key={item.id} className={`p-8 bg-white/60 backdrop-blur-md border border-white transition-all rounded-[3.5rem] relative overflow-hidden group shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-orange-100/30 hover:-translate-y-1 duration-500 ${item.status === 'LOCKED' ? 'ring-2 ring-orange-500/20 shadow-orange-100/40' : ''}`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {item.status === 'LOCKED' && (
                        <div className="absolute top-8 right-8 w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 ring-4 ring-orange-500/5">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-800 font-black bebas text-3xl shadow-sm border border-slate-50 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                            {item.university_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-2">{item.university_name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{item.country}</p>
                            </div>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-sm ${item.enriched_data?.match_type === 'Dream' ? 'bg-purple-500 text-white shadow-purple-500/20' :
                          item.enriched_data?.match_type === 'Target' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                            'bg-emerald-500 text-white shadow-emerald-500/20'
                          }`}>
                          {item.enriched_data?.match_type || 'Target'}
                        </span>
                      </div>

                      {/* Match Score */}
                      {item.enriched_data?.match_score && (
                        <div className="mb-8 p-5 bg-white/40 rounded-[2rem] border border-white/60 shadow-inner">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Match Protocol</span>
                            <span className="text-lg font-black text-orange-500 bebas tracking-widest">{item.enriched_data.match_score}%</span>
                          </div>
                          <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden p-[1px]">
                            <div
                              className="h-full btn-gradient rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                              style={{ width: `${item.enriched_data.match_score}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4 mb-10 px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Status</span>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${item.status === 'LOCKED' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : i === 1 ? 'bg-slate-300' : 'bg-slate-100'}`}></div>
                            ))}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.status === 'LOCKED' ? 'text-orange-500' : 'text-slate-400'}`}>
                            {item.status === 'LOCKED' ? 'Active' : 'Queued'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {item.status !== 'LOCKED' ? (
                          <button
                            onClick={() => handleLock(item.id)}
                            className="flex-1 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-slate-200"
                          >
                            <span className="material-symbols-outlined text-[18px]">lock_open</span> Lock & Apply
                          </button>
                        ) : (
                          <div className="flex-1 flex gap-3">
                            <button className="flex-1 py-5 btn-gradient text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 cursor-default shadow-xl shadow-orange-100">
                              <span className="material-symbols-outlined text-[18px]">rocket_launch</span> In Progress
                            </button>
                            <button
                              onClick={() => setUnlockModal({ open: true, id: item.id, name: item.university_name })}
                              className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-orange-50 hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm active:scale-90"
                              title="Unlock University"
                            >
                              <span className="material-symbols-outlined text-[20px]">lock_open_right</span>
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleRemove(item)}
                          className="w-14 h-14 flex items-center justify-center bg-white border border-red-50 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-2xl transition-all shadow-sm active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <div className="glass-panel p-10 rounded-[3.5rem] border-white shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -mr-24 -mt-24 blur-[60px] group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <h4 className="text-[12px] font-black text-slate-800 tracking-[0.3em] uppercase">Strategy Insights</h4>
                      <span className="material-symbols-outlined text-orange-500">analytics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-5 mb-8">
                      <div className="p-8 bg-white/40 rounded-[2.8rem] border border-white/80 shadow-sm flex flex-col items-center text-center group/card hover:bg-white/60 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/5 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-orange-500 opacity-60">verified</span>
                        </div>
                        <span className="text-4xl font-black bebas tracking-[0.05em] text-slate-800">{lockedCount}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 uppercase">Locked</span>
                      </div>
                      <div className="p-8 bg-white/40 rounded-[2.8rem] border border-white/80 shadow-sm flex flex-col items-center text-center group/card hover:bg-white/60 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/5 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-orange-400 opacity-60">pending</span>
                        </div>
                        <span className="text-4xl font-black bebas tracking-[0.05em] text-slate-800">{shortlistedCount}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 uppercase">Pipeline</span>
                      </div>
                    </div>

                    <div className="p-6 bg-white/40 rounded-[2.2rem] border border-white/80 shadow-sm flex items-center justify-between px-8 hover:bg-white/60 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100/50 rounded-xl flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Assets</span>
                      </div>
                      <span className="text-2xl font-black bebas tracking-[0.1em] text-slate-800">{shortlist.length}</span>
                    </div>
                    <div className="mt-12 p-6 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-[2.2rem] border border-orange-500/10 flex items-center gap-5">
                      <div className="w-14 h-14 btn-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 ring-4 ring-orange-500/5">
                        <span className="material-symbols-outlined text-2xl">school</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-tight">Built for Victory</p>
                        <a href="#/tracker" className="text-[11px] font-black text-orange-500 hover:text-orange-600 transition-all uppercase tracking-widest mt-1 block">Start Task Tracking</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-10 rounded-[3.5rem] border-white/60 shadow-xl shadow-slate-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">psychology</span>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Logic</h5>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-bold opacity-80">
                    {lockedCount === 0
                      ? "Lock at least one university to start your application journey."
                      : lockedCount < 3
                        ? "Consider locking more universities to maximize your chances."
                        : "Great balance! You have a solid application strategy."
                    }
                  </p>
                  <div className="mt-8 pt-8 border-t border-slate-100/60">
                    <a href="#/chat" className="text-[10px] font-black text-orange-500 flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest group">
                      AI Strategy Refresh
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Unlock Confirmation Modal */}
      {unlockModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/5 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white/20" onClick={() => setUnlockModal({ open: false, id: '', name: '' })}></div>
          <div className="glass-panel w-full max-w-md rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border-white/60 animate-in zoom-in-95 duration-500 relative z-10">
            <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center text-orange-500 mb-8 mx-auto ring-8 ring-orange-500/5">
              <span className="material-symbols-outlined text-[40px]">lock_open</span>
            </div>
            <h3 className="text-3xl font-black text-center text-slate-800 mb-4 bebas tracking-[0.1em] uppercase">Protocol Unlock?</h3>
            <p className="text-slate-500 text-center mb-10 font-bold uppercase text-[10px] tracking-widest leading-relaxed px-4">
              Are you sure you want to unlock <span className="text-orange-500 underline decoration-2 underline-offset-4">{unlockModal.name}</span>?
              This will suspend active task tracking.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setUnlockModal({ open: false, id: '', name: '' })}
                className="flex-1 py-5 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 py-5 btn-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-orange-100"
              >
                Confirm Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked Delete Warning Modal */}
      {deleteWarning.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/5 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white/20" onClick={() => setDeleteWarning({ open: false, name: '' })}></div>
          <div className="glass-panel w-full max-w-md rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border-white/60 animate-in zoom-in-95 duration-500 relative z-10">
            <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 mb-8 mx-auto ring-8 ring-amber-500/5">
              <span className="material-symbols-outlined text-[40px]">priority_high</span>
            </div>
            <h3 className="text-3xl font-black text-center text-slate-800 mb-4 bebas tracking-[0.1em] uppercase">Protocol Alert</h3>
            <p className="text-slate-500 text-center mb-10 font-bold uppercase text-[10px] tracking-widest leading-relaxed px-4">
              <span className="text-slate-800">{deleteWarning.name}</span> is currently <span className="text-orange-500">Locked & Applied</span>.
              Removal is restricted during active missions. Unlock the institution first to proceed with removal.
            </p>
            <button
              onClick={() => setDeleteWarning({ open: false, name: '' })}
              className="w-full py-5 btn-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-orange-100"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Shortlist;
