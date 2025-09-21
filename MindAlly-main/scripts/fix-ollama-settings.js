// Quick script to set default Ollama settings for all users
const { MongoClient } = require('mongodb');

async function fixOllamaSettings() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('mindally');
    const usersCollection = db.collection('users');
    
    // First check if users exist
    const userCount = await usersCollection.countDocuments();
    console.log(`Found ${userCount} users in database`);
    
    if (userCount === 0) {
      console.log('No users found. You need to register a user first.');
      return;
    }
    
    // Update all users to have default Ollama settings
    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          'preferences.ai.provider': 'ollama',
          'preferences.ai.ollamaBaseUrl': 'http://localhost:11434',
          'preferences.ai.ollamaModel': 'llama3:latest',
          'preferences.ai.conversationMemory': true
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} users with Ollama settings`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixOllamaSettings();