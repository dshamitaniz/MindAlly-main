// Centralized constants for better maintainability and consistency

// Authentication
export const DEMO_CREDENTIALS = {
  EMAIL: 'demo@mind.ally',
  PASSWORD: 'demo@1234'
} as const;

// Mood Scale
export const MOOD_SCALE = [
  { value: 1, label: 'Very Sad', color: 'text-red-600', emoji: '😢' },
  { value: 2, label: 'Sad', color: 'text-orange-600', emoji: '😔' },
  { value: 3, label: 'Neutral', color: 'text-yellow-600', emoji: '😐' },
  { value: 4, label: 'Good', color: 'text-green-600', emoji: '😊' },
  { value: 5, label: 'Great', color: 'text-blue-600', emoji: '😄' }
] as const;

// Activities
export const DAILY_ACTIVITIES = [
  'Exercise', 'Work', 'Socializing', 'Reading', 'Cooking', 'Music',
  'Nature', 'Gaming', 'Art', 'Sleep', 'Meditation', 'Family'
] as const;

// Emotion Tags
export const EMOTION_TAGS = [
  'Anxious', 'Stressed', 'Excited', 'Grateful', 'Lonely', 'Confident',
  'Overwhelmed', 'Peaceful', 'Frustrated', 'Hopeful', 'Tired', 'Energetic'
] as const;

// Goal Categories
export const GOAL_CATEGORIES = [
  'mental-health', 'wellness', 'productivity', 'personal', 
  'fitness', 'learning', 'spiritual', 'family'
] as const;

// Priority Levels
export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;

// Goal Status
export const GOAL_STATUS = [
  'not-started', 'in-progress', 'completed', 'paused'
] as const;

// Days of Week
export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
] as const;

// Therapy Specializations
export const THERAPY_SPECIALIZATIONS = [
  'Anxiety Disorders',
  'Depression',
  'Trauma & PTSD',
  'Cultural Therapy',
  'Relationship Issues',
  'Couples Therapy',
  'Family Therapy',
  'Inter-generational Conflicts',
  'Women\'s Issues',
  'Domestic Violence',
  'Addiction',
  'Substance Abuse',
  'Eating Disorders',
  'Body Image',
  'Body Dysmorphia',
  'Self-Esteem',
  'Child & Adolescent',
  'Academic Pressure',
  'ADHD',
  'Autism Spectrum',
  'Elderly Care',
  'Dementia',
  'Loneliness',
  'Age-related Depression',
  'Career Counseling',
  'Life Transitions',
  'Work Stress',
  'Mid-life Crisis',
  'LGBTQ+ Issues',
  'Gender Identity',
  'Coming Out',
  'Family Acceptance',
  'Sports Psychology',
  'Performance Anxiety',
  'Injury Recovery',
  'Mental Training',
  'Prenatal Depression',
  'Postpartum Depression',
  'Pregnancy Anxiety',
  'Parenting Stress',
  'Mindfulness',
  'Meditation',
  'Stress Reduction',
  'Spiritual Counseling',
  'Bipolar Disorder',
  'OCD',
  'Grief & Loss',
  'Anger Management',
  'Sleep Disorders'
] as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Urdu',
  'Kannada',
  'Odia',
  'Malayalam',
  'Punjabi',
  'Assamese',
  'Nepali',
  'Sanskrit',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Portuguese',
  'Other'
] as const;

// Crisis Keywords
export const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'not worth living', 'want to die',
  'hurt myself', 'self harm', 'cutting', 'overdose', 'jump off', 'hang myself',
  'crisis', 'emergency', 'help me', 'can\'t go on', 'give up', 'hopeless'
] as const;

