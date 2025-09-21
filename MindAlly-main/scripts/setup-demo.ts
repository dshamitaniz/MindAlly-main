import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../lib/models/User';
import MoodEntry from '../lib/models/MoodEntry';
import JournalEntry from '../lib/models/JournalEntry';
import Goal from '../lib/models/Goal';
import MeditationSession from '../lib/models/MeditationSession';

// Demo data
const DEMO_USER = {
  name: 'Priya Sharma',
  email: process.env.DEMO_EMAIL,
  password: process.env.DEMO_PASSWORD,
  preferences: {
    theme: 'system' as const,
    language: 'hi',
    notifications: {
      email: true,
      push: true,
    },
    accessibility: {
      largeText: false,
      highContrast: false,
      dyslexiaFont: false,
      reduceMotion: false,
    },
    privacy: {
      aiConsent: true,
      dataSharing: false,
      crisisLogging: true,
    },
    ai: {
      provider: 'ollama',
      conversationMemory: true,
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'llama3',
    },
  },
};

const DEMO_MOOD_ENTRIES = [
  {
    mood: 4,
    notes: 'आज बहुत अच्छा महसूस हो रहा है! सुबह की सैर के बाद बहुत तरोताजा लग रहा है।',
    tags: ['productive', 'optimistic', 'energetic', 'morning-walk'],
    activities: ['exercise', 'family-time', 'meditation'],
  },
  {
    mood: 3,
    notes: 'Office में presentation के बारे में थोड़ा tension है, लेकिन overall ठीक हूं।',
    tags: ['stressed', 'work', 'nervous', 'presentation'],
    activities: ['work', 'preparation', 'coffee'],
  },
  {
    mood: 5,
    notes: 'Amazing day! दोस्तों के साथ गप्पे मारी और बहुत खुशी हुई।',
    tags: ['happy', 'social', 'connected', 'friends'],
    activities: ['social', 'friends', 'fun', 'chai'],
  },
  {
    mood: 2,
    notes: 'आज थोड़ा down feel हो रहा है। शायद कुछ me-time चाहिए।',
    tags: ['sad', 'tired', 'self-care', 'me-time'],
    activities: ['rest', 'reflection', 'music'],
  },
  {
    mood: 4,
    notes: 'Good day overall. घर के काम पूरे किए और satisfied feel हो रहा है।',
    tags: ['accomplished', 'productive', 'satisfied', 'home'],
    activities: ['work', 'achievement', 'family'],
  },
  {
    mood: 3,
    notes: 'Monsoon season में health issues हो रहे हैं, but managing well।',
    tags: ['health', 'seasonal', 'managing'],
    activities: ['rest', 'medication', 'care'],
  },
  {
    mood: 4,
    notes: 'Festival season की तैयारी में busy हूं, excited भी हूं!',
    tags: ['festival', 'excited', 'preparation', 'family'],
    activities: ['shopping', 'family', 'celebration'],
  },
];

const DEMO_JOURNAL_ENTRIES = [
  {
    title: 'Personal Growth Journey',
    content: 'आज मुझे एहसास हुआ कि पिछले कुछ महीनों में मैंने कितना सीखा है। पहले छोटी-छोटी बातों से मैं परेशान हो जाती थी, लेकिन अब मैं उन्हें confidence के साथ handle करती हूं। यह हमेशा आसान नहीं होता, लेकिन मैं सीख रही हूं कि अपनी ability पर trust कैसे करना है। मैं अपने support system के लिए grateful हूं।',
    mood: 4,
    tags: ['growth', 'gratitude', 'reflection', 'confidence'],
    isPrivate: false,
  },
  {
    title: 'Work-Life Balance',
    content: 'Office में presentation का tension है, लेकिन मैं meditation techniques use कर रही हूं। मैंने अच्छी तैयारी की है और मुझे पता है कि मैं यह कर सकती हूं। Sometimes मैं भूल जाती हूं कि nervous feel करना normal है। Family support भी मिल रहा है।',
    mood: 3,
    tags: ['work', 'anxiety', 'coping', 'family-support'],
    isPrivate: true,
  },
  {
    title: 'Festival Preparations',
    content: 'दिवाली की तैयारी में busy हूं और यह मुझे बहुत खुशी दे रहा है। Family के साथ time spend करना और traditions follow करना मुझे grounded feel कराता है। Mom के साथ मिठाई बनाना और decorations करना बहुत peaceful है।',
    mood: 5,
    tags: ['festival', 'family', 'traditions', 'joy'],
    isPrivate: false,
  },
  {
    title: 'Monsoon Blues',
    content: 'बारिश के मौसम में sometimes mood down हो जाता है। Health issues भी हो रहे हैं। लेकिन मैं positive रहने की कोशिश कर रही हूं। Hot chai और good music के साथ time pass कर रही हूं।',
    mood: 2,
    tags: ['seasonal', 'health', 'self-care', 'weather'],
    isPrivate: true,
  },
  {
    title: 'Career Decisions',
    content: 'Career में कुछ important decisions लेने हैं। Family की expectations और अपनी interests के बीच balance बनाना challenging है। Mom-Dad का support मिल रहा है, लेकिन final decision मुझे ही लेना है।',
    mood: 3,
    tags: ['career', 'decisions', 'family', 'pressure'],
    isPrivate: true,
  },
];

