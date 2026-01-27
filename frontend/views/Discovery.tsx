
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { UserProfile } from '../types';
import { Search, Filter, MapPin, Target, Star, ChevronRight, Info, Globe, Building2, Sparkles, Loader2 } from 'lucide-react';
import { useUniversityStore } from '../store/universityStore';

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
  originalData?: unknown;
}

const Discovery: React.FC<DiscoveryProps> = ({ user }) => {
  const [selectedCountry, setSelectedCountry] = useState(user.preferredCountries?.[0] || 'United States');
  const [selectedUni, setSelectedUni] = useState<DisplayUniversity | null>(null);
  const [shortlisting, setShortlisting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Dream' | 'Target' | 'Safe'>('All');

  const { universities, isSearching, searchUniversities, addToShortlist, shortlist } = useUniversityStore();

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

  // Search when country changes and fetch shortlist
  useEffect(() => {
    if (selectedCountry) {
      searchUniversities(selectedCountry);
    }
  }, [selectedCountry, searchUniversities]);

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
      originalData: uni
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
            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={24} />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all shadow-sm font-medium text-slate-900 text-lg appearance-none cursor-pointer"
            >
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-10 py-5 border rounded-[2rem] flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 ${showFilters ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50'}`}
          >
            <Filter size={20} className={showFilters ? 'text-white' : 'text-orange-500'} /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Type:</span>
              {(['All', 'Dream', 'Target', 'Safe'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${typeFilter === type
                    ? type === 'Dream' ? 'bg-purple-600 text-white'
                      : type === 'Target' ? 'bg-orange-500 text-white'
                        : type === 'Safe' ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
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
              className={`px-6 py-2 border rounded-full text-[9px] font-bold transition-all uppercase tracking-widest ${selectedCountry === country
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-orange-500 hover:text-white hover:border-orange-500'
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
              <div key={uni.id} className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="h-44 bg-slate-50 relative overflow-hidden">
                  <img src={uni.cover} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Cover" />
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-xl ${uni.type === 'Dream' ? 'bg-purple-600' : uni.type === 'Target' ? 'bg-orange-500' : 'bg-emerald-600'
                      }`}>{uni.type}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-10 relative">
                  <div className="absolute -top-12 left-10 w-20 h-20 p-1.5 bg-white rounded-2xl shadow-2xl border border-slate-50 group-hover:-translate-y-2 transition-transform duration-500">
                    <img src={uni.logo} className="w-full h-full object-cover rounded-xl" alt="Logo" />
                  </div>
                  <div className="pt-10">
                    <h4 className="text-2xl font-bold text-slate-900 mb-2 bebas tracking-widest group-hover:text-orange-500 transition-colors">{uni.name}</h4>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                      <MapPin size={12} className="text-orange-500" /> {uni.location}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                        <p className="text-sm font-bold text-slate-900">{uni.acceptanceRate}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Annual Cost</p>
                        <p className="text-sm font-bold text-slate-900">{uni.tuition}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedUni(uni)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-[1.2rem] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleShortlist(uni)}
                        disabled={isShortlisted(uni.name) || shortlisting === uni.id}
                        className={`w-14 h-14 flex items-center justify-center border rounded-[1.2rem] transition-all shadow-sm ${isShortlisted(uni.name)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white border-slate-100 text-slate-300 hover:text-orange-500 hover:border-orange-100'
                          }`}
                      >
                        {shortlisting === uni.id ? <Loader2 size={20} className="animate-spin" /> : <Star size={22} fill={isShortlisted(uni.name) ? 'currentColor' : 'none'} />}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            <div className="relative h-64 shrink-0">
              <img src={selectedUni.cover} className="w-full h-full object-cover grayscale" alt="Cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <button
                onClick={() => setSelectedUni(null)}
                className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all border border-white/20 active:scale-90"
              >
                &times;
              </button>
              <div className="absolute -bottom-12 left-12 w-32 h-32 p-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100">
                <img src={selectedUni.logo} className="w-full h-full object-cover rounded-[1.5rem]" alt="Logo" />
              </div>
              <div className="absolute bottom-6 left-52 text-white">
                <h2 className="text-4xl font-bold bebas tracking-widest uppercase">{selectedUni.name}</h2>
                <div className="flex items-center gap-6 mt-2">
                  <span className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                    <MapPin size={14} className="text-orange-500" /> {selectedUni.location}
                  </span>
                  <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest">Ranked #{selectedUni.ranking} Global</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-12 pt-20 pb-12 custom-scrollbar">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                  <div className="p-8 bg-orange-50 border border-orange-100 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-bl-full"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <Sparkles size={20} className="text-orange-500" />
                      <h5 className="font-bold text-orange-900 uppercase tracking-widest text-[11px]">AI STRATEGY INSIGHT</h5>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-sm font-medium relative z-10">
                      Optimized for your profile. Your 3.8 GPA places you in the top 15% of candidates.
                      Strategic recommendation: Focus your Statement of Purpose on your leadership in the student council.
                      Fit Level: <span className="text-orange-600 font-bold">OPTIMAL (92%)</span>
                    </p>
                  </div>

                  <div>
                    <h5 className="text-2xl font-bold text-slate-900 bebas tracking-widest uppercase mb-6 flex items-center gap-3">
                      <Building2 className="text-orange-500" size={24} /> INSTITUTIONAL BLUEPRINT
                    </h5>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{selectedUni.description}</p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Research Focus</p>
                        <p className="text-sm font-bold text-slate-900">High Technology & AI</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Career Outlook</p>
                        <p className="text-sm font-bold text-slate-900">Top 1% Employment</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                    <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-slate-50">ENTRY METRICS</h5>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admission Rate</span>
                        <span className="text-sm font-bold text-slate-900">{selectedUni.acceptanceRate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GPA Floor</span>
                        <span className="text-sm font-bold text-orange-500">{selectedUni.requirements.gpa}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Test Profile</span>
                        <span className="text-sm font-bold text-slate-900">{selectedUni.requirements.test}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => selectedUni && handleShortlist(selectedUni)}
                      disabled={!selectedUni || isShortlisted(selectedUni.name) || shortlisting === selectedUni?.id}
                      className={`w-full mt-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-100 ${selectedUni && isShortlisted(selectedUni.name)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-white hover:bg-orange-600'
                        }`}
                    >
                      {shortlisting === selectedUni?.id ? 'Adding...' : selectedUni && isShortlisted(selectedUni.name) ? '✓ Shortlisted' : 'Add to Shortlist'}
                    </button>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.3em] mb-8">FINANCIAL LOAD</h5>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base Tuition</span>
                        <span className="text-sm font-bold text-slate-900">{selectedUni.tuition}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ops / Living</span>
                        <span className="text-sm font-bold text-slate-900">~$18k/y</span>
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Scholarship eligibility: HIGH</p>
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
