import { demoStorage } from './demo-storage';

const DEMO_CREDENTIALS = {
  email: 'demo@mindally.com',
  password: 'demo123',
  name: 'Demo User'
};

export async function authenticateDemo(email: string, password: string) {
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    // Check if demo user exists
    let user = await demoStorage.findUser(email);
    
    if (!user) {
      // Create demo user
      user = await demoStorage.createUser({
        email: DEMO_CREDENTIALS.email,
        name: DEMO_CREDENTIALS.name,
        preferences: {
          ai: {
            provider: process.env.GOOGLE_AI_API_KEY ? 'google' : 'ollama',
            conversationMemory: true,
            ollamaBaseUrl: 'http://localhost:11434',
            ollamaModel: 'llama3:latest'
          }
        }
      });
    }
    
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      isDemo: true
    };
  }
  
  return null;
}