export interface User {
  _id: string;
  id: string; // Alias for _id for compatibility
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
    accessibility: {
      largeText: boolean;
      highContrast: boolean;
      dyslexiaFont: boolean;
      reduceMotion: boolean;
    };
    privacy: {
      aiConsent: boolean;
      dataSharing: boolean;
      crisisLogging: boolean;
    };
    ai: {
      provider: 'openai' | 'google' | 'ollama';
      googleApiKey?: string;
      ollamaBaseUrl?: string;
      ollamaModel?: string;
      conversationMemory: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodEntry {
  _id: string;
  userId: string;
  mood: 1 | 2 | 3 | 4 | 5; // 1 = very sad, 5 = very happy
  activities: string[];
  notes?: string;
  tags: string[];
  createdAt: Date;
}

export interface JournalEntry {
  _id: string;
  userId: string;
  title: string;
  content: string;
  template?: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'health' | 'career' | 'personal' | 'relationships' | 'learning' | 'other';
  type: 'habit' | 'task' | 'milestone' | 'challenge';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  progress: number; // 0-100
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assessment {
  _id: string;
  userId: string;
  type: 'phq9' | 'gad7' | 'rse' | 'spin' | 'ocir' | 'mbi' | 'npi16';
  responses: number[];
  score: number;
  interpretation: string;
  recommendations: string[];
  completedAt: Date;
}

export interface Therapist {
  _id: string;
  name: string;
  email: string;
  phone: string;
  credentials: string[];
  specialties: string[];
  bio: string;
  photo?: string;
  location: {
    city: string;
    state: string;
    country: string;
    online: boolean;
  };
  availability: {
    days: string[];
    hours: string;
    timezone: string;
  };
  insurance: string[];
  languages: string[];
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'tips' | 'wellness' | 'mindfulness' | 'safety';
  author: {
    name: string;
    bio: string;
    avatar?: string;
  };
  tags: string[];
  readingTime: number;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  crisisDetected: boolean;
  crisisLevel?: 'low' | 'moderate' | 'high' | 'imminent';
  language: string;
}

export interface CrisisEvent {
  _id: string;
  userId: string;
  messageId: string;
  level: 'low' | 'moderate' | 'high' | 'imminent';
  keywords: string[];
  response: string;
  escalated: boolean;
  timestamp: Date;
}

export interface MeditationSession {
  _id: string;
  userId: string;
  type: 'breathing' | 'body-scan' | 'progressive-relaxation' | 'concentration' | 'sleep-story';
  duration: number; // in minutes
  completed: boolean;
  timestamp: Date;
}

export interface Quote {
  _id: string;
  text: string;
  author: string;
  category: 'motivation' | 'mindfulness' | 'success' | 'peace' | 'wisdom' | 'love';
  language: string;
  source?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'mood-reminder' | 'goal-reminder' | 'assessment-reminder' | 'crisis-support' | 'general';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface DashboardStats {
  currentMood: number;
  moodTrend: number[]; // last 7 days
  journalEntriesThisWeek: number;
  meditationStreak: number;
  meditationTimeThisWeek: number;
  activeGoals: number;
  completedGoalsThisWeek: number;
  assessmentsCompleted: number;
  lastAssessmentDate?: Date;
}

export interface CrisisResponse {
  level: 'low' | 'moderate' | 'high' | 'imminent';
  message: string;
  helplines: {
    name: string;
    number: string;
    text?: string;
    website?: string;
    languages?: string[];
    description?: string;
  }[];
  actions: {
    call: boolean;
    text: boolean;
    grounding: boolean;
    resources: boolean;
  };
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  pattern: {
    inhale: number;
    hold: number;
    exhale: number;
    holdAfter: number;
  };
  duration: number; // in minutes
  benefits: string[];
}

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  prompts: string[];
  category: string;
}

