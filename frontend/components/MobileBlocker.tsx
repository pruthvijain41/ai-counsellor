import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, ArrowRight } from 'lucide-react';

const MobileBlocker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Allow if width is >= 768px (Tablet / Mobile Desktop View)
            const isTooSmall = window.innerWidth < 768;
            setIsMobile(isTooSmall);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-8 text-center"
                    >
                        {/* Background Giant Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
                            <h1 className="bebas text-[30vw] leading-none text-slate-900 select-none flex flex-col items-center">
                                <span>DESKTOP</span>
                                <span>ONLY</span>
                            </h1>
                        </div>

                        <div className="relative z-10 max-w-sm">
                            <div className="mb-8 flex justify-center">
                                <div className="relative">
                                    <Monitor className="text-slate-900 w-24 h-24" strokeWidth={1} />
                                    <motion.div
                                        animate={{
                                            x: [0, 20, 0],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -right-4 top-1/2 -translate-y-1/2"
                                    >
                                        <Smartphone className="text-orange-500 w-10 h-10" strokeWidth={2} />
                                    </motion.div>
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold mb-6 bebas tracking-widest text-slate-900 uppercase">
                                Desktop Environment Required
                            </h2>

                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] leading-loose mb-10">
                                AI Counsellor's high-precision analysis engines and strategic dashboards are engineered for dedicated desktop workstations.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Recommended Action</p>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Please switch to a PC or Laptop. If you are on mobile, enabling <b>"Desktop View"</b> in your browser settings will also work.
                                    </p>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-[10px] text-orange-500 font-black uppercase tracking-widest">
                                    Ready to assist on desktop <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Subtle accents */}
                        <div className="absolute top-10 right-10 w-32 h-32 border border-slate-100 rounded-full opacity-50"></div>
                        <div className="absolute bottom-10 left-10 w-48 h-48 border border-slate-50 rounded-full opacity-50"></div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={isMobile ? 'hidden' : 'block'}>
                {children}
            </div>
        </>
    );
};

export default MobileBlocker;
