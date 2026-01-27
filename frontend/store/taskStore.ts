import { create } from 'zustand';
import { tasksAPI } from '../services/api';

interface Task {
    id: string;
    title: string;
    description: string | null;
    type: string | null;
    deadline: string | null;
    priority: string;
    is_completed: boolean;
    completed_at: string | null;
    university_id: string | null;
    university_name?: string;
    created_at: string;
}

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    isGenerating: boolean;
    filter: string;
    error: string | null;

    // Actions
    fetchTasks: () => Promise<void>;
    generateTasks: () => Promise<void>;
    completeTask: (id: string) => Promise<boolean>;
    updateTask: (id: string, data: Partial<Task>) => Promise<boolean>;
    setFilter: (filter: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    isGenerating: false,
    filter: 'All',
    error: null,

    fetchTasks: async () => {
        set({ isLoading: true, error: null });

        try {
            const tasks = await tasksAPI.getAll();
            set({ tasks, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({
                error: 'Failed to load tasks',
                isLoading: false,
                tasks: []
            });
        }
    },

    generateTasks: async () => {
        set({ isGenerating: true, error: null });

        try {
            const newTasks = await tasksAPI.generate();
            // Merge new tasks with existing
            set((state) => ({
                tasks: [...state.tasks, ...newTasks],
                isGenerating: false
            }));
        } catch (error) {
            console.error('Failed to generate tasks:', error);
            set({
                error: 'Failed to generate tasks',
                isGenerating: false
            });
        }
    },

    completeTask: async (id: string) => {
        try {
            await tasksAPI.complete(id);

            // Update local state
            set((state) => ({
                tasks: state.tasks.map(t =>
                    t.id === id
                        ? { ...t, is_completed: true, completed_at: new Date().toISOString() }
                        : t
                )
            }));

            return true;
        } catch (error) {
            console.error('Failed to complete task:', error);
            return false;
        }
    },

    updateTask: async (id: string, data: Partial<Task>) => {
        try {
            const updated = await tasksAPI.update(id, data);

            // Update local state
            set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, ...updated } : t)
            }));

            return true;
        } catch (error) {
            console.error('Failed to update task:', error);
            return false;
        }
    },

    setFilter: (filter: string) => {
        set({ filter });
    }
}));
