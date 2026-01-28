
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { UserProfile } from '../types';
import { User, LogOut, Save, Shield, Settings, BookOpen, GraduationCap, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUniversityStore } from '../store/universityStore';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdate: (data: Partial<UserProfile>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdate }) => {
  const { profile, updateProfile } = useAuthStore();
  const { clearSearch } = useUniversityStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state using real profile data
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    educationLevel: '',
    major: '',
    gpa: '',
    gradYear: '',
    intendedDegree: '',
    fieldOfStudy: '',
    preferredCountries: [] as string[],
    budgetMin: '',
    budgetMax: '',
    fundingType: '',
    ieltsStatus: '',
    ieltsType: 'IELTS',
    ieltsScore: '',
    greStatus: '',
    greType: 'GRE',
    greScore: '',
    sopStatus: '',
  });

  // Update form when profile changes - this is the main sync mechanism
  useEffect(() => {
    console.log('Profile data received:', profile);
    if (profile) {
      // Determine effective exam values based on saved type
      const iType = profile.ielts_type || 'IELTS';
      const gType = profile.gre_type || 'GRE';

      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        educationLevel: profile.education_level || '',
        major: profile.major || '',
        gpa: profile.gpa?.toString() || '',
        gradYear: profile.graduation_year?.toString() || '',
        intendedDegree: profile.intended_degree || '',
        fieldOfStudy: profile.field_of_study || '',
        preferredCountries: profile.preferred_countries || [],
        budgetMin: profile.budget_min?.toString() || '',
        budgetMax: profile.budget_max?.toString() || '',
        fundingType: profile.funding_type || '',

        // Exam Mapping
        ieltsType: iType,
        ieltsStatus: (iType === 'TOEFL' ? profile.toefl_status : profile.ielts_status) || '',
        ieltsScore: (iType === 'TOEFL' ? profile.toefl_score?.toString() : profile.ielts_score?.toString()) || '',

        greType: gType,
        greStatus: (gType === 'GMAT' ? profile.gmat_status : profile.gre_status) || '',
        greScore: (gType === 'GMAT' ? profile.gmat_score?.toString() : profile.gre_score?.toString()) || '',

        sopStatus: profile.sop_status || '',
      });
    }
  }, [profile, user.fullName, user.email]);

  const toggleCountry = (country: string) => {
    setFormData(prev => {
      const current = prev.preferredCountries;
      if (current.includes(country)) {
        return { ...prev, preferredCountries: current.filter(c => c !== country) };
      }
      if (current.length >= 3) return prev; // Limit to 3
      return { ...prev, preferredCountries: [...current, country] };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Build update object with only non-empty fields to prevent accidental overwrites
      const backendData: Record<string, unknown> = {};

      // Only include fields that have actual values
      if (formData.educationLevel) backendData.education_level = formData.educationLevel;
      if (formData.major) backendData.major = formData.major;
      if (formData.gpa) backendData.gpa = parseFloat(formData.gpa);
      if (formData.intendedDegree) backendData.intended_degree = formData.intendedDegree;
      if (formData.fieldOfStudy) backendData.field_of_study = formData.fieldOfStudy;
      if (formData.preferredCountries.length > 0) backendData.preferred_countries = formData.preferredCountries;
      if (formData.budgetMin) backendData.budget_min = parseInt(formData.budgetMin);
      if (formData.budgetMax) backendData.budget_max = parseInt(formData.budgetMax);
      if (formData.fundingType) backendData.funding_type = formData.fundingType;

      // Smart Exam Saving
      if (formData.ieltsType) backendData.ielts_type = formData.ieltsType;

      if (formData.ieltsType === 'TOEFL') {
        backendData.toefl_status = formData.ieltsStatus || null;
        backendData.toefl_score = formData.ieltsScore ? parseInt(formData.ieltsScore) : null;
      } else {
        backendData.ielts_status = formData.ieltsStatus || null;
        backendData.ielts_score = formData.ieltsScore ? parseFloat(formData.ieltsScore) : null;
      }

      if (formData.greType) backendData.gre_type = formData.greType;

      if (formData.greType === 'GMAT') {
        backendData.gmat_status = formData.greStatus || null;
        backendData.gmat_score = formData.greScore ? parseInt(formData.greScore) : null;
      } else {
        backendData.gre_status = formData.greStatus || null;
        backendData.gre_score = formData.greScore ? parseInt(formData.greScore) : null;
      }

      if (formData.sopStatus) backendData.sop_status = formData.sopStatus;

      console.log('Saving profile data:', backendData);

      if (Object.keys(backendData).length === 0) {
        console.log('No changes to save');
        setIsSaving(false);
        return;
      }

      const result = await updateProfile(backendData);
      console.log('Save result:', result);
      // Clear cached university search results so Discovery will re-fetch with new profile data
      clearSearch();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Save failed:', error);
    }

    setIsSaving(false);
  };

  const tabs = [
    { id: 'personal', label: 'Candidate Identity', icon: User },
    { id: 'academic', label: 'Academic Profile', icon: GraduationCap },
    { id: 'preferences', label: 'Study Preferences', icon: BookOpen },
    { id: 'exams', label: 'Exams & Status', icon: Shield },
  ];

  return (
    <Layout user={user}>
      <div className="space-y-12 selection:bg-orange-500 selection:text-white pb-20">

        <div className="mb-12">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-3 opacity-80">Account Settings</p>
          <h3 className="text-5xl md:text-6xl font-black text-slate-800 bebas tracking-[0.05em] uppercase leading-none">Profile Overview</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Identity & Readiness Overview */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
            <div className="glass-panel p-10 bg-white/60 backdrop-blur-md border-white rounded-[3.5rem] flex items-center gap-10 shadow-xl shadow-slate-100/50 group overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.fullName}&size=128&background=f97316&color=fff&rounded=true`}
                  className="w-32 h-32 rounded-[2.5rem] shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-500"
                  alt="Profile"
                />
                <div className="absolute -bottom-2 -right-2 w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-orange-500 shadow-xl group-hover:rotate-12 transition-all">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Authenticated User</p>
                <h4 className="text-4xl font-black text-slate-800 bebas tracking-[0.05em] uppercase mb-1 leading-none">{user.fullName}</h4>
                <p className="text-[12px] text-orange-500 font-black uppercase tracking-[0.2em]">{formData.intendedDegree || 'Protocol Initiated'}</p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="material-symbols-outlined text-[18px] text-slate-300">mail</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-10 bg-white/60 backdrop-blur-md border-white rounded-[3.5rem] flex flex-col justify-between shadow-xl shadow-slate-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none">Profile Readiness</p>
                  <h4 className="text-3xl font-black text-slate-800 bebas tracking-[0.1em] uppercase">Readiness Center</h4>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-5 py-2 ${profile?.onboarding_completed ? 'bg-emerald-500' : 'bg-slate-900'} text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10`}>
                    {profile?.onboarding_completed ? 'COMPLETE' : 'IN PROGRESS'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Score</span>
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{profile?.onboarding_completed ? '100%' : '75%'}</span>
                </div>
                <div className="w-full h-3 bg-white/50 border border-white rounded-full overflow-hidden shadow-inner p-0.5">
                  <div
                    className={`h-full ${profile?.onboarding_completed ? 'bg-emerald-500' : 'bg-orange-500'} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: profile?.onboarding_completed ? '100%' : '75%' }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right">Targeting: {formData.fieldOfStudy || 'Not Set'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div className="p-4 bg-white/60 backdrop-blur-md border border-white rounded-[2.5rem] space-y-2 shadow-xl shadow-slate-100/50 relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-slate-900/5 rounded-full blur-2xl pointer-events-none"></div>
              {[
                { id: 'personal', label: 'Candidate Identity', icon: 'person' },
                { id: 'academic', label: 'Academic Profile', icon: 'school' },
                { id: 'preferences', label: 'Study Preferences', icon: 'explore' },
                { id: 'exams', label: 'Exams & Status', icon: 'verified_user' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-6 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-2xl translate-x-2' : 'text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-lg'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-300 group-hover:text-slate-900'} transition-colors`}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </div>
                  <span className={`material-symbols-outlined text-[16px] transition-opacity duration-500 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>
                    chevron_right
                  </span>
                </button>
              ))}
              <div className="pt-6 mt-6 border-t border-white/50 px-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 uppercase tracking-[0.2em] shadow-sm hover:shadow-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out Protocol
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <div className="glass-panel p-10 md:p-14 bg-white/60 backdrop-blur-md border-white rounded-[3.5rem] flex flex-col shadow-xl shadow-slate-100/50 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-80 h-80 bg-slate-100 opacity-20 pointer-events-none rounded-bl-full translate-x-20 -translate-y-20"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 relative z-10">
                <div>
                  <h3 className="text-4xl font-black text-slate-800 bebas tracking-[0.1em] uppercase leading-none">
                    {activeTab === 'personal' && 'Personal Information'}
                    {activeTab === 'academic' && 'Academic History'}
                    {activeTab === 'preferences' && 'Academic Goals'}
                    {activeTab === 'exams' && 'Exam Progress'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 opacity-60">Optimize your admissions profile</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-10 py-4.5 btn-gradient text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.35em] flex items-center justify-center gap-4 hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-orange-500/30 disabled:opacity-70 disabled:translate-y-0"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isSaving ? 'animate-spin' : ''}`}>
                    {isSaving ? 'refresh' : saveSuccess ? 'check_circle' : 'save'}
                  </span>
                  <span>{isSaving ? 'Saving Protocol...' : saveSuccess ? 'Changes Saved' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="relative z-10 flex-1">
                {activeTab === 'personal' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Candidate Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] tracking-tight"
                          placeholder="Loading name..."
                        />
                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-200">badge</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Verified Email Protocol</label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full p-5.5 pl-7 bg-slate-100/50 border border-slate-50 rounded-[1.8rem] text-slate-400 cursor-not-allowed font-black text-[14px] tracking-tight"
                        />
                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">verified</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'academic' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Foundation Level</label>
                      <select
                        value={formData.educationLevel}
                        onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                      >
                        <option value="">Select Level...</option>
                        <option value="Bachelors">Bachelor's Degree</option>
                        <option value="Masters">Master's Degree</option>
                        <option value="PhD">PhD Doctorate</option>
                        <option value="High School">High School Diploma</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Operational Major</label>
                      <input
                        type="text"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px]"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Academic GPA Scale (4.0 Max)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px]"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Intended Target Degree</label>
                      <select
                        value={formData.intendedDegree}
                        onChange={(e) => setFormData({ ...formData, intendedDegree: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                      >
                        <option value="">Select Degree...</option>
                        <option value="Bachelors">Bachelor's</option>
                        <option value="Masters">Master's</option>
                        <option value="MBA">MBA Program</option>
                        <option value="PhD">PhD Protocol</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Core Specialization</label>
                      <input
                        type="text"
                        value={formData.fieldOfStudy}
                        onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px]"
                        placeholder="e.g. AI & Robotics"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Funding Protocol</label>
                      <select
                        value={formData.fundingType}
                        onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                      >
                        <option value="">Select Protocol...</option>
                        <option value="SELF">Self-funded</option>
                        <option value="LOAN">Loan Dependent</option>
                        <option value="AID">Financial Aid</option>
                        <option value="SCHOLARSHIP">Scholarship Focus</option>
                      </select>
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Preferred Destinations (Max 3)</label>
                      <div className="flex flex-wrap gap-3">
                        {['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'Netherlands', 'New Zealand'].map(country => (
                          <button
                            key={country}
                            onClick={() => toggleCountry(country)}
                            className={`px-5 py-2.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-wider transition-all border ${formData.preferredCountries.includes(country)
                              ? 'bg-slate-800 text-white border-slate-800 shadow-lg scale-105'
                              : 'bg-white/50 text-slate-400 border-slate-100 hover:border-orange-200 hover:text-orange-500'
                              }`}
                          >
                            {country}
                            {formData.preferredCountries.includes(country) && (
                              <span className="ml-2 text-orange-500">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Budget Floor (Annual USD)</label>
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px]"
                        placeholder="20000"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Budget Ceiling (Annual USD)</label>
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px]"
                        placeholder="60000"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'exams' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">English Proficiency Exam</label>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          value={formData.ieltsType}
                          onChange={(e) => setFormData({ ...formData, ieltsType: e.target.value })}
                          className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                        >
                          <option value="IELTS">IELTS</option>
                          <option value="TOEFL">TOEFL</option>
                        </select>
                        <select
                          value={formData.ieltsStatus}
                          onChange={(e) => setFormData({ ...formData, ieltsStatus: e.target.value })}
                          className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                        >
                          <option value="">Status...</option>
                          <option value="Not started">Not Started</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Booked">Booked</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{formData.ieltsType} Score {formData.ieltsType === 'IELTS' ? '(0-9)' : '(0-120)'}</label>
                      <input
                        type="number"
                        step={formData.ieltsType === 'IELTS' ? "0.5" : "1"}
                        min="0"
                        max={formData.ieltsType === 'IELTS' ? "9" : "120"}
                        value={formData.ieltsScore}
                        onChange={(e) => setFormData({ ...formData, ieltsScore: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px]"
                        placeholder={formData.ieltsType === 'IELTS' ? "7.5" : "100"}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Aptitude Exam</label>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          value={formData.greType}
                          onChange={(e) => setFormData({ ...formData, greType: e.target.value })}
                          className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                        >
                          <option value="GRE">GRE</option>
                          <option value="GMAT">GMAT</option>
                        </select>
                        <select
                          value={formData.greStatus}
                          onChange={(e) => setFormData({ ...formData, greStatus: e.target.value })}
                          className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                        >
                          <option value="">Status...</option>
                          <option value="Not started">Not Started</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Booked">Booked</option>
                          <option value="Completed">Completed</option>
                          <option value="Not Required">Not Required</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{formData.greType} Score {formData.greType === 'GRE' ? '(260-340)' : '(200-800)'}</label>
                      <input
                        type="number"
                        min={formData.greType === 'GRE' ? "260" : "200"}
                        max={formData.greType === 'GRE' ? "340" : "800"}
                        value={formData.greScore}
                        onChange={(e) => setFormData({ ...formData, greScore: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px]"
                        placeholder={formData.greType === 'GRE' ? "320" : "700"}
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Statement of Purpose (SOP)</label>
                      <select
                        value={formData.sopStatus}
                        onChange={(e) => setFormData({ ...formData, sopStatus: e.target.value })}
                        className="w-full p-5.5 pl-7 bg-white/50 border border-slate-100 rounded-[1.8rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-black text-slate-800 text-[14px] appearance-none"
                      >
                        <option value="">Status Check...</option>
                        <option value="Not started">Not Started</option>
                        <option value="Draft">Draft</option>
                        <option value="Ready">Ready</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mb-32 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
