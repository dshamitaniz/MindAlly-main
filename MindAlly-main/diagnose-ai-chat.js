const fetch = require('node-fetch');

async function diagnoseAIChat() {
  console.log('🔍 Diagnosing AI Chat Connection Issues...\n');

  // Test 1: Ollama Connection
  console.log('1. Testing Ollama Connection...');
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama is running and accessible');
      console.log(`   Available models: ${data.models?.map(m => m.name).join(', ') || 'None'}`);
    } else {
      console.log('❌ Ollama responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to Ollama:', error.message);
    console.log('   Try: docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama');
  }

  // Test 2: Ollama Chat API
  console.log('\n2. Testing Ollama Chat API...');
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3:latest',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: false
      }),
      timeout: 15000
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama chat API working');
      console.log(`   Response: ${data.message?.content?.substring(0, 50)}...`);
    } else {
      console.log('❌ Ollama chat API error:', response.status);
      const errorText = await response.text();
      console.log('   Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Ollama chat API failed:', error.message);
  }

  // Test 3: Next.js Server
  console.log('\n3. Testing Next.js Server...');
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Next.js server is running');
    } else {
      console.log('❌ Next.js server error:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to Next.js server:', error.message);
    console.log('   Make sure to run: npm run dev');
  }

  // Test 4: AI Chat API Endpoint
  console.log('\n4. Testing AI Chat API Endpoint...');
  try {
    // Create a test user ID and session ID
    const testUserId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
    const testSessionId = `test_${Date.now()}`;
    
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        sessionId: testSessionId,
        userId: testUserId
      }),
      timeout: 30000
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI Chat API working');
      console.log(`   Response: ${data.message?.substring(0, 100)}...`);
    } else {
      const errorData = await response.json();
      console.log('❌ AI Chat API error:', response.status);
      console.log('   Error details:', errorData.error);
      
      if (errorData.troubleshooting) {
        console.log('   Troubleshooting steps:');
        errorData.troubleshooting.forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ AI Chat API failed:', error.message);
  }

  // Test 5: MongoDB Connection
  console.log('\n5. Testing MongoDB Connection...');
  try {
    const response = await fetch('http://localhost:3000/api/health/db', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ MongoDB connection working');
    } else {
      console.log('❌ MongoDB connection error:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot test MongoDB connection:', error.message);
  }

  console.log('\n📋 Diagnosis Summary:');
  console.log('If Ollama is working but AI Chat fails, check:');
  console.log('1. User authentication - make sure you are logged in');
  console.log('2. MongoDB connection - check MONGODB_URI in .env.local');
  console.log('3. Browser console for JavaScript errors');
  console.log('4. Network tab in browser dev tools for failed requests');
  console.log('5. Next.js server logs for detailed error messages');
  
  console.log('\n🔧 Quick Fixes:');
  console.log('1. Restart Next.js: npm run dev');
  console.log('2. Clear browser cache and cookies');
  console.log('3. Check .env.local file for correct settings');
  console.log('4. Ensure MongoDB is running (if using local MongoDB)');
}

// Run the diagnosis
diagnoseAIChat().catch(console.error);