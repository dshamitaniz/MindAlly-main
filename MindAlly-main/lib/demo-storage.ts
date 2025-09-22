import fs from 'fs/promises';
import path from 'path';

const DEMO_DATA_DIR = path.join(process.cwd(), 'temp-demo-data');
const DEMO_EMAILS = ['demo@mind.app', 'demo@mindally.com', 'demo@mind.ally'];

interface DemoUser {
  _id: string;
  email: string;
  name: string;
  preferences: any;
  createdAt: Date;
}

interface DemoConversation {
  userId: string;
  messages: any[];
  context: any;
}

interface DemoMoodEntry {
  userId: string;
  mood: number;
  activities: string[];
  notes: string;
  timestamp: Date;
}

interface DemoJournalEntry {
  userId: string;
  title: string;
  content: string;
  mood: number;
  timestamp: Date;
}

interface DemoGoal {
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  progress: number;
}

class DemoStorage {
  private async ensureDir() {
    try {
      await fs.access(DEMO_DATA_DIR);
    } catch {
      await fs.mkdir(DEMO_DATA_DIR, { recursive: true });
    }
  }

  private getFilePath(collection: string, userId?: string) {
    const filename = userId ? `${collection}-${userId}.json` : `${collection}.json`;
    return path.join(DEMO_DATA_DIR, filename);
  }

  private async readFile(filePath: string) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async writeFile(filePath: string, data: any) {
    await this.ensureDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  isDemoUser(email: string): boolean {
    return DEMO_EMAILS.includes(email);
  }

  // User operations
  async findUser(email: string): Promise<DemoUser | null> {
    if (!this.isDemoUser(email)) return null;
    
    const filePath = this.getFilePath('users');
    const users = await this.readFile(filePath) || [];
    return users.find((u: DemoUser) => u.email === email) || null;
  }

  async createUser(userData: Partial<DemoUser>): Promise<DemoUser> {
    const filePath = this.getFilePath('users');
    const users = await this.readFile(filePath) || [];
    
    const newUser: DemoUser = {
      _id: `demo-${Date.now()}`,
      email: userData.email!,
      name: userData.name || 'Demo User',
      preferences: userData.preferences || {
        ai: {
          provider: 'google',
          conversationMemory: true,
          ollamaBaseUrl: 'http://localhost:11434',
          ollamaModel: 'llama3:latest'
        }
      },
      createdAt: new Date()
    };

    users.push(newUser);
    await this.writeFile(filePath, users);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<DemoUser>): Promise<DemoUser | null> {
    const filePath = this.getFilePath('users');
    const users = await this.readFile(filePath) || [];
    
    const userIndex = users.findIndex((u: DemoUser) => u._id === userId);
    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...updates };
    await this.writeFile(filePath, users);
    return users[userIndex];
  }

  // Conversation operations
  async findConversation(userId: string, sessionId: string): Promise<DemoConversation | null> {
    const filePath = this.getFilePath('conversations', userId);
    const conversations = await this.readFile(filePath) || [];
    return conversations.find((c: any) => c.context?.sessionId === sessionId) || null;
  }

  async saveConversation(conversation: DemoConversation): Promise<void> {
    const filePath = this.getFilePath('conversations', conversation.userId);
    const conversations = await this.readFile(filePath) || [];
    
    const existingIndex = conversations.findIndex((c: any) => 
      c.context?.sessionId === conversation.context?.sessionId
    );

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    await this.writeFile(filePath, conversations);
  }

  async deleteConversation(userId: string, sessionId: string): Promise<boolean> {
    const filePath = this.getFilePath('conversations', userId);
    const conversations = await this.readFile(filePath) || [];
    
    const filteredConversations = conversations.filter((c: any) => 
      c.context?.sessionId !== sessionId
    );

    if (filteredConversations.length !== conversations.length) {
      await this.writeFile(filePath, filteredConversations);
      return true;
    }
    return false;
  }

  // Mood entries
  async saveMoodEntry(entry: DemoMoodEntry): Promise<void> {
    const filePath = this.getFilePath('moods', entry.userId);
    const moods = await this.readFile(filePath) || [];
    moods.push({ ...entry, _id: `mood-${Date.now()}` });
    await this.writeFile(filePath, moods);
  }

  async getMoodEntries(userId: string, limit = 10): Promise<DemoMoodEntry[]> {
    const filePath = this.getFilePath('moods', userId);
    const moods = await this.readFile(filePath) || [];
    return moods.slice(-limit);
  }

  // Journal entries
  async saveJournalEntry(entry: DemoJournalEntry): Promise<void> {
    const filePath = this.getFilePath('journals', entry.userId);
    const journals = await this.readFile(filePath) || [];
    journals.push({ ...entry, _id: `journal-${Date.now()}` });
    await this.writeFile(filePath, journals);
  }

  async getJournalEntries(userId: string, limit = 10): Promise<DemoJournalEntry[]> {
    const filePath = this.getFilePath('journals', userId);
    const journals = await this.readFile(filePath) || [];
    return journals.slice(-limit);
  }

  // Goals
  async saveGoal(goal: DemoGoal): Promise<void> {
    const filePath = this.getFilePath('goals', goal.userId);
    const goals = await this.readFile(filePath) || [];
    goals.push({ ...goal, _id: `goal-${Date.now()}` });
    await this.writeFile(filePath, goals);
  }

  async getGoals(userId: string): Promise<DemoGoal[]> {
    const filePath = this.getFilePath('goals', userId);
    return await this.readFile(filePath) || [];
  }

  // Dashboard stats
  async getDashboardStats(userId: string) {
    const moods = await this.getMoodEntries(userId, 7);
    const journals = await this.getJournalEntries(userId);
    const goals = await this.getGoals(userId);

    return {
      currentMood: moods.length > 0 ? moods[moods.length - 1].mood : 3,
      journalEntriesThisWeek: journals.filter(j => 
        new Date(j.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      meditationStreak: Math.floor(Math.random() * 7) + 1, // Mock data
      activeGoals: goals.filter(g => !g.completed).length,
      moodTrend: moods.map(m => m.mood)
    };
  }

  // Cleanup - called when demo session ends
  async cleanup(userId: string): Promise<void> {
    try {
      const files = [
        this.getFilePath('conversations', userId),
        this.getFilePath('moods', userId),
        this.getFilePath('journals', userId),
        this.getFilePath('goals', userId)
      ];

      await Promise.all(files.map(async (file) => {
        try {
          await fs.unlink(file);
        } catch {
          // File doesn't exist, ignore
        }
      }));
    } catch (error) {
      console.error('Demo cleanup error:', error);
    }
  }

  // Cleanup all demo data (called on server restart)
  async cleanupAll(): Promise<void> {
    try {
      await fs.rm(DEMO_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, ignore
    }
  }
}

export const demoStorage = new DemoStorage();