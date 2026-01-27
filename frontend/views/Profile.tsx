
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { UserProfile } from '../types';
import { User, LogOut, Save, Shield, Settings, BookOpen, GraduationCap, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdate: (data: Partial<UserProfile>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdate }) => {
  const { profile, updateProfile } = useAuthStore();
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
    ieltsScore: '',
    greStatus: '',
    greScore: '',
    sopStatus: '',
  });

  // Update form when profile changes - this is the main sync mechanism
  useEffect(() => {
    console.log('Profile data received:', profile);
    if (profile) {
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
        ieltsStatus: profile.ielts_status || '',
        ieltsScore: profile.ielts_score?.toString() || '',
        greStatus: profile.gre_status || '',
        greScore: profile.gre_score?.toString() || '',
        sopStatus: profile.sop_status || '',
      });
    }
  }, [profile, user.fullName, user.email]);

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
      if (formData.budgetMin) backendData.budget_min = parseInt(formData.budgetMin);
      if (formData.budgetMax) backendData.budget_max = parseInt(formData.budgetMax);
      if (formData.fundingType) backendData.funding_type = formData.fundingType;
      if (formData.ieltsStatus) backendData.ielts_status = formData.ieltsStatus;
      if (formData.ieltsScore) backendData.ielts_score = parseFloat(formData.ieltsScore);
      if (formData.greStatus) backendData.gre_status = formData.greStatus;
      if (formData.greScore) backendData.gre_score = parseInt(formData.greScore);
      if (formData.sopStatus) backendData.sop_status = formData.sopStatus;

      console.log('Saving profile data:', backendData);

      if (Object.keys(backendData).length === 0) {
        console.log('No changes to save');
        setIsSaving(false);
        return;
      }

      const result = await updateProfile(backendData);
      console.log('Save result:', result);
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
      <div className="space-y-10 selection:bg-orange-500 selection:text-white">

        {/* Header Area */}
        <div className="mb-10">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.4em] mb-2">Central Node</p>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 bebas tracking-widest uppercase">PROFILE SETTINGS</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Navigation */}
          <div className="space-y-8">
            <div className="p-10 bg-white border border-slate-100 rounded-[3rem] flex flex-col items-center text-center shadow-sm">
              <div className="relative mb-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.fullName}&size=128&background=f97316&color=fff&rounded=true`}
                  className="w-28 h-28 rounded-[2.5rem] shadow-2xl border-4 border-white"
                  alt="Profile"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-orange-500 shadow-lg">
                  <Settings size={20} />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 bebas tracking-widest uppercase">{user.fullName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{formData.intendedDegree || 'Student'}</p>
              <div className="mt-6">
                <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[8px] font-bold uppercase tracking-[0.2em] shadow-lg">
                  {profile?.onboarding_completed ? 'PROFILE COMPLETE' : 'IN PROGRESS'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-[2.5rem] space-y-2 shadow-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <tab.icon size={18} strokeWidth={2} />
                    {tab.label}
                  </div>
                  <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
              <div className="pt-6 mt-6 border-t border-slate-50">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all uppercase tracking-widest"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 md:p-14 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-bl-full pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 bebas tracking-widest uppercase">{tabs.find(t => t.id === activeTab)?.label}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Update your information below</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-2xl active:scale-95 disabled:opacity-70"
                >
                  {isSaving ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : saveSuccess ? (
                    <><CheckCircle2 size={18} /> Saved!</>
                  ) : (
                    <><Save size={18} /> Save Changes</>
                  )}
                </button>
              </div>

              <div className="relative z-10">
                {activeTab === 'personal' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full p-5 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 cursor-not-allowed font-bold text-sm"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'academic' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Education Level</label>
                      <select
                        value={formData.educationLevel}
                        onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="Bachelors">Bachelor's Degree</option>
                        <option value="Masters">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="High School">High School</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Major/Field</label>
                      <input
                        type="text"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GPA (0-4.0)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Degree</label>
                      <select
                        value={formData.intendedDegree}
                        onChange={(e) => setFormData({ ...formData, intendedDegree: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="Bachelors">Bachelor's</option>
                        <option value="Masters">Master's</option>
                        <option value="MBA">MBA</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Field of Study</label>
                      <input
                        type="text"
                        value={formData.fieldOfStudy}
                        onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Funding Type</label>
                      <select
                        value={formData.fundingType}
                        onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="Self">Self-funded</option>
                        <option value="Self-funded">Self-funded</option>
                        <option value="SELF">Self-funded</option>
                        <option value="Loan">Loan Dependent</option>
                        <option value="LOAN">Loan</option>
                        <option value="AID">Financial Aid</option>
                        <option value="Scholarship">Scholarship</option>
                        <option value="Mixed">Mixed Funding</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Budget Min ($/year)</label>
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Budget Max ($/year)</label>
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'exams' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IELTS Status</label>
                      <select
                        value={formData.ieltsStatus}
                        onChange={(e) => setFormData({ ...formData, ieltsStatus: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="Not started">Not Started</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Booked">Exam Booked</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IELTS Score</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        value={formData.ieltsScore}
                        onChange={(e) => setFormData({ ...formData, ieltsScore: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                        placeholder="e.g. 7.5"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GRE Status</label>
                      <select
                        value={formData.greStatus}
                        onChange={(e) => setFormData({ ...formData, greStatus: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="Not started">Not Started</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Booked">Exam Booked</option>
                        <option value="Completed">Completed</option>
                        <option value="Not Required">Not Required</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GRE Score</label>
                      <input
                        type="number"
                        min="260"
                        max="340"
                        value={formData.greScore}
                        onChange={(e) => setFormData({ ...formData, greScore: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                        placeholder="e.g. 320"
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SOP Status</label>
                      <select
                        value={formData.sopStatus}
                        onChange={(e) => setFormData({ ...formData, sopStatus: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="Not started">Not Started</option>
                        <option value="Draft">Draft Ready</option>
                        <option value="Ready">Ready to Submit</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
};

export default Profile;
