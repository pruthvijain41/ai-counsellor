
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
      <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto selection:bg-orange-500 selection:text-white">

        {/* Chat Header Area */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.4em] mb-2">Your Study Abroad Advisor</p>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 bebas tracking-widest uppercase">AI COUNSELLOR</h3>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Llama 3.1 Online</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-[3rem] shadow-2xl overflow-hidden">
          {/* Message Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 scroll-smooth custom-scrollbar bg-slate-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-5 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-xl ${msg.role === 'user' ? 'bg-slate-900' : 'bg-white border border-slate-100 text-orange-500'}`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={22} />}
                  </div>
                  <div className={`p-6 md:p-8 rounded-[2rem] text-sm md:text-base leading-relaxed shadow-sm border ${msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none border-slate-900'
                    : 'bg-white text-slate-800 rounded-tl-none border-slate-100'
                    }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-orange-600">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-5 max-w-[85%]">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-100 text-orange-500 flex items-center justify-center shadow-lg">
                    <Bot size={22} />
                  </div>
                  <div className="p-6 bg-white border border-slate-100 text-slate-400 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-orange-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Processing Logic...</span>
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
