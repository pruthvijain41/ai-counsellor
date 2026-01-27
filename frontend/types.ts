
export interface UserProfile {
  fullName: string;
  email: string;
  educationLevel: string;
  major: string;
  gpa: string;
  gradYear: string;
  degree: string;
  fieldOfStudy: string;
  preferredCountries: string[];
  intake: string;
  budgetMin: string;
  budgetMax: string;
  funding: string;
  exams: string[];
  scores: Record<string, string>;
  isOnboarded: boolean;
}

export interface University {
  id: string;
  name: string;
  location: string;
  logo: string;
  cover: string;
  type: 'Dream' | 'Target' | 'Safe';
  acceptanceRate: string;
  tuition: string;
  ranking: number;
  description: string;
  requirements: {
    gpa: string;
    test: string;
  };
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Documents' | 'Exams' | 'Forms';
  university?: string;
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
