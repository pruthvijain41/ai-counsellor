
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import LockedOverlay from '../components/LockedOverlay';
import { UserProfile } from '../types';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
  user: UserProfile;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const { profile } = useAuthStore();

  // Lock check: AI Counsellor requires completed onboarding
  if (!profile?.onboarding_completed) {
    return (
      <LockedOverlay
        user={user}
        title="AI Counsellor Locked"
        message="Complete your onboarding to unlock the AI Strategy Counsellor. We need to understand your academic background, goals, and preferences to provide personalized guidance."
        actionLink="/onboarding"
        actionLabel="Complete Onboarding"
        icon="shield"
      />
    );
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings ${user.fullName?.split(' ')[0] || 'Student'}! I am your AI Strategy Counselor powered by Llama 3.1. How shall we proceed with your admission mission today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend AI API
      const response = await aiAPI.chat(input, {
        profile: {
          name: user.fullName,
          education: user.educationLevel,
          major: user.major,
          gpa: user.gpa,
          preferredCountries: user.preferredCountries,
          degree: user.degree,
          fieldOfStudy: user.fieldOfStudy
        }
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  const suggestions = [
    "Analyze my profile strength",
    "Best universities for my budget",
    "Application timeline advice",
    "Visa requirements overview"
  ];

  return (
    <Layout user={user}>
      <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto selection:bg-orange-500 selection:text-white">

        {/* Chat Header Area */}
        <div className="mb-4 md:mb-8 flex flex-col items-start gap-4 px-2 md:px-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3 opacity-80">Your Study Abroad Advisor</p>
            <h3 className="text-4xl md:text-6xl font-black text-slate-800 bebas tracking-[0.05em] uppercase leading-none">AI Counsellor</h3>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 md:px-5 md:py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-white shadow-sm self-start md:self-auto">
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.22em]">Llama 3.1 Online</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm border border-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

          {/* Message Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-10 scroll-smooth custom-scrollbar relative z-10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-6 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-[1.2rem] flex-shrink-0 flex items-center justify-center shadow-xl transition-transform hover:scale-110 ${msg.role === 'user' ? 'bg-white border border-slate-50 text-slate-400' : 'btn-gradient text-white'}`}>
                    <span className="material-symbols-outlined text-[24px]">
                      {msg.role === 'user' ? 'person' : 'auto_awesome'}
                    </span>
                  </div>
                  <div className={`p-7 md:p-9 rounded-[2.5rem] text-[15px] font-medium leading-relaxed shadow-xl border ${msg.role === 'user'
                    ? 'btn-gradient text-white rounded-tr-none border-orange-400/20'
                    : 'bg-white/70 backdrop-blur-md text-slate-700 rounded-tl-none border-white shadow-slate-200/50'
                    }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-headings:bebas prose-headings:tracking-widest prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-3 prose-ul:my-3 prose-li:my-1 prose-strong:text-orange-600 prose-strong:font-black">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span className="tracking-tight">{msg.content}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-6 max-w-[85%]">
                  <div className="w-12 h-12 rounded-[1.2rem] btn-gradient text-white flex items-center justify-center shadow-xl animate-pulse">
                    <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                  </div>
                  <div className="p-7 bg-white/70 backdrop-blur-md border border-white text-slate-400 rounded-[2.5rem] rounded-tl-none flex items-center gap-4 shadow-xl shadow-slate-100/50">
                    <span className="material-symbols-outlined animate-spin text-orange-500">refresh</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Processing Logic...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-slate-100 bg-white">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="px-6 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-400 hover:text-orange-500 hover:border-orange-200 hover:bg-white transition-all uppercase tracking-widest shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="relative group">
              <input
                type="text"
                placeholder="Ask your AI Counsellor anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full pl-8 pr-32 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-900 text-xs tracking-widest uppercase"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
                  <Sparkles size={14} className="text-orange-500" />
                  <span className="text-[8px] font-bold text-orange-600 uppercase tracking-widest">GROQ LLAMA</span>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed shadow-xl active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
