// Test Ollama connection
async function testOllama() {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3:latest',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: false
      })
    });
    
    const data = await response.json();
    console.log('✅ Ollama connection successful!');
    console.log('Response:', data.message.content);
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

testOllama();