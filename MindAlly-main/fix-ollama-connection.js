#!/usr/bin/env node

// Helper functions for testing Ollama connections
const testOllamaConnection = async (baseUrl) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const models = data.models?.map((m) => m.name) || [];

    return {
      success: true,
      models,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Connection timeout - Ollama may not be running or accessible',
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
};

const getSuggestedUrls = () => [
  { url: 'http://localhost:11434', description: 'Standard localhost (native Ollama)' },
  { url: 'http://host.docker.internal:11434', description: 'Docker Desktop (Windows/Mac)' },
  { url: 'http://172.17.0.1:11434', description: 'Docker default bridge (Linux/WSL2)' },
  { url: 'http://ollama:11434', description: 'Docker Compose service name' },
];

async function testAllConnections() {
  console.log('🔍 Testing Ollama connections...\n');
  
  const urls = getSuggestedUrls();
  let workingUrl = null;
  
  for (const { url, description } of urls) {
    console.log(`Testing ${url} (${description})...`);
    
    const result = await testOllamaConnection(url);
    
    if (result.success) {
      console.log(`✅ SUCCESS: ${url}`);
      console.log(`   Models available: ${result.models?.length || 0}`);
      if (result.models?.length > 0) {
        console.log(`   Models: ${result.models.join(', ')}`);
      }
      workingUrl = url;
      break;
    } else {
      console.log(`❌ FAILED: ${result.error}`);
    }
    console.log('');
  }
  
  if (workingUrl) {
    console.log(`\n🎉 Found working Ollama connection: ${workingUrl}`);
    console.log('\n📝 Update your .env.local file:');
    console.log(`OLLAMA_BASE_URL=${workingUrl}`);
    
    // Test chat functionality
    console.log('\n🧪 Testing chat functionality...');
    await testChat(workingUrl);
  } else {
    console.log('\n❌ No working Ollama connection found.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Ensure Ollama is running in Docker:');
    console.log('   docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama');
    console.log('2. Pull the Llama3 model:');
    console.log('   docker exec ollama ollama pull llama3:latest');
    console.log('3. Check container status:');
    console.log('   docker ps | grep ollama');
    console.log('4. Check container logs:');
    console.log('   docker logs ollama');
  }
}

async function testChat(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3:latest',
        messages: [{ role: 'user', content: 'Hello, can you help with mental health support?' }],
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Chat test successful!');
    console.log(`Response: ${data.message?.content?.substring(0, 100)}...`);
  } catch (error) {
    console.log(`❌ Chat test failed: ${error.message}`);
    
    if (error.message.includes('model')) {
      console.log('\n💡 Tip: Pull the Llama3 model:');
      console.log('   docker exec ollama ollama pull llama3:latest');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAllConnections().catch(console.error);
}

module.exports = { testAllConnections, testOllamaConnection, getSuggestedUrls };