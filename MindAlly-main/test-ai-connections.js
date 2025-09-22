#!/usr/bin/env node

// MindAlly AI Connection Test Script
// Tests both Ollama and Google AI connections

const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing MindAlly AI Connections...\n');

// Test Ollama Connection
async function testOllama() {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  console.log(`🦙 Testing Ollama at ${ollamaUrl}...`);
  
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama is running');
      console.log(`   Available models: ${data.models?.map(m => m.name).join(', ') || 'None'}`);
      return true;
    } else {
      console.log(`❌ Ollama responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to Ollama: ${error.message}`);
    console.log('   💡 Try running: docker run -d --name ollama -p 11434:11434 ollama/ollama');
    return false;
  }
}

// Test Google AI Connection
async function testGoogleAI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  console.log('\n🤖 Testing Google AI...');
  
  if (!apiKey) {
    console.log('❌ GOOGLE_AI_API_KEY not found in environment');
    console.log('   💡 Get your key from: https://makersuite.google.com/app/apikey');
    return false;
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, this is a test.' }] }]
        })
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Google AI is working');
      console.log(`   Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50)}...`);
      return true;
    } else {
      const errorData = await response.json();
      console.log(`❌ Google AI error: ${errorData.error?.message || response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Google AI connection failed: ${error.message}`);
    return false;
  }
}

// Test AI Chat Endpoint
async function testAIChatEndpoint() {
  console.log('\n🔗 Testing AI Chat API endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, this is a test message.',
        sessionId: 'test-session',
        userId: 'test-user'
      })
    });
    
    if (response.ok) {
      console.log('✅ AI Chat endpoint is working');
      return true;
    } else {
      console.log(`❌ AI Chat endpoint error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cannot reach AI Chat endpoint: ${error.message}`);
    console.log('   💡 Make sure the Next.js app is running: npm run dev');
    return false;
  }
}

// Main test function
async function runTests() {
  const results = {
    ollama: await testOllama(),
    googleAI: await testGoogleAI(),
    endpoint: await testAIChatEndpoint()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Ollama: ${results.ollama ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Google AI: ${results.googleAI ? '✅ Working' : '❌ Failed'}`);
  console.log(`   API Endpoint: ${results.endpoint ? '✅ Working' : '❌ Failed'}`);
  
  if (results.ollama || results.googleAI) {
    console.log('\n🎉 At least one AI provider is working! MindAlly should function properly.');
  } else {
    console.log('\n⚠️  No AI providers are working. Please check your configuration.');
    console.log('\n🔧 Quick fixes:');
    console.log('   • For Ollama: Run ./setup-ollama-docker.sh');
    console.log('   • For Google AI: Add GOOGLE_AI_API_KEY to .env.local');
  }
  
  console.log('\n📚 For detailed troubleshooting, see: AI_TROUBLESHOOTING.md');
}

// Add fetch polyfill for older Node.js versions
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the tests
runTests().catch(console.error);