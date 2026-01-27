
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Target,
  Wallet,
  ClipboardCheck,
  CheckCircle2,
  Zap,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (data: any) => Promise<void>;
}

const steps = [
  { id: 'academic', title: 'ACADEMIC BLUEPRINT', subtitle: 'Phase Evaluation System', icon: GraduationCap },
  { id: 'goals', title: 'MISSION GOALS', subtitle: 'Phase Evaluation System', icon: Target },
  { id: 'financials', title: 'RESOURCES', subtitle: 'Phase Evaluation System', icon: Wallet },
  { id: 'exams', title: 'VALIDATION', subtitle: 'Phase Evaluation System', icon: ClipboardCheck },
  { id: 'complete', title: 'READY FOR LAUNCH', subtitle: 'System Online', icon: CheckCircle2 }
];

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [data, setData] = useState({
    educationLevel: 'Bachelors',
    major: '',
    gpa: '',
    gradYear: '2024',
    degree: 'Masters',
    fieldOfStudy: '',
    preferredCountries: [] as string[],
    intake: 'Fall 2025',
    budgetMin: '20000',
    budgetMax: '50000',
    funding: 'Self',
    exams: [] as string[],
    scores: {} as Record<string, string>
  });

  // Validate current step has required fields filled
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 0: // Academic Blueprint
        return !!data.educationLevel && !!data.degree;
      case 1: // Mission Goals
        return data.preferredCountries.length > 0;
      case 2: // Resources (optional - budget has defaults)
        return true;
      case 3: // Validation (exams - optional)
        return true;
      case 4: // Ready for Launch (just confirmation)
        return true;
      default:
        return true;
    }
  };

  const next = async () => {
    // Only allow next if step is valid
    if (!isStepValid()) {
      alert('Please fill in the required fields before continuing.');
      return;
    }

    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else {
      // Transform frontend data to backend schema format
      const backendData = {
        education_level: data.educationLevel,
        degree: data.degree,
        major: data.major,
        graduation_year: parseInt(data.gradYear) || 2024,
        gpa: data.gpa ? parseFloat(data.gpa) : null,
        intended_degree: data.degree, // Using degree as intended_degree
        field_of_study: data.fieldOfStudy || data.major,
        target_intake: data.intake,
        preferred_countries: data.preferredCountries,
        budget_min: parseInt(data.budgetMin) || 20000,
        budget_max: parseInt(data.budgetMax) || 50000,
        funding_type: data.funding,
        ielts_status: data.exams.includes('IELTS') ? 'Completed' : 'Not started',
        ielts_score: data.scores['IELTS'] ? parseFloat(data.scores['IELTS']) : null,
        gre_status: data.exams.includes('GRE') ? 'Completed' : 'Not started',
        gre_score: data.scores['GRE'] ? parseInt(data.scores['GRE']) : null,
        sop_status: 'Not started'
      };
      // Wait for the API call to complete before navigating
      await onComplete(backendData);
      navigate('/dashboard');
    }
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const countries = ['USA', 'UK', 'CANADA', 'AUSTRALIA', 'GERMANY', 'FRANCE', 'NETHERLANDS', 'SINGAPORE'];
  const examTypes = ['IELTS', 'TOEFL', 'GRE', 'GMAT'];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 md:p-8 font-sans selection:bg-orange-500 selection:text-white">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-100/50">
            <Sparkles className="w-10 h-10 text-orange-500" />
          </div>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-2 animate-pulse">
            System Online • Strategy Optimized
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 bebas tracking-widest mb-2">
            AI INTELLIGENCE SETUP
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-10 relative z-10">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-slate-100'
                  }`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center text-center mb-10 relative z-10">
            <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-6 border border-slate-50 text-orange-500 transform transition-transform duration-500 hover:scale-110">
              {React.createElement(steps[currentStep].icon, { size: 32, strokeWidth: 1.5 })}
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-2">{steps[currentStep].subtitle}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 bebas tracking-[0.1em] uppercase">
              {steps[currentStep].title}
            </h2>
          </div>

          <div className="relative z-10 min-h-[300px]">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Current Academic Level</label>
                  <select
                    value={data.educationLevel}
                    onChange={(e) => setData({ ...data, educationLevel: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                  >
                    <option>High School Graduate</option>
                    <option>Bachelors Candidate</option>
                    <option>Masters Graduate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Primary Field of Study</label>
                  <input
                    type="text"
                    value={data.major}
                    onChange={(e) => setData({ ...data, major: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm placeholder:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">GPA / Score</label>
                    <input
                      type="text"
                      value={data.gpa}
                      onChange={(e) => setData({ ...data, gpa: e.target.value })}
                      placeholder="e.g. 3.8"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Grad Year</label>
                    <input
                      type="number"
                      value={data.gradYear}
                      onChange={(e) => setData({ ...data, gradYear: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Target Degree</label>
                  <select
                    value={data.degree}
                    onChange={(e) => setData({ ...data, degree: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                  >
                    <option>Undergraduate Program</option>
                    <option>Graduate Master's</option>
                    <option>Doctorate / PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Preferred Destinations</label>
                  <div className="flex flex-wrap gap-2">
                    {countries.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const next = data.preferredCountries.includes(c)
                            ? data.preferredCountries.filter(x => x !== c)
                            : [...data.preferredCountries, c];
                          setData({ ...data, preferredCountries: next });
                        }}
                        className={`px-4 py-3 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-widest ${data.preferredCountries.includes(c)
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg transform scale-105'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-orange-300 hover:text-orange-500'
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Annual Budget (USD)</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                      <input
                        type="text"
                        value={data.budgetMin}
                        onChange={(e) => setData({ ...data, budgetMin: e.target.value })}
                        className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                    <span className="text-slate-300 font-bold">-</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                      <input
                        type="text"
                        value={data.budgetMax}
                        onChange={(e) => setData({ ...data, budgetMax: e.target.value })}
                        className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Strategic Funding</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['SELF', 'LOAN', 'AID'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setData({ ...data, funding: s })}
                        className={`py-4 rounded-xl border font-bold text-[10px] uppercase tracking-[0.2em] transition-all ${data.funding === s
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg transform scale-105'
                          : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Exam Validation</label>
                  <div className="grid grid-cols-2 gap-3">
                    {examTypes.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          const next = data.exams.includes(e)
                            ? data.exams.filter(x => x !== e)
                            : [...data.exams, e];
                          setData({ ...data, exams: next });
                        }}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between font-bold text-[10px] uppercase tracking-widest transition-all ${data.exams.includes(e)
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-orange-300'
                          }`}
                      >
                        {e} {data.exams.includes(e) && <CheckCircle2 size={14} className="text-orange-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {data.exams.length > 0 && (
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200/60 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Scores</p>
                    {data.exams.map(e => (
                      <div key={e} className="flex items-center justify-between mb-3 last:mb-0">
                        <span className="text-xs font-bold text-slate-700 tracking-wider">{e}</span>
                        <input
                          type="text"
                          placeholder="Score"
                          className="w-24 p-2 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex flex-col items-center justify-center py-10 space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center text-orange-500 shadow-2xl border-4 border-white">
                    <Zap size={48} className="fill-current" />
                  </div>
                </div>

                <div className="text-center max-w-sm">
                  <p className="text-lg font-medium text-slate-600 leading-relaxed mb-2">
                    "Intelligence architecture complete. Ready to initiate global university matching sequence."
                  </p>
                  <div className="h-1 w-20 bg-orange-500 rounded-full mx-auto my-6 opacity-30"></div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="mt-12 flex items-center gap-4 relative z-10">
            {currentStep > 0 && (
              <button
                onClick={back}
                className="w-16 h-16 bg-white border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-slate-200/50 active:scale-95 group"
            >
              {currentStep === steps.length - 1 ? 'Launch Victory Engine' : 'Next Step'}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
