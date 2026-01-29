
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend AI API
      const response = await aiAPI.chat(textToSend, {
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
    { title: "Shortlist Unis", desc: "Based on my profile", icon: "add_task", prompt: "Shortlist some universities for me based on my profile" },
    { title: "Lock & Apply", desc: "Commit to universities", icon: "lock", prompt: "Lock my shortlist and start application tasks" },
    { title: "Unlock Unis", desc: "Undo application lock", icon: "lock_open", prompt: "Unlock all my universities" },
    { title: "Analyze Profile", desc: "Admission chances", icon: "analytics", prompt: "Analyze my profile and tell me my chances" },
    { title: "Clear List", desc: "Reset my shortlist", icon: "delete_sweep", prompt: "Clear my shortlist" }
  ];

  return (
    <Layout user={user} fullWidth={true}>
      <div className="flex flex-col h-full w-full selection:bg-orange-500 selection:text-white relative">

        <div className="flex-1 flex flex-col overflow-hidden relative group/chat-box">

          {/* Message Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth custom-scrollbar relative z-10 max-w-4xl mx-auto w-full">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-20 fade-in">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-orange-500 shadow-2xl mb-8 relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-[2.5rem] animate-ping opacity-10"></div>
                  <span className="material-symbols-outlined text-[48px]">auto_awesome</span>
                </div>
                <h4 className="text-4xl md:text-5xl font-black text-slate-800 bebas tracking-[0.15em] text-center mb-2">
                  GREETINGS, <span className="text-orange-500">{user.fullName?.split(' ')[0]?.toUpperCase()}</span>
                </h4>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-center opacity-70">Strategic Guidance Sequence Active</p>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Intelligence Online</span>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in mb-4`}>
                <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-[1.2rem] flex-shrink-0 flex items-center justify-center shadow-lg transition-transform ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'btn-gradient text-white'}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {msg.role === 'user' ? 'person' : 'auto_awesome'}
                    </span>
                  </div>
                  <div className={`p-6 md:p-8 rounded-[2rem] text-[14px] md:text-[15px] font-medium leading-relaxed border shadow-xl ${msg.role === 'user'
                    ? 'bg-slate-900 border-slate-800 text-white rounded-tr-none'
                    : 'bg-white/80 backdrop-blur-md text-slate-700 rounded-tl-none border-white shadow-slate-200/30'
                    }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-headings:bebas prose-headings:tracking-widest prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-3 prose-ul:my-3 prose-li:my-1 prose-strong:text-orange-600 prose-strong:font-black leading-relaxed">
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
              <div className="flex justify-start animate-pulse">
                <div className="flex gap-4 max-w-[70%]">
                  <div className="w-10 h-10 rounded-[1.2rem] btn-gradient text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  </div>
                  <div className="p-5 bg-white/80 backdrop-blur-md border border-white text-slate-400 rounded-[1.8rem] rounded-tl-none flex items-center gap-4 shadow-xl shadow-slate-100/30">
                    <span className="material-symbols-outlined animate-spin text-orange-500 text-[18px]">refresh</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Processing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Suggestions Row */}
          <div className="px-4 md:px-8 max-w-4xl mx-auto w-full z-20">
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.prompt)}
                  className="flex-shrink-0 px-5 py-3 bg-white/60 backdrop-blur-md border border-white/50 rounded-full flex items-center gap-3 hover:border-orange-200 hover:bg-white transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5 group/suggestion"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-orange-500 transition-colors">{s.icon}</span>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-800 uppercase tracking-wider leading-none">{s.title}</p>
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-tight opacity-70 group-hover:text-slate-600">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="pb-8 pt-2 px-4 md:px-8 bg-transparent relative z-20">
            <div className="relative group/input max-w-4xl mx-auto">
              <input
                type="text"
                placeholder="Message your AI Strategy Counsellor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full pl-8 pr-32 py-5 bg-white border border-slate-100 rounded-[2.5rem] outline-none focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-bold text-slate-800 text-[13px] tracking-tight shadow-lg shadow-slate-200/50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800 group-focus-within/input:bg-orange-500 group-focus-within/input:border-orange-400 transition-colors">
                  <Sparkles size={12} className="text-white" />
                  <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Neural Llama</span>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-500 transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed shadow-xl active:scale-95 group/send"
                >
                  <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
