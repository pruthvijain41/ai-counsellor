import { create } from 'zustand';
import { universitiesAPI } from '../services/api';

interface EnrichedData {
    estimated_tuition_min: number;
    estimated_tuition_max: number;
    acceptance_rate: string;
    match_score: number;
    match_type: 'Dream' | 'Target' | 'Safe';
    risk_level: string;
    why_fits: string;
    risks: string;
    admission_analysis?: string;
    match_tier?: string;
}

interface University {
    name: string;
    country: string;
    alpha_two_code: string;
    web_pages: string[];
    domains: string[];
    enriched_data?: EnrichedData;
}

interface ShortlistedUniversity {
    id: string;
    university_name: string;
    country: string;
    alpha_two_code?: string;
    web_pages?: string[];
    enriched_data?: EnrichedData;
    status: 'SHORTLISTED' | 'LOCKED';
    locked_at?: string;
    created_at: string;
}

interface UniversityState {
    universities: University[];
    shortlist: ShortlistedUniversity[];
    searchCountry: string;
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;

    // Actions
    searchUniversities: (country: string) => Promise<void>;
    fetchShortlist: () => Promise<void>;
    addToShortlist: (university: University) => Promise<boolean>;
    removeFromShortlist: (id: string) => Promise<boolean>;
    lockUniversity: (id: string) => Promise<boolean>;
    unlockUniversity: (id: string) => Promise<boolean>;
    clearSearch: () => void;
}

export const useUniversityStore = create<UniversityState>((set, get) => ({
    universities: [],
    shortlist: [],
    searchCountry: '',
    isLoading: false,
    isSearching: false,
    error: null,

    searchUniversities: async (country: string) => {
        set({ isSearching: true, error: null, searchCountry: country });

        try {
            const universities = await universitiesAPI.search(country);
            set({ universities, isSearching: false });
        } catch (error) {
            console.error('Search failed:', error);
            set({
                error: 'Failed to search universities',
                isSearching: false,
                universities: []
            });
        }
    },

    fetchShortlist: async () => {
        set({ isLoading: true });

        try {
            const shortlist = await universitiesAPI.getShortlist();
            set({ shortlist, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch shortlist:', error);
            set({ isLoading: false });
        }
    },

    addToShortlist: async (university: University) => {
        try {
            const result = await universitiesAPI.addToShortlist({
                university_name: university.name,
                country: university.country,
                alpha_two_code: university.alpha_two_code,
                web_pages: university.web_pages,
                domains: university.domains,
                enriched_data: university.enriched_data
            });

            // Add to local state
            set((state) => ({
                shortlist: [...state.shortlist, result]
            }));

            return true;
        } catch (error) {
            console.error('Failed to add to shortlist:', error);
            return false;
        }
    },

    removeFromShortlist: async (id: string) => {
        try {
            await universitiesAPI.removeFromShortlist(id);

            // Remove from local state
            set((state) => ({
                shortlist: state.shortlist.filter(u => u.id !== id)
            }));

            return true;
        } catch (error) {
            console.error('Failed to remove from shortlist:', error);
            return false;
        }
    },

    lockUniversity: async (id: string) => {
        try {
            const result = await universitiesAPI.lockUniversity(id);

            // Update local state
            set((state) => ({
                shortlist: state.shortlist.map(u =>
                    u.id === id ? { ...u, status: 'LOCKED' as const, locked_at: new Date().toISOString() } : u
                )
            }));

            return true;
        } catch (error) {
            console.error('Failed to lock university:', error);
            return false;
        }
    },

    unlockUniversity: async (id: string) => {
        try {
            await universitiesAPI.unlockUniversity(id);

            // Update local state
            set((state) => ({
                shortlist: state.shortlist.map(u =>
                    u.id === id ? { ...u, status: 'SHORTLISTED' as const, locked_at: undefined } : u
                )
            }));

            return true;
        } catch (error) {
            console.error('Failed to unlock university:', error);
            return false;
        }
    },

    clearSearch: () => {
        set({ universities: [], searchCountry: '' });
    }
}));
