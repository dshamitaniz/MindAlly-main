# MindAlly AI Setup Guide

MindAlly supports multiple AI providers for the best user experience. This guide helps you set up AI chat functionality.

## 🚀 Quick Start (5 minutes)

### Option 1: Google AI (Recommended)
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to your `.env.local` file:
   ```env
   GOOGLE_AI_API_KEY=your_api_key_here
   ```
3. Restart the app - AI Chat will work immediately!

### Option 2: Ollama (Local AI)
1. Run the setup script:
   ```bash
   # Linux/Mac
   ./setup-ollama-docker.sh
   
   # Windows
   setup-ollama-docker.bat
   ```
2. Wait for models to download (5-10 minutes)
3. AI Chat will automatically connect!

## 🎯 AI Provider Comparison

| Feature | Google AI | Ollama | OpenAI |
|---------|-----------|---------|---------|
| **Cost** | Free tier available | Completely free | Paid only |
| **Privacy** | Cloud-based | Local/Private | Cloud-based |
| **Speed** | Fast | Moderate | Fast |
| **Setup** | 2 minutes | 10 minutes | 5 minutes |
| **Offline** | No | Yes | No |
| **Models** | Gemini 1.5 Flash | Llama 3, Mistral, Phi-3 | GPT-3.5/4 |

## 🔧 Detailed Setup Instructions

### Google AI Setup
1. **Get API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the generated key

2. **Configure MindAlly:**
   ```env
   # Add to .env.local
   GOOGLE_AI_API_KEY=AIza...your_key_here
   ```

3. **Verify Setup:**
   ```bash
   npm run test-ai
   ```

### Ollama Setup (Docker)
1. **Prerequisites:**
   - Docker Desktop installed
   - 8GB+ RAM available
   - 10GB+ disk space

2. **Automatic Setup:**
   ```bash
   # Run setup script
   ./setup-ollama-docker.sh    # Linux/Mac
   setup-ollama-docker.bat     # Windows
   ```

3. **Manual Setup:**
   ```bash
   # Start Ollama container
   docker run -d --name ollama -p 11434:11434 -v ollama:/root/.ollama ollama/ollama
   
   # Pull AI models
   docker exec ollama ollama pull llama3:latest
   docker exec ollama ollama pull mistral:latest
   docker exec ollama ollama pull phi3:latest
   ```

4. **Test Connection:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

### OpenAI Setup (Optional)
1. **Get API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create new API key

2. **Configure:**
   ```env
   OPENAI_API_KEY=sk-...your_key_here
   ```

## 🎮 Using AI Chat

### Switching Providers
1. Open AI Chat in MindAlly
2. Click the Settings (⚙️) icon
3. Select your preferred AI Provider:
   - **Google AI**: Fast, reliable, free tier
   - **Ollama**: Private, local, completely free
   - **OpenAI**: Premium, requires paid account

4. Click "Save AI Settings"

### Features
- **Crisis Detection**: Automatically detects mental health emergencies
- **Conversation Memory**: Remembers context across sessions
- **Voice Output**: Text-to-speech in 100+ languages
- **Cultural Sensitivity**: Designed for Indian youth mental health
- **Professional Guidelines**: Follows mental health best practices

## 🛠️ Troubleshooting

### Common Issues

#### "Cannot connect to Ollama"
```bash
# Check if container is running
docker ps | grep ollama

# Start if stopped
docker start ollama

# Or recreate
docker run -d --name ollama -p 11434:11434 -v ollama:/root/.ollama ollama/ollama
```

#### "Google AI API error"
- Verify API key is correct
- Check you haven't exceeded free tier limits
- Ensure API key has proper permissions

#### "Model not found"
```bash
# Pull missing models
docker exec ollama ollama pull llama3:latest
docker exec ollama ollama list  # Check available models
```

### Test Your Setup
```bash
# Test all AI connections
npm run test-ai

# Test specific provider
curl http://localhost:11434/api/tags  # Ollama
```

### Docker Issues
```bash
# View logs
docker logs ollama

# Restart container
docker restart ollama

# Complete reset
docker stop ollama && docker rm ollama && docker volume rm ollama
./setup-ollama-docker.sh  # Run setup again
```

## 🔄 Automatic Fallback

MindAlly automatically switches between providers:

1. **Primary**: Your selected provider
2. **Fallback**: If primary fails, switches to available alternative
3. **Graceful**: Users always get responses, even if one provider is down

Example flow:
- User selects Ollama → Ollama fails → Auto-switch to Google AI
- User gets response without knowing about the switch
- Next request tries Ollama again

## 📊 Performance Tips

### For Best Performance:
- **Development**: Use Ollama (local, fast iteration)
- **Production**: Use Google AI (reliable, scalable)
- **Privacy-focused**: Use Ollama only
- **Cost-sensitive**: Use Google AI free tier

### Model Selection:
- **Llama 3**: Best overall quality (4.7GB)
- **Mistral**: Good reasoning (4.4GB)  
- **Phi-3**: Fastest, smallest (2.2GB)

### Resource Management:
```bash
# Check Docker resources
docker stats ollama

# Increase Docker memory (Docker Desktop → Settings → Resources)
# Recommended: 8GB RAM, 4 CPU cores
```

## 🔐 Security & Privacy

### Data Handling:
- **Google AI**: Conversations sent to Google servers
- **Ollama**: Everything stays on your machine
- **OpenAI**: Conversations sent to OpenAI servers

### Best Practices:
- Use Ollama for sensitive conversations
- Regularly update AI models
- Monitor API usage and costs
- Enable conversation memory only if needed

## 🆘 Getting Help

### Quick Diagnostics:
```bash
# Test everything
npm run test-ai

# Check environment
echo $GOOGLE_AI_API_KEY
docker ps | grep ollama
```

### Support Resources:
- 📖 [Full Troubleshooting Guide](./AI_TROUBLESHOOTING.md)
- 🐛 [GitHub Issues](https://github.com/yourusername/mindally/issues)
- 📧 Create issue with error logs and system info

### Community:
- Share your setup experience
- Help others with similar issues
- Contribute improvements to AI integration

---

**Remember**: MindAlly's AI is designed to provide mental health support following professional guidelines. The AI will automatically detect crisis situations and provide appropriate resources and helpline numbers.