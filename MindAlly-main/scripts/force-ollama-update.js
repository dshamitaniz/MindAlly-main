const { MongoClient } = require('mongodb');

async function forceOllamaUpdate() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('mindally');
    const users = db.collection('users');
    
    // Force update with upsert
    const result = await users.updateMany(
      {},
      {
        $set: {
          'preferences.ai.provider': 'ollama',
          'preferences.ai.ollamaBaseUrl': 'http://localhost:11434',
          'preferences.ai.ollamaModel': 'llama3:latest',
          'preferences.ai.conversationMemory': true
        }
      },
      { upsert: false }
    );
    
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    // Also check current user data
    const user = await users.findOne({});
    console.log('Current user AI settings:', user?.preferences?.ai);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

forceOllamaUpdate();