const DEMO_GOALS = [
  {
    title: 'Daily Yoga & Meditation',
    description: 'Practice yoga and meditation for at least 15 minutes every morning to start the day with positive energy.',
    category: 'health' as const,
    type: 'habit' as const,
    priority: 'high' as const,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    progress: 70,
    status: 'in-progress' as const,
  },
  {
    title: 'Better Sleep Schedule',
    description: 'Maintain consistent sleep schedule (10 PM - 6 AM) to improve overall health and energy levels.',
    category: 'health' as const,
    type: 'habit' as const,
    priority: 'high' as const,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    progress: 50,
    status: 'in-progress' as const,
  },
  {
    title: 'Morning Walk Routine',
    description: 'Go for a 30-minute morning walk in the park to stay active and connect with nature.',
    category: 'health' as const,
    type: 'habit' as const,
    priority: 'medium' as const,
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    progress: 40,
    status: 'in-progress' as const,
  },
  {
    title: 'Learn Traditional Cooking',
    description: 'Learn to cook 5 traditional Indian dishes to connect with culture and improve nutrition.',
    category: 'personal' as const,
    type: 'challenge' as const,
    priority: 'medium' as const,
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    progress: 20,
    status: 'in-progress' as const,
  },
  {
    title: 'Family Time Goals',
    description: 'Spend quality time with family members at least 3 times per week.',
    category: 'relationships' as const,
    type: 'habit' as const,
    priority: 'high' as const,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    progress: 60,
    status: 'in-progress' as const,
  },
];

const DEMO_MEDITATION_SESSIONS = [
  {
    type: 'breathing' as const,
    duration: 15,
    completed: true,
  },
  {
    type: 'body-scan' as const,
    duration: 20,
    completed: true,
  },
  {
    type: 'concentration' as const,
    duration: 25,
    completed: true,
  },
  {
    type: 'progressive-relaxation' as const,
    duration: 30,
    completed: true,
  },
  {
    type: 'breathing' as const,
    duration: 10,
    completed: true,
  },
];

async function setupDemo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: DEMO_USER.email });
    if (existingUser) {
      console.log('Demo user already exists. Updating data...');
      
      // Delete existing demo data
      await MoodEntry.deleteMany({ userId: existingUser._id });
      await JournalEntry.deleteMany({ userId: existingUser._id });
      await Goal.deleteMany({ userId: existingUser._id });
      await MeditationSession.deleteMany({ userId: existingUser._id });
      
      // Update user
      const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);
      await User.findByIdAndUpdate(existingUser._id, {
        ...DEMO_USER,
        password: hashedPassword,
      });
      
      const demoUser = await User.findById(existingUser._id);
      await createDemoData(demoUser!);
    } else {
      // Create demo user
      const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);
      const demoUser = new User({
        ...DEMO_USER,
        password: hashedPassword,
      });
      await demoUser.save();
      console.log('Demo user created');
      
      await createDemoData(demoUser);
    }

    console.log('Demo account setup complete!');
    console.log('Email: ' + process.env.DEMO_EMAIL);
    console.log('Password: ' + process.env.DEMO_PASSWORD);
    
  } catch (error) {
    console.error('Error setting up demo account:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function createDemoData(user: any) {
  // Create mood entries
  for (let i = 0; i < DEMO_MOOD_ENTRIES.length; i++) {
    const entry = new MoodEntry({
      ...DEMO_MOOD_ENTRIES[i],
      userId: user._id,
      createdAt: new Date(Date.now() - (DEMO_MOOD_ENTRIES.length - i) * 24 * 60 * 60 * 1000),
    });
    await entry.save();
  }

  // Create journal entries
  for (let i = 0; i < DEMO_JOURNAL_ENTRIES.length; i++) {
    const entry = new JournalEntry({
      ...DEMO_JOURNAL_ENTRIES[i],
      userId: user._id,
      createdAt: new Date(Date.now() - (DEMO_JOURNAL_ENTRIES.length - i) * 2 * 24 * 60 * 60 * 1000),
    });
    await entry.save();
  }

  // Create goals
  for (const goalData of DEMO_GOALS) {
    const goal = new Goal({
      ...goalData,
      userId: user._id,
    });
    await goal.save();
  }

  // Create meditation sessions
  for (let i = 0; i < DEMO_MEDITATION_SESSIONS.length; i++) {
    const session = new MeditationSession({
      ...DEMO_MEDITATION_SESSIONS[i],
      userId: user._id,
      createdAt: new Date(Date.now() - (DEMO_MEDITATION_SESSIONS.length - i) * 3 * 24 * 60 * 60 * 1000),
    });
    await session.save();
  }

  console.log('Demo data created successfully');
}

// Run the setup
setupDemo();