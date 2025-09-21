// Import the helper functions
const { testOllamaConnection, getSuggestedUrls } = (() => {
  try {
    return require('./lib/ollama-docker-helper.ts');
  } catch {
    // Fallback implementation if TypeScript file can't be required
    return {
      testOllamaConnection: async (url) => {
        try {
          const response = await fetch(`${url}/api/tags`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          return { success: true, models: data.models?.map(m => m.name) || [] };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      getSuggestedUrls: () => [
        { url: 'http://localhost:11434', description: 'Standard localhost' },
        { url: 'http://host.docker.internal:11434', description: 'Docker Desktop' },
        { url: 'http://172.17.0.1:11434', description: 'Docker Linux/WSL2' }
      ]
    };
  }
})();

async function testConnection() {
  console.log('Testing Ollama connection...');
  
  const result = await testOllamaConnection('http://localhost:11434');
  
  if (result.success) {
    console.log('✅ Connection successful!');
    console.log('Available models:', result.models);
  } else {
    console.log('❌ Connection failed:', result.error);
  }
}

testConnection();