// AI Models
export const OLLAMA_MODELS = [
  { 
    name: 'llama3.1:latest', 
    size: '4.9 GB', 
    description: 'Latest Llama 3.1 model - best for general conversation and mental health support', 
    recommended: true,
    category: 'general' as const
  },
  { 
    name: 'deepseek-r1:8b', 
    size: '5.2 GB', 
    description: 'DeepSeek R1 - excellent for reasoning, analysis, and complex mental health discussions', 
    recommended: true,
    category: 'reasoning' as const
  },
  { 
    name: 'qwen3:8b', 
    size: '5.2 GB', 
    description: 'Qwen3 - great for multilingual support and diverse cultural perspectives', 
    recommended: false,
    category: 'multilingual' as const
  },
  { 
    name: 'llama3.2:3b', 
    size: '2.0 GB', 
    description: 'Lightweight Llama 3.2 - fast responses, good for quick interactions', 
    recommended: false,
    category: 'lightweight' as const
  },
  { 
    name: 'gemma3:4b', 
    size: '3.3 GB', 
    description: 'Google Gemma 3 - good for creative tasks and expressive writing', 
    recommended: false,
    category: 'creative' as const
  },
  { 
    name: 'phi4:latest', 
    size: '9.1 GB', 
    description: 'Microsoft Phi-4 - advanced reasoning and complex problem solving', 
    recommended: false,
    category: 'reasoning' as const
  }
] as const;

// Color Mappings
export const CATEGORY_COLORS = {
  general: 'bg-blue-100 text-blue-800',
  reasoning: 'bg-purple-100 text-purple-800',
  creative: 'bg-green-100 text-green-800',
  multilingual: 'bg-orange-100 text-orange-800',
  lightweight: 'bg-gray-100 text-gray-800',
} as const;

export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const;

export const STATUS_COLORS = {
  'not-started': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'paused': 'bg-yellow-100 text-yellow-800',
} as const;

export const GOAL_CATEGORY_COLORS = {
  'mental-health': 'bg-pink-100 text-pink-800',
  'wellness': 'bg-green-100 text-green-800',
  'productivity': 'bg-blue-100 text-blue-800',
  'personal': 'bg-purple-100 text-purple-800',
  'fitness': 'bg-orange-100 text-orange-800',
  'learning': 'bg-indigo-100 text-indigo-800',
  'spiritual': 'bg-yellow-100 text-yellow-800',
  'family': 'bg-red-100 text-red-800',
} as const;

// Journal Templates
export const JOURNAL_TEMPLATES = [
  {
    id: 'gratitude',
    title: 'Gratitude Journal',
    description: 'Write about things you\'re grateful for today',
    icon: '🙏',
    prompts: [
      'What are three things you\'re grateful for today?',
      'Who made you smile today?',
      'What small moment brought you joy?'
    ]
  },
  {
    id: 'reflection',
    title: 'Daily Reflection',
    description: 'Reflect on your day and how you\'re feeling',
    icon: '🤔',
    prompts: [
      'How did today go overall?',
      'What was the highlight of your day?',
      'What would you do differently?'
    ]
  },
  {
    id: 'goals',
    title: 'Goal Setting',
    description: 'Set and track your personal goals',
    icon: '🎯',
    prompts: [
      'What do you want to achieve this week?',
      'What steps will you take tomorrow?',
      'How will you measure your progress?'
    ]
  },
  {
    id: 'emotions',
    title: 'Emotional Check-in',
    description: 'Explore and process your emotions',
    icon: '💭',
    prompts: [
      'What emotions did you experience today?',
      'What triggered these feelings?',
      'How did you handle them?'
    ]
  }
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    UPDATE: '/api/auth/update'
  },
  AI: {
    CHAT: '/api/ai/chat'
  },
  JOURNAL: {
    ENTRIES: '/api/journal/entries'
  },
  MOOD: {
    ENTRIES: '/api/mood/entries',
    STATS: '/api/mood/stats'
  },
  MEDITATION: {
    SESSIONS: '/api/meditation/sessions'
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats'
  },
  USER: {
    AI_SETTINGS: '/api/user/ai-settings'
  }
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'mind-ui-theme',
  GOALS: 'mind-goals',
  JOURNAL_ENTRIES: 'mind-journal-entries',
  MOOD_ENTRIES: 'mind-mood-entries',
  USER_PREFERENCES: 'mind-user-preferences'
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  WORDS_PER_MINUTE: 200,
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    DEFAULT: 4000
  },
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000
} as const;