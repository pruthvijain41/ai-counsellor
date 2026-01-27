import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('Supabase Init:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    hasKey: !!supabaseAnonKey,
    mode: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing! Check .env files.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    education_level: string | null;
                    major: string | null;
                    gpa: number | null;
                    grad_year: string | null;
                    intended_degree: string | null;
                    field_of_study: string | null;
                    preferred_countries: string[] | null;
                    target_intake: string | null;
                    budget_min: number | null;
                    budget_max: number | null;
                    funding_type: string | null;
                    ielts_status: string | null;
                    ielts_score: number | null;
                    gre_status: string | null;
                    gre_score: number | null;
                    sop_status: string | null;
                    current_stage: string;
                    is_onboarded: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
                Update: Partial<Database['public']['Tables']['profiles']['Row']>;
            };
            shortlisted_universities: {
                Row: {
                    id: string;
                    user_id: string;
                    university_name: string;
                    country: string;
                    match_type: string;
                    is_locked: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['shortlisted_universities']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['shortlisted_universities']['Row']>;
            };
            application_tasks: {
                Row: {
                    id: string;
                    user_id: string;
                    university_id: string | null;
                    title: string;
                    category: string;
                    priority: string;
                    due_date: string | null;
                    is_completed: boolean;
                    notes: string | null;
                };
                Insert: Omit<Database['public']['Tables']['application_tasks']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['application_tasks']['Row']>;
            };
        };
    };
};
