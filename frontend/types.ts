
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
  ielts_type?: 'IELTS' | 'TOEFL';
  ielts_score?: number;
  toefl_status?: string;
  toefl_score?: number;
  gre_status?: string;
  gre_type?: 'GRE' | 'GMAT';
  gre_score?: number;
  gmat_status?: string;
  gmat_score?: number;
  sop_status?: string;
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
