import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, profileAPI } from '../services/api';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    email: string;
    name: string;
}

interface Profile {
    id: string;
    user_id: string;
    // Academic Background
    education_level: string | null;
    degree: string | null;
    major: string | null;
    graduation_year: number | null;
    gpa: number | null;
    // Study Goals
    intended_degree: string | null;
    field_of_study: string | null;
    target_intake: string | null;
    preferred_countries: string[] | null;
    // Budget
    budget_min: number | null;
    budget_max: number | null;
    funding_type: string | null;
    // Exams
    ielts_status: string | null;
    ielts_score: number | null;
    gre_status: string | null;
    gre_score: number | null;
    sop_status: string | null;
    // Status
    current_stage: string;
    onboarding_completed: boolean;
    has_seen_tour: boolean;
}

interface AuthState {
    user: User | null;
    profile: Profile | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    signUp: (email: string, password: string, name: string) => Promise<boolean>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<void>;
    handleGoogleCallback: (email: string, name: string) => Promise<boolean>;
    signOut: () => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<boolean>;
    completeOnboarding: (data: Record<string, unknown>) => Promise<boolean>;
    markTourAsSeen: () => Promise<void>;
    clearError: () => void;
    initializeFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,

            initializeFromStorage: async () => {
                const token = localStorage.getItem('access_token');

                // If no token, explicitly set not authenticated
                if (!token) {
                    set({
                        user: null,
                        profile: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    return;
                }

                // Token exists, try to validate it
                set({ token, isLoading: true });
                try {
                    const user = await authAPI.getMe();
                    const profile = await profileAPI.get();
                    set({
                        user,
                        profile,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch {
                    // Token invalid, clear it
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('auth-storage');
                    set({
                        user: null,
                        profile: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            },

            signUp: async (email: string, password: string, name: string) => {
                set({ isLoading: true, error: null });

                try {
                    const data = await authAPI.signup(email, password, name);
                    const token = data.access_token;

                    localStorage.setItem('access_token', token);


                    // Fetch user data
                    const user = await authAPI.getMe();
                    // [FIX] Fetch profile immediately so App.tsx can derive 'user' object for Onboarding
                    const profile = await profileAPI.get();

                    set({
                        user,
                        profile,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    return true;
                } catch (error: unknown) {
                    const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Signup failed';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            signIn: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const data = await authAPI.login(email, password);
                    const token = data.access_token;

                    localStorage.setItem('access_token', token);

                    // Fetch user and profile
                    const user = await authAPI.getMe();
                    const profile = await profileAPI.get();

                    set({
                        user,
                        profile,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    return true;
                } catch (error: unknown) {
                    const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Login failed';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            signInWithGoogle: async () => {
                console.log('Initiating Google Sign In...');
                set({ isLoading: true, error: null });
                try {
                    const redirectUrl = `${window.location.origin}/#/dashboard`;
                    console.log('Redirecting to:', redirectUrl);

                    const { data, error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: redirectUrl,
                            skipBrowserRedirect: false
                        }
                    });

                    console.log('Supabase Response:', { data, error });

                    if (error) {
                        console.error('Supabase Auth Error:', error);
                        set({ error: error.message, isLoading: false });
                    } else if (data.url) {
                        console.log('Manual redirecting to:', data.url);
                        window.location.href = data.url;
                    }
                } catch (error: unknown) {
                    console.error('Google Sign In Exception:', error);
                    const message = error instanceof Error ? error.message : 'Google sign-in failed';
                    set({ error: message, isLoading: false });
                }
            },

            handleGoogleCallback: async (email: string, name: string) => {
                set({ isLoading: true, error: null });
                try {
                    // Call backend to create/sync user and get backend JWT
                    const data = await authAPI.googleAuth(email, name);
                    const token = data.access_token;

                    localStorage.setItem('access_token', token);

                    // Fetch user and profile
                    const user = await authAPI.getMe();
                    const profile = await profileAPI.get();

                    set({
                        user,
                        profile,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    return true;
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : 'Google authentication failed';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            signOut: () => {
                // Clear both the access token and the persist storage
                localStorage.removeItem('access_token');
                localStorage.removeItem('auth-storage');
                set({
                    user: null,
                    profile: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            fetchProfile: async () => {
                try {
                    const profile = await profileAPI.get();
                    set({ profile });
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            },

            updateProfile: async (data: Partial<Profile>) => {
                try {
                    const profile = await profileAPI.update(data);
                    set({ profile });
                    return true;
                } catch (error) {
                    console.error('Failed to update profile:', error);
                    return false;
                }
            },

            completeOnboarding: async (data: Record<string, unknown>) => {
                set({ isLoading: true });
                try {
                    const profile = await profileAPI.complete(data);
                    set({ profile, isLoading: false });
                    return true;
                } catch (error) {
                    console.error('Failed to complete onboarding:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            markTourAsSeen: async () => {
                try {
                    const profile = await profileAPI.update({ has_seen_tour: true });
                    set({ profile });
                } catch (error) {
                    console.error('Failed to mark tour as seen:', error);
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);
