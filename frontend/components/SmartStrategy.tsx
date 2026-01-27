import React from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap,
    BrainCircuit,
    Cpu,
    Database,
    Network
} from 'lucide-react';

interface SmartStrategyProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const SmartStrategy: React.FC<SmartStrategyProps> = ({ className = '', size = 'lg' }) => {
    const sizeMap = {
        sm: { container: 'w-64 h-64', core: 'w-44 h-44', icon: 32, cap: 'w-20 h-20', text: 'text-[7px]', px: 'px-4', py: 'py-1' },
        md: { container: 'w-[450px] h-[450px]', core: 'w-[320px] h-[320px]', icon: 40, cap: 'w-24 h-24', text: 'text-[8px]', px: 'px-6', py: 'py-1.5' },
        lg: { container: 'w-80 h-80 md:w-[680px] md:h-[680px]', core: 'w-56 h-56 md:w-[460px] md:h-[460px]', icon: 90, cap: 'md:w-52 md:h-52', text: 'text-[9px] md:text-[12px]', px: 'px-6 md:px-10', py: 'py-2 md:py-3' },
    };

    const currentSize = sizeMap[size];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`relative z-10 float-subtle flex flex-col items-center ${className}`}
        >
            <div className={`relative ${currentSize.container} flex items-center justify-center`}>

                {/* Outer Neural Lattice Ring 1 */}
                <div className="absolute inset-0 border-[1px] border-slate-200/40 rounded-full neural-orbit">
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-200 rounded-full"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-200 rounded-full"></div>
                </div>

                {/* Middle Data Transmission Ring */}
                <div className={`absolute inset-12 ${size === 'lg' ? 'md:inset-20' : ''} border-[1.5px] border-dashed border-orange-200/30 rounded-full neural-orbit-reverse`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-5 h-5 bg-white border border-orange-200 rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                    </div>
                </div>

                {/* Inner Scanning Core Boundary */}
                <div className={`absolute inset-24 ${size === 'lg' ? 'md:inset-40' : ''} border-[1px] border-slate-100 rounded-full opacity-40`}></div>

                {/* Main Central Engine Core */}
                <div className={`relative z-20 ${currentSize.core} rounded-full bg-white shadow-2xl flex items-center justify-center orange-glow border-4 ${size === 'lg' ? 'md:border-[16px]' : 'md:border-8'} border-orange-500/5 overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-white to-transparent rounded-full transition-transform duration-700"></div>

                    {/* Active Scanner Laser Visual */}
                    <div className="absolute inset-0 scanner-sweep bg-gradient-to-b from-orange-500/0 via-orange-500/20 to-orange-500/0 z-10 pointer-events-none opacity-50"></div>

                    {/* Inner Floating Tech Geometry */}
                    <div className="absolute inset-10 md:inset-20 border-[0.5px] border-orange-100 rounded-full animate-pulse opacity-50"></div>

                    <div className="flex flex-col items-center relative z-20 pulse-breathing text-center">
                        <GraduationCap
                            size={currentSize.icon}
                            className={`text-orange-500 drop-shadow-[0_10px_10px_rgba(249,115,22,0.3)] ${currentSize.cap}`}
                            strokeWidth={0.8}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={`mt-4 ${size === 'lg' ? 'md:mt-6' : ''} ${currentSize.px} ${currentSize.py} bg-slate-900 text-white rounded-full ${currentSize.text} font-bold tracking-[0.4em] ${size === 'lg' ? 'md:tracking-[0.5em]' : ''} bebas shadow-2xl shadow-slate-900/20`}
                        >
                            SMART STRATEGY
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-4 flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Counseling Ready</span>
                        </motion.div>
                    </div>

                    {/* Data Floating Elements */}
                    <div className={`absolute top-1/4 left-8 ${size === 'lg' ? 'md:left-16' : ''} text-orange-400`}>
                        <BrainCircuit size={size === 'lg' ? 22 : 16} className={size === 'lg' ? 'md:w-8 md:h-8' : ''} />
                    </div>
                    <div className={`absolute top-1/4 right-8 ${size === 'lg' ? 'md:right-16' : ''} text-orange-400`}>
                        <Cpu size={size === 'lg' ? 22 : 16} className={size === 'lg' ? 'md:w-8 md:h-8' : ''} />
                    </div>
                    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-orange-300">
                        <Database size={size === 'lg' ? 24 : 18} className={size === 'lg' ? 'md:w-9 md:h-9' : ''} />
                    </div>
                </div>

                {/* Luxury Tech Stabilizers */}
                <div className="absolute top-0 right-0 md:top-16 md:right-16 w-20 md:w-40 h-1.5 md:h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent rotate-45 rounded-full opacity-40 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 md:bottom-16 md:left-16 w-20 md:w-40 h-1.5 md:h-2 bg-gradient-to-l from-transparent via-orange-500 to-transparent rotate-45 rounded-full opacity-40 transition-all duration-700"></div>

                {/* Small Orbiting Labels */}
                <div className="absolute -top-12 md:-top-20 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-slate-100 rounded-full shadow-sm text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Network size={12} className="text-orange-500" /> GUIDED AI ADMISSIONS
                </div>
            </div>
        </motion.div>
    );
};

export default SmartStrategy;
