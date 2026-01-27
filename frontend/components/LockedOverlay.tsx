
import React from 'react';
import { Lock, ChevronRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { UserProfile } from '../types';

interface LockedOverlayProps {
    user: UserProfile;
    title: string;
    message: string;
    actionLink: string;
    actionLabel: string;
    icon?: 'lock' | 'shield';
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({
    user,
    title,
    message,
    actionLink,
    actionLabel,
    icon = 'lock'
}) => {
    const IconComponent = icon === 'shield' ? Shield : Lock;

    return (
        <Layout user={user}>
            <div className="flex items-center justify-center min-h-[60vh] selection:bg-orange-500 selection:text-white">
                <div className="text-center max-w-lg px-8">
                    {/* Animated Lock Icon */}
                    <div className="relative inline-block mb-10">
                        <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group">
                            {/* Pulsing background */}
                            <div className="absolute inset-0 bg-orange-500/5 animate-pulse"></div>

                            {/* Rotating ring */}
                            <div className="absolute inset-2 border-2 border-dashed border-slate-200 rounded-[2rem] animate-[spin_20s_linear_infinite]"></div>

                            {/* Icon */}
                            <IconComponent size={48} className="text-slate-400 relative z-10" strokeWidth={1.5} />
                        </div>

                        {/* Decorative accents */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                            <span className="text-white text-[10px] font-bold">!</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 bebas tracking-widest uppercase">
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-md mx-auto">
                        {message}
                    </p>

                    {/* Action Button */}
                    <Link
                        to={actionLink}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                    >
                        {actionLabel}
                        <ChevronRight size={16} />
                    </Link>

                    {/* Helper text */}
                    <p className="mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        Complete the required steps to unlock this feature
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default LockedOverlay;
