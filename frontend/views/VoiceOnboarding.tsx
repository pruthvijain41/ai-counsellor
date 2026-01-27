
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface VoiceOnboardingProps {
    user: UserProfile;
    onComplete: (data: any) => Promise<void>;
    onSwitchToForm: () => void;
}

// Questions for AI-led onboarding
const QUESTIONS = [
    {
        id: 'education',
        question: "What's your current education level? Are you completing a Bachelor's, Master's, or PhD?",
        field: 'educationLevel',
        options: ['Bachelors', 'Masters', 'PhD']
    },
    {
        id: 'major',
        question: "What's your major or field of study?",
        field: 'major'
    },
    {
        id: 'degree',
        question: "What degree are you planning to pursue? Bachelor's, Master's, MBA, or PhD?",
        field: 'degree',
        options: ['Bachelors', 'Masters', 'MBA', 'PhD']
    },
    {
        id: 'countries',
        question: "Which countries are you interested in studying? You can mention multiple countries.",
        field: 'preferredCountries',
        isArray: true
    },
    {
        id: 'budget',
        question: "What's your annual budget range in US dollars? For example, 20000 to 50000.",
        field: 'budget'
    },
    {
        id: 'exams',
        question: "Have you taken any standardized tests like IELTS, TOEFL, GRE, or GMAT?",
        field: 'exams',
        isArray: true
    }
];

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France', 'Singapore'];

