# MindAlly AI Chat Troubleshooting Guide

This guide helps you resolve common issues with AI Chat functionality in MindAlly.

## 🚀 Quick Setup

### Option 1: Ollama with Docker (Recommended)
```bash
# Run the setup script
./setup-ollama-docker.sh    # Linux/Mac
setup-ollama-docker.bat     # Windows

# Or manually:
docker run -d --name ollama -p 11434:11434 -v ollama:/root/.ollama ollama/ollama
docker exec ollama ollama pull llama3:latest
```

### Option 2: Google AI
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to environment variables:
   ```env
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

## 🔧 Common Issues & Solutions

### 1. "Cannot connect to Ollama" Error

**Symptoms:**
- Error: "Cannot connect to Ollama at http://localhost:11434"
- AI Chat shows connection failed

**Solutions:**

#### Check if Ollama is running:
```bash
# Check Docker container
docker ps | grep ollama

# If not running, start it:
docker start ollama

# Or create new container:
docker run -d --name ollama -p 11434:11434 -v ollama:/root/.ollama ollama/ollama
```

#### Test connection manually:
```bash
# Test API endpoint
curl http://localhost:11434/api/tags

# Should return JSON with available models
```

#### Docker networking issues:
Try different URLs in MindAlly settings:
- `http://localhost:11434` (default)
- `http://host.docker.internal:11434` (Docker Desktop)
- `http://172.17.0.1:11434` (WSL2/Linux)

### 2. "Model not found" Error

**Symptoms:**
- Error: "Model 'llama3:latest' not found"
- Chat works but no response generated

**Solutions:**

#### Pull the required model:
```bash
# Pull Llama 3 (recommended)
docker exec ollama ollama pull llama3:latest

# Or try other models:
docker exec ollama ollama pull mistral:latest
docker exec ollama ollama pull phi3:latest
```

#### Check available models:
```bash
docker exec ollama ollama list
```

### 3. Google AI API Issues

**Symptoms:**
- "Google AI not configured" error
- "Invalid API key" error

**Solutions:**

#### Verify API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or copy your API key
3. Add to `.env.local`:
   ```env
   GOOGLE_AI_API_KEY=AIza...your_key_here
   ```
4. Restart the application

#### Check API quotas:
- Ensure you haven't exceeded free tier limits
- Check [Google Cloud Console](https://console.cloud.google.com/) for quota usage

### 4. Slow Response Times

**Symptoms:**
- AI takes 30+ seconds to respond
- Timeout errors

**Solutions:**

#### For Ollama:
- Use smaller models: `phi3:latest` instead of `llama3:latest`
- Increase system resources (RAM/CPU)
- Check Docker resource limits

#### For Google AI:
- Check internet connection
- Verify API key is valid
- Try switching to Ollama for faster local responses

### 5. Memory/Performance Issues

**Symptoms:**
- System becomes slow when using AI
- Docker container crashes
- Out of memory errors

**Solutions:**

#### Increase Docker resources:
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to 8GB+ and CPU to 4+ cores
4. Restart Docker

#### Use lighter models:
```bash
# Instead of llama3:latest (4.7GB), use:
docker exec ollama ollama pull phi3:latest  # 2.2GB
```

## 🛠️ Advanced Troubleshooting

### Check Application Logs

#### Browser Console:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for AI-related errors

#### Server Logs:
```bash
# If running with npm
npm run dev

# Check for errors in terminal output
```

### Reset AI Configuration

#### Clear browser data:
1. Open Developer Tools (F12)
2. Go to Application → Storage
3. Clear Local Storage and Session Storage

#### Reset user preferences:
```javascript
// In browser console:
localStorage.removeItem('mindally-ai-settings');
```

### Docker Troubleshooting

#### View Ollama logs:
```bash
docker logs ollama
```

#### Restart Ollama container:
```bash
docker restart ollama
```

#### Complete reset:
```bash
docker stop ollama
docker rm ollama
docker volume rm ollama
# Then run setup script again
```

## 🔄 Provider Switching

MindAlly automatically falls back between providers:

1. **Primary**: Your selected provider (Ollama/Google AI)
2. **Fallback**: If primary fails, switches to available alternative
3. **Manual**: Change in Chat Settings → AI Provider

### Switching to Google AI:
1. Open AI Chat
2. Click Settings (gear icon)
3. Change "AI Provider" to "Google AI"
4. Add your API key if needed
5. Click "Save AI Settings"

### Switching to Ollama:
1. Ensure Ollama is running (see setup above)
2. Open AI Chat Settings
3. Change "AI Provider" to "Ollama"
4. Set correct Base URL
5. Select model
6. Click "Save AI Settings"

## 📞 Getting Help

### Check System Status:
```bash
# Test Ollama
curl http://localhost:11434/api/tags

# Test Google AI (replace YOUR_KEY)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY"
```

### Environment Check:
```bash
# Check environment variables
echo $GOOGLE_AI_API_KEY
echo $OLLAMA_BASE_URL

# Check Docker
docker --version
docker ps | grep ollama
```

### Still having issues?
1. Check the [GitHub Issues](https://github.com/yourusername/mindally/issues)
2. Create a new issue with:
   - Operating system
   - Docker version
   - Error messages
   - Steps to reproduce
   - Browser console logs

## 🎯 Best Practices

### For Development:
- Use Ollama for offline development
- Keep Google AI as backup
- Test both providers regularly

### For Production:
- Use Google AI for reliability
- Set up proper error handling
- Monitor API usage and costs

### For Performance:
- Use appropriate model sizes
- Implement response caching
- Set reasonable timeouts

---

**Remember**: MindAlly is designed to work with both providers seamlessly. The app will automatically handle failures and switch between providers to ensure users always have access to mental health support.