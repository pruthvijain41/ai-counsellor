
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Landing from './views/Landing';
import Auth from './views/Auth';
import OnboardingSelector from './views/OnboardingSelector';
import Dashboard from './views/Dashboard';
import Discovery from './views/Discovery';
import Shortlist from './views/Shortlist';
import Tracker from './views/Tracker';
import Chat from './views/Chat';
import Profile from './views/Profile';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireOnboarding?: boolean }> = ({
  children,
  requireOnboarding = true
}) => {
  const { isAuthenticated, isLoading, profile } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !profile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// App Component
const App: React.FC = () => {
  const { initializeFromStorage, isAuthenticated, isLoading, user: authUser, profile, signOut, updateProfile, handleGoogleCallback } = useAuthStore();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  // Listen for Supabase auth state changes (Google OAuth callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Google OAuth completed, sync with our backend
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email?.split('@')[0] || 'User';

        if (email) {
          const success = await handleGoogleCallback(email, name);
          if (success) {
            // Sign out from Supabase (we use our own JWT)
            await supabase.auth.signOut();
            // Navigation is handled by the router based on auth state
            window.location.href = '/#/dashboard';
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleGoogleCallback]);

  // Create user object for components that need it
  const user = profile ? {
    fullName: authUser?.name || '',
    email: '',
    educationLevel: profile.education_level || '',
    major: profile.major || '',
    gpa: profile.gpa || '',
    gradYear: profile.graduation_year?.toString() || '',
    degree: profile.intended_degree || '',
    fieldOfStudy: profile.field_of_study || '',
    preferredCountries: profile.preferred_countries || [],
    intake: profile.target_intake || '',
    budgetMin: profile.budget_min?.toString() || '',
    budgetMax: profile.budget_max?.toString() || '',
    funding: profile.funding_type || '',
    exams: [],
    scores: {},
    isOnboarded: profile.onboarding_completed
  } : null;

  const handleOnboardingComplete = async (data: Record<string, unknown>) => {
    await useAuthStore.getState().completeOnboarding(data);
  };

  const handleProfileUpdate = async (updates: Record<string, unknown>) => {
    await updateProfile(updates as never);
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          isLoading ? (
            <div className="min-h-screen flex items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth mode="login" />
        } />
        <Route path="/signup" element={
          isLoading ? (
            <div className="min-h-screen flex items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : isAuthenticated ? <Navigate to="/onboarding" replace /> : <Auth mode="signup" />
        } />

        {/* Onboarding - needs auth but NOT if already completed */}
        <Route path="/onboarding" element={
          <ProtectedRoute requireOnboarding={false}>
            {profile?.onboarding_completed ? (
              <Navigate to="/dashboard" replace />
            ) : (
              user && <OnboardingSelector user={user} onComplete={handleOnboardingComplete} />
            )}
          </ProtectedRoute>
        } />

        {/* Protected Routes - require auth and onboarding */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user && <Dashboard user={user} />}
          </ProtectedRoute>
        } />

        <Route path="/discover" element={
          <ProtectedRoute>
            {user && <Discovery user={user} />}
          </ProtectedRoute>
        } />

        <Route path="/shortlist" element={
          <ProtectedRoute>
            {user && <Shortlist user={user} />}
          </ProtectedRoute>
        } />

        <Route path="/tracker" element={
          <ProtectedRoute>
            {user && <Tracker user={user} />}
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute>
            {user && <Chat user={user} />}
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            {user && <Profile user={user} onLogout={signOut} onUpdate={handleProfileUpdate} />}
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
