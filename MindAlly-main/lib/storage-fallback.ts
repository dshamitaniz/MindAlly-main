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
class FallbackStorage {
  // Inherit all methods from demoStorage
  async findConversation(userId: string, sessionId: string) {
    return await demoStorage.findConversation(userId, sessionId);
  }
  
  async saveConversation(conversation: any) {
    return await demoStorage.saveConversation(conversation);
  }
  
  async deleteConversation(userId: string, sessionId: string) {
    return await demoStorage.deleteConversation(userId, sessionId);
  }
  
  async findUser(email: string) {
    return await demoStorage.findUser(email);
  }
  
  async createUser(userData: any) {
    return await demoStorage.createUser(userData);
  }
  
  async updateUser(userId: string, updates: any) {
    return await demoStorage.updateUser(userId, updates);
  }
  
  async cleanup(userId: string) {
    return await demoStorage.cleanup(userId);
  }
}

export const fallbackStorage = new FallbackStorage();