const VoiceOnboarding: React.FC<VoiceOnboardingProps> = ({ user, onComplete, onSwitchToForm }) => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [data, setData] = useState({
        educationLevel: 'Bachelors',
        major: '',
        degree: 'Masters',
        preferredCountries: [] as string[],
        budgetMin: '20000',
        budgetMax: '50000',
        funding: 'Self',
        exams: [] as string[],
        scores: {} as Record<string, string>
    });

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize speech synthesis
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    // Speak text using Web Speech API
    const speak = useCallback((text: string): Promise<void> => {
        return new Promise((resolve) => {
            if (!synthRef.current) {
                resolve();
                return;
            }

            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
                resolve();
            };
            synthRef.current.speak(utterance);
        });
    }, []);

    // Start listening for speech
    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current.start();
        setIsListening(true);
    }, []);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    // Process the user's answer
    const processAnswer = useCallback(async (answer: string) => {
        const question = QUESTIONS[currentQuestion];
        setIsProcessing(true);

        // Parse answer based on question type
        let parsedValue: any = answer;

        if (question.options) {
            // Match to closest option
            const lowerAnswer = answer.toLowerCase();
            const matched = question.options.find(opt =>
                lowerAnswer.includes(opt.toLowerCase())
            );
            parsedValue = matched || question.options[0];
        } else if (question.isArray && question.field === 'preferredCountries') {
            // Extract countries from answer
            const lowerAnswer = answer.toLowerCase();
            parsedValue = COUNTRIES.filter(country =>
                lowerAnswer.includes(country.toLowerCase())
            );
            if (parsedValue.length === 0) {
                parsedValue = ['United States'];
            }
        } else if (question.isArray && question.field === 'exams') {
            // Extract exams from answer
            const lowerAnswer = answer.toLowerCase();
            const allExams = ['IELTS', 'TOEFL', 'GRE', 'GMAT'];
            parsedValue = allExams.filter(exam =>
                lowerAnswer.includes(exam.toLowerCase())
            );
        } else if (question.field === 'budget') {
            // Extract budget numbers
            const numbers = answer.match(/\d+/g);
            if (numbers && numbers.length >= 2) {
                setData(prev => ({
                    ...prev,
                    budgetMin: numbers[0],
                    budgetMax: numbers[1]
                }));
            }
            parsedValue = null; // Skip regular update
        }

        // Update data
        if (parsedValue !== null) {
            setData(prev => ({
                ...prev,
                [question.field]: parsedValue
            }));
        }

        setTranscript('');
        setIsProcessing(false);

        // Move to next question or complete
        if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            await speak(QUESTIONS[currentQuestion + 1].question);
        } else {
            await completeOnboarding();
        }
    }, [currentQuestion, speak]);

    // Complete onboarding
    const completeOnboarding = async () => {
        await speak("Thank you! I've collected all the information needed. Setting up your profile now.");

        const backendData = {
            education_level: data.educationLevel,
            degree: data.degree,
            major: data.major,
            graduation_year: 2024,
            gpa: null,
            intended_degree: data.degree,
            field_of_study: data.major,
            target_intake: 'Fall 2025',
            preferred_countries: data.preferredCountries,
            budget_min: parseInt(data.budgetMin) || 20000,
            budget_max: parseInt(data.budgetMax) || 50000,
            funding_type: data.funding,
            ielts_status: data.exams.includes('IELTS') ? 'Completed' : 'Not started',
            ielts_score: null,
            gre_status: data.exams.includes('GRE') ? 'Completed' : 'Not started',
            gre_score: null,
            sop_status: 'Not started'
        };

        await onComplete(backendData);
        navigate('/dashboard');
    };

    // Start the conversation
    useEffect(() => {
        const startConversation = async () => {
            await speak(`Hello ${user.fullName?.split(' ')[0] || 'there'}! I'm your AI counsellor and I'll help you set up your profile. Let me ask you a few questions.`);
            await new Promise(resolve => setTimeout(resolve, 500));
            await speak(QUESTIONS[0].question);
        };

        startConversation();
    }, [speak, user.fullName]);

    return (
        <div className="min-h-screen relative flex items-center justify-center p-8 overflow-hidden selection:bg-orange-500 selection:text-white">
            {/* Background Overlay to match Dashboard */}
            <div className="fixed inset-0 bg-overlay -z-10"></div>

            <div className="max-w-2xl w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-white/60 border border-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl backdrop-blur-md">
                        <Sparkles className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 bebas tracking-[0.1em] mb-2">
                        AI VOICE ONBOARDING
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                        Speak your answers or type them below
                    </p>
                </div>

                {/* Question Card */}
                <div className="glass-panel rounded-[3rem] p-10 shadow-xl mb-8 border border-white/50 relative overflow-hidden">
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-8">
                        {QUESTIONS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 rounded-full ${i <= currentQuestion ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>

                    {/* Current Question */}
                    <div className="mb-8 relative z-10">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">
                            Question {currentQuestion + 1} of {QUESTIONS.length}
                        </p>
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                            {QUESTIONS[currentQuestion].question}
                        </h2>
                    </div>

                    {/* Speaking/Listening Indicator */}
                    {isSpeaking && (
                        <div className="flex items-center gap-3 text-orange-500 mb-6 bg-orange-50/50 p-3 rounded-xl border border-orange-100/50 backdrop-blur-sm">
                            <Volume2 className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">AI is speaking...</span>
                        </div>
                    )}

                    {/* Transcript Display */}
                    {transcript && (
                        <div className="bg-white/40 border border-white/60 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-sm">
                            <p className="text-slate-800 font-bold text-sm italic">"{transcript}"</p>
                        </div>
                    )}

                    {/* Voice Input */}
                    <div className="flex items-center gap-6 mb-8">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={isSpeaking || isProcessing}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105'
                                } disabled:opacity-50 disabled:scale-100`}
                        >
                            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                        </button>
                        <div>
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                {isListening ? 'Listening...' : 'Click to speak'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {isListening ? 'Click again to stop' : 'Or type your answer below'}
                            </p>
                        </div>
                    </div>

                    {/* Text Input Alternative */}
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Type your answer here..."
                            className="flex-1 p-5 bg-white/40 border border-white/60 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-800 font-bold text-sm placeholder:text-slate-400 backdrop-blur-sm transition-all"
                            disabled={isListening}
                        />
                        <button
                            onClick={() => processAnswer(transcript)}
                            disabled={!transcript || isProcessing}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-orange-200"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Next <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Switch to Form */}
                <div className="text-center">
                    <button
                        onClick={onSwitchToForm}
                        className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-orange-500 transition-colors bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20"
                    >
                        Prefer typing? Switch to form-based onboarding →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceOnboarding;
