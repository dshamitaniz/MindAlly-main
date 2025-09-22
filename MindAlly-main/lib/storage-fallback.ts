import { demoStorage } from './demo-storage';
import connectDB from './mongodb';

let mongoStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
let lastCheck = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

export async function checkMongoConnection(): Promise<boolean> {
  // Always use JSON storage in production - no MongoDB
  mongoStatus = 'disconnected';
  return false;
}

export function getStorageStatus(): 'mongodb' | 'fallback' | 'demo' {
  return 'fallback'; // Always use JSON file storage
}

export function isUsingFallbackStorage(): boolean {
  return true; // Always use JSON file storage
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