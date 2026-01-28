
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { UserProfile } from '../types';
import { Search, Filter, MapPin, Target, Star, ChevronRight, Info, Globe, Building2, Sparkles, Loader2 } from 'lucide-react';
import { useUniversityStore } from '../store/universityStore';
import { useAuthStore } from '../store/authStore';

interface DiscoveryProps {
  user: UserProfile;
}

// Country options for search
const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Netherlands',
  'France',
  'Singapore'
];

interface DisplayUniversity {
  id: string;
  name: string;
  location: string;
  logo: string;
  cover: string;
  type: 'Dream' | 'Target' | 'Safe';
  acceptanceRate: string;
  tuition: string;
  ranking: number;
  description: string;
  requirements: { gpa: string; test: string };
  webPages?: string[];
  detailedAnalysis: string;
  tier: string;
}

const Discovery: React.FC<DiscoveryProps> = ({ user }) => {
  const [selectedCountry, setSelectedCountry] = useState(user.preferredCountries?.[0] || 'United States');
  const [selectedUni, setSelectedUni] = useState<DisplayUniversity | null>(null);
  const [shortlisting, setShortlisting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Dream' | 'Target' | 'Safe'>('All');

  const { universities, isSearching, searchUniversities, addToShortlist, shortlist } = useUniversityStore();
  const { profile } = useAuthStore();

  const handleShortlist = async (uni: DisplayUniversity) => {
    if (shortlisting) return;
    setShortlisting(uni.id);
    const originalData = uni.originalData as any;
    const success = await addToShortlist({
      name: uni.name,
      country: selectedCountry,
      alpha_two_code: originalData?.alpha_two_code || '',
      web_pages: uni.webPages || [],
      domains: originalData?.domains || [],
      enriched_data: originalData?.enriched_data
    });
    setShortlisting(null);
    if (success) {
      setSelectedUni(null);
    }
  };

  const isShortlisted = (name: string) => shortlist.some(s => s.university_name === name);

  // Search when country changes OR when profile data is updated (budget, major, etc.)
  useEffect(() => {
    if (selectedCountry) {
      searchUniversities(selectedCountry);
    }
  }, [selectedCountry, searchUniversities, profile?.budget_min, profile?.budget_max, profile?.field_of_study, profile?.major]);

  // Fetch shortlist on mount to check shortlisted status
  useEffect(() => {
    const { fetchShortlist } = useUniversityStore.getState();
    fetchShortlist();
  }, []);

  // Transform API universities to display format
  const displayUniversities: DisplayUniversity[] = universities.map((uni, index) => {
    const enriched = uni.enriched_data;
    return {
      id: `${uni.name}-${index}`,
      name: uni.name,
      location: `${uni.country}`,
      logo: `https://picsum.photos/seed/${encodeURIComponent(uni.name)}/120/120`,
      cover: `https://picsum.photos/seed/${encodeURIComponent(uni.name)}cover/1200/600`,
      type: (enriched?.match_type as 'Dream' | 'Target' | 'Safe') || 'Target',
      acceptanceRate: enriched?.acceptance_rate || 'N/A',
      tuition: enriched ? `$${enriched.estimated_tuition_min?.toLocaleString()} - $${enriched.estimated_tuition_max?.toLocaleString()}/yr` : 'Contact school',
      ranking: enriched?.match_score || 50,
      description: enriched?.why_fits || 'Visit the university website for more information.',
      requirements: { gpa: '3.0+', test: 'Varies' },
      webPages: uni.web_pages,
      originalData: uni,
      detailedAnalysis: enriched?.admission_analysis || `Based on our analysis, ${uni.name} presents a strong opportunity, though admission is competitive.`,
      tier: enriched?.match_tier || 'TIER 2 PRIME'
    };
  });

  // Apply type filter
  const filteredUniversities = typeFilter === 'All'
    ? displayUniversities
    : displayUniversities.filter(uni => uni.type === typeFilter);


  return (
    <Layout user={user}>
      <div className="space-y-10 selection:bg-orange-500 selection:text-white">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors">public</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white/60 backdrop-blur-md border border-white rounded-[2rem] outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/50 transition-all shadow-sm font-bold text-slate-800 text-lg appearance-none cursor-pointer"
            >
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-10 py-5 rounded-[2rem] flex items-center justify-center gap-3 font-extrabold text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 ${showFilters ? 'btn-gradient text-white' : 'btn-light-refined text-slate-700'}`}
          >
            <span className="material-symbols-outlined text-xl">{showFilters ? 'close' : 'filter_list'}</span>
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-panel rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Protocol:</span>
              {(['All', 'Dream', 'Target', 'Safe'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${typeFilter === type
                    ? type === 'Dream' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : type === 'Target' ? 'btn-gradient text-white'
                        : type === 'Safe' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 text-white'
                    : 'bg-white/40 text-slate-500 hover:bg-white/60 border border-white/50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Filter Tags - Countries */}
        <div className="flex flex-wrap gap-3">
          {COUNTRIES.map(country => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-6 py-2.5 rounded-full text-[9px] font-bold transition-all uppercase tracking-[0.2em] border ${selectedCountry === country
                ? 'bg-white/80 text-[var(--accent)] border-[var(--accent)] shadow-sm'
                : 'bg-white/30 text-slate-500 border-white/60 hover:bg-white/60 hover:text-slate-800'
                }`}
            >
              {country}
            </button>
          ))}
        </div>

        {/* University List */}
        {isSearching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-slate-500 font-medium">Searching universities...</span>
          </div>
        ) : filteredUniversities.length === 0 ? (
          <div className="text-center py-20">
            <Globe size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">
              {displayUniversities.length === 0
                ? "No universities found. Try selecting a different country."
                : "No universities match your filters. Try adjusting the filter settings."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredUniversities.map(uni => (
              <div key={uni.id} className="group glass-panel rounded-[3rem] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                <div className="h-52 bg-slate-100 relative overflow-hidden">
                  <img src={uni.cover} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Cover" />
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-xl backdrop-blur-md border border-white/30 ${uni.type === 'Dream' ? 'bg-purple-500/80' : uni.type === 'Target' ? 'bg-orange-500/80' : 'bg-emerald-500/80'
                      }`}>{uni.type}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-80"></div>
                </div>
                <div className="p-10 pt-0 relative flex-1 flex flex-col">
                  <div className="absolute -top-12 left-10 w-20 h-20 p-2 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white group-hover:-translate-y-2 transition-transform duration-500">
                    <img src={uni.logo} className="w-full h-full object-cover rounded-xl" alt="Logo" />
                  </div>
                  <div className="pt-14 flex-1">
                    <h4 className="text-2xl font-bold text-slate-800 mb-2 bebas tracking-widest group-hover:text-[var(--accent)] transition-colors line-clamp-2">{uni.name}</h4>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                      <span className="material-symbols-outlined text-orange-400">location_on</span> {uni.location}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="p-4 bg-white/40 rounded-[1.5rem] border border-white/60">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Success Rate</p>
                        <p className="text-sm font-extrabold text-slate-800">{uni.acceptanceRate}</p>
                      </div>
                      <div className="p-4 bg-white/40 rounded-[1.5rem] border border-white/60">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Annual Cost</p>
                        <p className="text-sm font-extrabold text-slate-800">{uni.tuition.split(' - ')[0]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-auto">
                      <button
                        onClick={() => setSelectedUni(uni)}
                        className="flex-1 py-4 bg-slate-800 text-white rounded-[1.2rem] font-bold text-[10px] uppercase tracking-[0.2em] hover:btn-gradient transition-all shadow-lg active:scale-95"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleShortlist(uni)}
                        disabled={isShortlisted(uni.name) || shortlisting === uni.id}
                        className={`w-14 h-14 flex items-center justify-center border rounded-[1.2rem] transition-all ${isShortlisted(uni.name)
                          ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                          : 'bg-white/40 border-white/80 text-slate-300 hover:text-orange-500 hover:bg-white/80'
                          }`}
                      >
                        {shortlisting === uni.id ? (
                          <span className="material-symbols-outlined animate-spin">refresh</span>
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: ` 'FILL' ${isShortlisted(uni.name) ? 1 : 0}` }}>star</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* University Detail Modal */}
      {selectedUni && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/5 backdrop-blur-2xl animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-white/20 -z-10"
            onClick={() => setSelectedUni(null)}
          ></div>

          <div className="glass-panel w-full max-w-6xl rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] border-white/60 animate-in zoom-in-95 duration-500 flex flex-col max-h-[92vh]">
            <div className="relative h-72 shrink-0 overflow-hidden">
              <img src={selectedUni.cover} className="w-full h-full object-cover grayscale opacity-20" alt="Cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white/90"></div>

              <button
                onClick={() => setSelectedUni(null)}
                className="absolute top-10 right-10 w-14 h-14 bg-white/50 hover:bg-white/90 backdrop-blur-md text-slate-800 rounded-full flex items-center justify-center transition-all border border-white active:scale-90 shadow-sm z-20"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              <div className="absolute bottom-8 left-12 right-12 flex items-end gap-10">
                <div className="w-36 h-36 p-4 bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white shrink-0 hidden md:block">
                  <img src={selectedUni.logo} className="w-full h-full object-cover rounded-[2.2rem]" alt="Logo" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-white px-3 py-1 bg-slate-800 rounded-full tracking-[0.2em] uppercase">University Profile</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${selectedUni.type === 'Dream' ? 'bg-purple-500' : selectedUni.type === 'Target' ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}>{selectedUni.type} MATCH</span>
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-bold bebas tracking-[0.05em] uppercase text-slate-800 leading-[0.9]">{selectedUni.name}</h2>
                  <div className="flex flex-wrap items-center gap-6 mt-4">
                    <span className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-[0.2em]">
                      <span className="material-symbols-outlined text-[var(--accent)] text-xl">location_on</span> {selectedUni.location}
                    </span>
                    <span className="text-[var(--accent)] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl">workspace_premium</span> Global Rank #{selectedUni.ranking}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-12 pt-16 pb-12 custom-scrollbar">
              <div className="grid lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-16">
                  {/* Premium AI Predictor Card */}
                  <div className="p-1 w-full bg-gradient-to-br from-orange-400/20 via-amber-200/5 to-white/10 rounded-[3.5rem] shadow-sm">
                    <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[3.3rem] border border-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                      <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="w-12 h-12 btn-gradient rounded-2xl shadow-lg flex items-center justify-center text-white ring-8 ring-orange-500/5">
                          <span className="material-symbols-outlined text-2xl">insights</span>
                        </div>
                        <div>
                          <h5 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[12px]">Admission Protocol Analysis</h5>
                          <p className="text-[10px] text-orange-600/70 font-bold uppercase tracking-widest mt-0.5">Engineered by AI Counselor™</p>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-lg font-bold relative z-10 max-w-2xl">
                        {selectedUni.detailedAnalysis}
                      </p>
                      <div className="mt-10 flex items-center gap-8 relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Probability Fit</span>
                          <span className="text-3xl font-black text-[var(--accent)] bebas tracking-wide">{selectedUni.ranking}% OPTIMAL</span>
                        </div>
                        <div className="w-[1px] h-10 bg-slate-200"></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Profile Strength</span>
                          <span className="text-3xl font-black text-slate-800 bebas tracking-wide">{selectedUni.tier}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-3xl font-bold text-slate-800 bebas tracking-widest uppercase mb-10 flex items-center gap-5">
                      <span className="material-symbols-outlined text-[var(--accent)] text-4xl">account_balance</span> Institutional Blueprint
                    </h5>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <p className="text-slate-600 text-lg leading-relaxed font-bold opacity-80">{selectedUni.description}</p>
                        <div className="p-8 bg-white/40 rounded-[2.5rem] border border-white/80 shadow-sm transition-all hover:bg-white/60">
                          <span className="material-symbols-outlined text-[var(--accent)] mb-4 text-3xl">science</span>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Primary Specialization</p>
                          <p className="text-xl font-bold text-slate-800 uppercase tracking-wide bebas">High-Tech AI & Quantum Computing</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="p-8 bg-white/40 rounded-[2.5rem] border border-white/80 shadow-sm transition-all hover:bg-white/60">
                          <span className="material-symbols-outlined text-[var(--accent)] mb-4 text-3xl">trending_up</span>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Global Impact Focus</p>
                          <p className="text-xl font-bold text-slate-800 uppercase tracking-wide bebas">Next-Gen Leadership & Governance</p>
                        </div>
                        <div className="p-8 bg-white/40 rounded-[2.5rem] border border-white/80 shadow-sm transition-all hover:bg-white/60">
                          <span className="material-symbols-outlined text-[var(--accent)] mb-4 text-3xl">public</span>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Global Career Reach</p>
                          <p className="text-xl font-bold text-slate-800 uppercase tracking-wide bebas">Direct Tier-1 Silicon Valley Pipeline</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                  <div className="glass-panel p-10 rounded-[3.5rem] border-white shadow-xl shadow-slate-100/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-amber-300"></div>
                    <h5 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] mb-12 flex items-center justify-between">
                      Requirement Metrics
                      <span className="material-symbols-outlined text-slate-300">bolt</span>
                    </h5>
                    <div className="space-y-10">
                      <div className="flex justify-between items-center group/item cursor-default">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest group-hover/item:text-slate-800 transition-colors">Acceptance Rate</span>
                        </div>
                        <span className="text-lg font-black text-slate-800 bebas tracking-widest">{selectedUni.acceptanceRate}</span>
                      </div>
                      <div className="flex justify-between items-center group/item cursor-default">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest group-hover/item:text-slate-800 transition-colors">GPA Threshold</span>
                        </div>
                        <span className="text-lg font-black text-orange-500 bebas tracking-widest">{selectedUni.requirements.gpa}</span>
                      </div>
                      <div className="flex justify-between items-center group/item cursor-default">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest group-hover/item:text-slate-800 transition-colors">Exam Protocol</span>
                        </div>
                        <span className="text-lg font-black text-slate-800 bebas tracking-widest uppercase">{selectedUni.requirements.test}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => selectedUni && handleShortlist(selectedUni)}
                      disabled={!selectedUni || isShortlisted(selectedUni.name) || shortlisting === selectedUni?.id}
                      className={`w-full mt-16 py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 ${selectedUni && isShortlisted(selectedUni.name)
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                        : 'btn-gradient text-white shadow-orange-500/30 hover:-translate-y-1'
                        }`}
                    >
                      {shortlisting === selectedUni?.id ? (
                        <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                      ) : selectedUni && isShortlisted(selectedUni.name) ? (
                        <div className="flex items-center justify-center gap-3">
                          <span className="material-symbols-outlined text-2xl">verified</span>
                          PROTOCOL LOCKED
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <span className="material-symbols-outlined text-2xl">star_outline</span>
                          Add to Shortlist
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="p-10 bg-white/60 backdrop-blur-md border border-white rounded-[3.5rem] shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -mr-24 -mt-24 blur-[60px] group-hover:opacity-10 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-10">
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">Financial Strategy</h5>
                      <span className="material-symbols-outlined text-orange-500">payments</span>
                    </div>
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Base Investment</span>
                        <span className="text-xl font-black text-slate-800 bebas tracking-widest">{selectedUni.tuition.split(' - ')[0]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Est. Extras</span>
                        <span className="text-xl font-black text-slate-800 bebas tracking-widest">~$22,000</span>
                      </div>
                    </div>
                    <div className="mt-12 pt-10 border-t border-slate-100">
                      <div className="flex items-center gap-4 bg-orange-50/50 p-5 rounded-2xl border border-orange-100/50">
                        <span className="material-symbols-outlined text-orange-500 text-3xl">military_tech</span>
                        <div>
                          <p className="text-[11px] text-slate-800 font-black uppercase tracking-widest">Scholarship Tier</p>
                          <p className="text-[10px] text-orange-600/70 font-bold uppercase tracking-widest mt-1">High Probability (85%+)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Discovery;
