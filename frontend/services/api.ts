import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

// Create axios instance with defaults
export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/#/login';
        }
        return Promise.reject(error);
    }
);

// ============ AUTH API ============
export const authAPI = {
    signup: async (email: string, password: string, name: string) => {
        const response = await api.post('/auth/signup', { email, password, name });
        return response.data;
    },

    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('access_token');
    },

    googleAuth: async (email: string, name: string) => {
        const response = await api.post('/auth/google', { email, name });
        return response.data;
    }
};

// ============ PROFILE API ============
export const profileAPI = {
    get: async () => {
        const response = await api.get('/profile');
        return response.data;
    },

    update: async (data: Record<string, unknown>) => {
        const response = await api.put('/profile', data);
        return response.data;
    },

    complete: async (data: Record<string, unknown>) => {
        const response = await api.post('/profile/complete-onboarding', data);
        return response.data;
    }
};

// ============ UNIVERSITIES API ============
export const universitiesAPI = {
    search: async (country: string) => {
        const response = await api.get('/universities/search', { params: { country } });
        return response.data;
    },

    getShortlist: async () => {
        const response = await api.get('/universities/shortlist');
        return response.data;
    },

    addToShortlist: async (university: Record<string, unknown>) => {
        const response = await api.post('/universities/shortlist', university);
        return response.data;
    },

    removeFromShortlist: async (id: string) => {
        const response = await api.delete(`/universities/shortlist/${id}`);
        return response.data;
    },

    lockUniversity: async (id: string) => {
        const response = await api.post(`/universities/lock/${id}`);
        return response.data;
    },

    unlockUniversity: async (id: string) => {
        const response = await api.post(`/universities/unlock/${id}`);
        return response.data;
    },

    getRecommendations: async () => {
        const response = await api.get('/universities/recommendations');
        return response.data;
    }
};

// ============ TASKS API ============
export const tasksAPI = {
    getAll: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },

    generate: async () => {
        const response = await api.post('/tasks/generate');
        return response.data;
    },

    complete: async (id: string) => {
        const response = await api.patch(`/tasks/${id}/complete`);
        return response.data;
    },

    update: async (id: string, data: Record<string, unknown>) => {
        const response = await api.put(`/tasks/${id}`, data);
        return response.data;
    }
};

// ============ AI CHAT API ============
export const aiAPI = {
    chat: async (message: string, context?: Record<string, unknown>) => {
        const response = await api.post('/ai/chat', { message, context });
        return response.data;
    },

    analyzeProfile: async () => {
        const response = await api.get('/ai/analyze-profile');
        return response.data;
    },

    getNextSteps: async () => {
        const response = await api.get('/ai/next-steps');
        return response.data;
    }
};

export default api;
