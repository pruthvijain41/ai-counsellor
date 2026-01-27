
import React, { useState } from 'react';
import { UserProfile } from '../types';
import Onboarding from './Onboarding';
import VoiceOnboarding from './VoiceOnboarding';
import { GraduationCap, Mic, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingSelectorProps {
    user: UserProfile;
    onComplete: (data: any) => Promise<void>;
}

const OnboardingSelector: React.FC<OnboardingSelectorProps> = ({ user, onComplete }) => {
    const [mode, setMode] = useState<'select' | 'form' | 'voice'>('select');

    if (mode === 'form') {
        return <Onboarding user={user} onComplete={onComplete} />;
    }

    if (mode === 'voice') {
        return <VoiceOnboarding user={user} onComplete={onComplete} onSwitchToForm={() => setMode('form')} />;
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
                {/* Header */}
                <div className="mb-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Sparkles className="w-12 h-12 text-orange-500" />
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 bebas tracking-widest mb-4">
                        WELCOME, {user.fullName?.split(' ')[0]?.toUpperCase() || 'STUDENT'}!
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-md mx-auto">
                        Let's set up your profile so I can guide you on your study abroad journey.
                    </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Form Option */}
                    <button
                        onClick={() => setMode('form')}
                        className="group p-8 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-[2.5rem] text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                    >
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                            <GraduationCap className="w-8 h-8 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 bebas tracking-widest">
                            FORM-BASED
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Quick step-by-step form to fill out your details manually.
                        </p>
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                            Get Started <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Voice Option */}
                    <button
                        onClick={() => setMode('voice')}
                        className="group p-8 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-[2.5rem] text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                    >
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                            <Mic className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 bebas tracking-widest">
                            AI VOICE ASSISTANT
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Speak with our AI counselor who will guide you through questions.
                        </p>
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                            <span className="animate-pulse">●</span> Start Conversation <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>

                {/* Info */}
                <p className="text-slate-300 text-xs font-medium">
                    Both options collect the same information • You can switch anytime
                </p>
            </div>
        </div>
    );
};

export default OnboardingSelector;
