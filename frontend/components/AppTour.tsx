import React, { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useAuthStore } from '../store/authStore';

interface AppTourProps {
    runManually?: boolean;
    onFinish?: () => void;
}

const AppTour: React.FC<AppTourProps> = ({ runManually = false, onFinish }) => {
    const { profile, markTourAsSeen } = useAuthStore();
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (runManually) {
            setRun(true);
        } else if (profile?.onboarding_completed && !profile?.has_seen_tour) {
            // Small delay to ensure layout is rendered
            const timer = setTimeout(() => setRun(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [profile, runManually]);

    const steps: Step[] = [
        {
            target: '.tour-dashboard',
            content: 'Welcome to your AI Counsellor Command Center! This dashboard gives you a 360-degree view of your admission readiness and current progress.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '.tour-discover',
            content: 'Discovery Engine: Explore universities filtered by AI into Dream, Target, and Safe categories based on your unique profile and background.',
            placement: 'right',
        },
        {
            target: '.tour-shortlist',
            content: 'Shortlist: Manage your top choices. Remember to "Lock & Apply" to an institution to initialize your personalized application task sequence.',
            placement: 'right',
        },
        {
            target: '.tour-tracker',
            content: 'Application Tracker: This is where the magic happens. AI automatically generates tasks (SOPs, Exams, Docs) based on your profile and target colleges.',
            placement: 'right',
        },
        {
            target: '.tour-chat',
            content: 'AI Multi-Tool Chat: Not just for talking! Our AI can help you discover new schools, shortlist options, and even lock programs for you in real-time.',
            placement: 'right',
        },
        {
            target: '.tour-notifications',
            content: 'Mission Alerts: Stay on top of your journey with urgent task reminders and system updates here.',
            placement: 'bottom',
        },
    ];

    const handleCallback = (data: CallBackProps) => {
        const { status } = data;
        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            setRun(false);
            markTourAsSeen();
            if (onFinish) onFinish();
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            scrollToFirstStep
            showProgress
            showSkipButton
            callback={handleCallback}
            styles={{
                options: {
                    primaryColor: '#f97316',
                    textColor: '#0f172a',
                    zIndex: 1000,
                    overlayColor: 'rgba(15, 23, 42, 0.3)',
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                tooltip: {
                    borderRadius: '2rem',
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                },
                buttonNext: {
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    padding: '14px 28px',
                    backgroundColor: '#f97316',
                    boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)',
                },
                buttonBack: {
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginRight: '15px',
                    color: '#64748b'
                },
                buttonSkip: {
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#94a3b8'
                }
            }}
        />
    );
};

export default AppTour;
