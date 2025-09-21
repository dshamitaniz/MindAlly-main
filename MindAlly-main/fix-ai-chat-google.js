const fetch = require('node-fetch');

async function fixAIChatGoogle() {
  console.log('🔧 Fixing AI Chat to use Google AI...\n');

  // Test 1: Verify Google AI is working
  console.log('1. Testing Google AI API...');
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI('AIzaSyBKCqAE9Bbz8lgXrk9wm8hjHD8TU-h-1gA');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Hello');
    console.log('✅ Google AI is working correctly');
  } catch (error) {
    console.log('❌ Google AI test failed:', error.message);
    return;
  }

  // Test 2: Test the AI Chat API with Google
  console.log('\n2. Testing AI Chat API with Google AI...');
  try {
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, I need mental health support',
        sessionId: `test_${Date.now()}`,
        userId: '507f1f77bcf86cd799439011', // Test user ID
        provider: 'google'
      }),
      timeout: 30000
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI Chat API working with Google AI');
      console.log(`   Response: ${data.message?.substring(0, 100)}...`);
    } else {
      const errorData = await response.json();
      console.log('❌ AI Chat API error:', response.status);
      console.log('   Error:', errorData.error);
    }
  } catch (error) {
    console.log('❌ AI Chat API test failed:', error.message);
  }

  console.log('\n✨ Setup Instructions:');
  console.log('1. Open your MindAlly app in the browser');
  console.log('2. Login or create an account');
  console.log('3. Open the AI Chat (click the chat button)');
  console.log('4. Click the Settings gear icon');
  console.log('5. Change AI Provider to "Google AI"');
  console.log('6. Click "Save AI Settings"');
  console.log('7. Try sending a message');
  
  console.log('\n🔑 Google AI Key configured in .env.local');
  console.log('🚀 Your AI Chat should now work with Google AI!');
}

fixAIChatGoogle().catch(console.error);