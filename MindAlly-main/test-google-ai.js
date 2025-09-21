const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGoogleAI() {
  console.log('🔍 Testing Google AI Connection...\n');

  const apiKey = 'AIzaSyBKCqAE9Bbz8lgXrk9wm8hjHD8TU-h-1gA';
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('✅ Google AI client initialized');
    
    const prompt = "Hello, this is a test message for mental health support.";
    console.log('📤 Sending test message...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Google AI response received');
    console.log(`📥 Response: ${text.substring(0, 100)}...`);
    console.log('\n🎉 Google AI is working correctly!');
    
  } catch (error) {
    console.log('❌ Google AI test failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('   The API key appears to be invalid');
    } else if (error.message.includes('quota')) {
      console.log('   API quota may be exceeded');
    } else {
      console.log('   Check your internet connection and API key');
    }
  }
}

testGoogleAI();