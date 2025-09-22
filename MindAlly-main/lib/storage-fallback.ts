import { demoStorage } from './demo-storage';
import connectDB from './mongodb';

let mongoStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
let lastCheck = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

export async function checkMongoConnection(): Promise<boolean> {
  const now = Date.now();
  
  // Don't check too frequently
  if (now - lastCheck < CHECK_INTERVAL && mongoStatus !== 'checking') {
    return mongoStatus === 'connected';
  }
  
  lastCheck = now;
  mongoStatus = 'checking';
  
  try {
    await connectDB();
    mongoStatus = 'connected';
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed, using fallback storage:', error);
    mongoStatus = 'disconnected';
    return false;
  }
}

export function getStorageStatus(): 'mongodb' | 'fallback' | 'demo' {
  if (mongoStatus === 'connected') return 'mongodb';
  if (mongoStatus === 'disconnected') return 'fallback';
  return 'fallback'; // Default to fallback during checking
}

export function isUsingFallbackStorage(): boolean {
  return mongoStatus === 'disconnected';
}

// Extended demo storage for fallback users
class FallbackStorage extends demoStorage.constructor {
  async createFallbackUser(userData: any) {
    const fallbackUser = {
      _id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      name: userData.name,
      preferences: userData.preferences || {
        ai: {
          provider: process.env.GOOGLE_AI_API_KEY ? 'google' : 'ollama',
          conversationMemory: true,
          ollamaBaseUrl: 'http://localhost:11434',
          ollamaModel: 'llama3:latest'
        }
      },
      createdAt: new Date(),
      isFallback: true
    };
    
    return await this.createUser(fallbackUser);
  }
  
  async findFallbackUser(email: string) {
    const filePath = this.getFilePath('users');
    const users = await this.readFile(filePath) || [];
    return users.find((u: any) => u.email === email && u.isFallback) || null;
  }
}

export const fallbackStorage = new FallbackStorage();