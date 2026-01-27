
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { UserProfile } from '../types';
import { Lock, Unlock, Trash2, Send, GraduationCap, ChevronRight, LayoutGrid, List as ListIcon, ShieldCheck, Loader2, Globe, AlertTriangle, X } from 'lucide-react';
import { useUniversityStore } from '../store/universityStore';

interface ShortlistProps {
  user: UserProfile;
}

const Shortlist: React.FC<ShortlistProps> = ({ user }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const { shortlist, isLoading, fetchShortlist, lockUniversity, unlockUniversity, removeFromShortlist } = useUniversityStore();

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
      setUnlockModal({ open: false, id: '', name: '' });
    }
  };

  const handleRemove = async (id: string) => {
    await removeFromShortlist(id);
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
    <Layout user={user}>
      <div className="space-y-10 selection:bg-orange-500 selection:text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-4xl font-bold text-slate-900 bebas tracking-widest">UNIVERSITY SHORTLIST</h3>
            <p className="text-slate-500 font-medium mt-1">Manage your selection and lock institutions to start application tasks.</p>
          </div>
          <div className="flex bg-white border border-slate-100 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setView('grid')}
              className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <ListIcon size={20} />
            </button>
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
                  <div key={item.id} className={`p-8 bg-white border transition-all rounded-[2.5rem] relative overflow-hidden group ${item.status === 'LOCKED' ? 'border-orange-500/20 bg-orange-50/5' : 'border-slate-100 hover:shadow-2xl'}`}>
                    {item.status === 'LOCKED' && (
                      <div className="absolute top-0 right-0 p-4">
                        <ShieldCheck size={20} className="text-orange-500" />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-bold bebas text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                          {item.university_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xl tracking-tight">{item.university_name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.country}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getTypeColor(item.enriched_data?.match_type)}`}>
                        {item.enriched_data?.match_type || 'Target'}
                      </span>
                    </div>

                    {/* Match Score */}
                    {item.enriched_data?.match_score && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-bold uppercase tracking-widest">Match Score</span>
                          <span className="text-orange-500 font-bold">{item.enriched_data.match_score}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${item.enriched_data.match_score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ease-out ${item.status === 'LOCKED' ? 'w-full bg-orange-500' : 'w-10 bg-slate-200'}`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.status}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status !== 'LOCKED' ? (
                        <button
                          onClick={() => handleLock(item.id)}
                          className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-100"
                        >
                          <Lock size={14} /> Lock & Apply
                        </button>
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-default shadow-xl shadow-slate-200">
                            <Send size={14} /> Application Active
                          </button>
                          <button
                            onClick={() => setUnlockModal({ open: true, id: item.id, name: item.university_name })}
                            className="w-12 flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Unlock University"
                          >
                            <Unlock size={16} />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-10 bg-slate-900 text-white rounded-[3rem] overflow-hidden relative shadow-2xl">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold bebas tracking-widest mb-6">STRATEGY INSIGHTS</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Locked Schools</span>
                      <span className="font-bold text-xl bebas tracking-widest text-orange-500">{lockedCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shortlisted</span>
                      <span className="font-bold text-xl bebas tracking-widest text-orange-400">{shortlistedCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                      <span className="font-bold text-xl bebas tracking-widest text-white">{shortlist.length}</span>
                    </div>
                  </div>
                  <div className="mt-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Built for Victory</p>
                      <a href="#/tracker" className="text-sm font-bold text-orange-400 hover:underline transition-all">Start Task Tracking</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem]">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Application Logic</h5>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {lockedCount === 0
                    ? "Lock at least one university to start your application journey."
                    : lockedCount < 3
                      ? "Consider locking more universities to maximize your chances."
                      : "Great balance! You have a solid application strategy."
                  }
                </p>
                <div className="mt-6 pt-6 border-t border-slate-50">
                  <a href="#/chat" className="text-[10px] font-bold text-orange-500 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
                    AI Strategy Refresh <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Unlock Confirmation Modal */}
      {unlockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-2 bebas tracking-widest uppercase">Unlock University?</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">
              Are you sure you want to unlock <span className="text-slate-900 font-bold">{unlockModal.name}</span>?
              This will pause application task tracking for this university.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setUnlockModal({ open: false, id: '', name: '' })}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-600 shadow-xl shadow-red-100"
              >
                Yes, Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Shortlist;
