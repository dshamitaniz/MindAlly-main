# Ollama Connection Troubleshooting Guide

## Quick Fix Steps

### 1. Run the Automated Setup
```bash
# Windows
setup-ollama-docker.bat

# Or manually test connections
node fix-ollama-connection.js
```

### 2. Manual Docker Setup
```bash
# Stop any existing Ollama container
docker stop ollama && docker rm ollama

# Start fresh Ollama container
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Wait for startup (10 seconds)
timeout 10

# Pull the Llama3 model
docker exec ollama ollama pull llama3:latest

# Test connection
curl http://localhost:11434/api/tags
```

## Common Connection Issues

### Issue 1: "Connection refused" or "ECONNREFUSED"

**Cause**: Ollama container is not running or wrong URL

**Solutions**:
1. Check if container is running:
   ```bash
   docker ps | grep ollama
   ```

2. Start the container if stopped:
   ```bash
   docker start ollama
   ```

3. Try alternative URLs in your `.env.local`:
   ```env
   # For Docker Desktop (Windows/Mac)
   OLLAMA_BASE_URL=http://host.docker.internal:11434
   
   # For Linux/WSL2
   OLLAMA_BASE_URL=http://172.17.0.1:11434
   
   # For Docker Compose
   OLLAMA_BASE_URL=http://ollama:11434
   ```

### Issue 2: "Model not found" or "No models available"

**Cause**: Llama3 model not pulled

**Solution**:
```bash
# Pull the model
docker exec ollama ollama pull llama3:latest

# Verify models are available
docker exec ollama ollama list

# Test with a simple prompt
curl http://localhost:11434/api/generate -d '{
  "model": "llama3:latest",
  "prompt": "Hello",
  "stream": false
}'
```

### Issue 3: "Request timeout" or slow responses

**Cause**: Insufficient resources or model loading

**Solutions**:
1. Increase Docker memory limit:
   ```bash
   docker update --memory=4g ollama
   ```

2. Use a smaller model:
   ```bash
   docker exec ollama ollama pull llama3.2:3b
   ```
   Then update `.env.local`:
   ```env
   OLLAMA_MODEL=llama3.2:3b
   ```

### Issue 4: "User not found" or AI settings errors

**Cause**: User preferences not properly initialized

**Solution**:
1. Clear browser storage and re-login
2. Check MongoDB connection
3. Verify user exists in database

## Environment-Specific Solutions

### Windows with Docker Desktop
```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Linux/WSL2
```env
OLLAMA_BASE_URL=http://172.17.0.1:11434
```

### Docker Compose Setup
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    restart: unless-stopped
    
  mindally:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama

volumes:
  ollama:
```

## Testing Commands

### Test Ollama API
```bash
# Check if Ollama is responding
curl http://localhost:11434/api/tags

# Test chat functionality
curl http://localhost:11434/api/chat -d '{
  "model": "llama3:latest",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}'
```

### Test from MindAlly
```bash
# Run the connection test
node fix-ollama-connection.js

# Test the old way
node test-ollama.js
```

## Advanced Troubleshooting

### Find Docker Network IP
```bash
# Get Docker bridge IP
docker network inspect bridge | grep Gateway

# Test from inside Docker network
docker run --rm -it alpine/curl curl http://172.17.0.1:11434/api/tags
```

### Check Container Logs
```bash
# View Ollama logs
docker logs ollama

# Follow logs in real-time
docker logs -f ollama
```

### Resource Monitoring
```bash
# Check container resource usage
docker stats ollama

# Check available disk space
docker system df
```

## Performance Optimization

### GPU Support (if available)
```bash
# Install nvidia-container-toolkit first
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### Memory Optimization
```bash
# Limit memory usage
docker run -d -v ollama:/root/.ollama -p 11434:11434 --memory=4g --name ollama ollama/ollama
```

### Model Selection
- `llama3:latest` (4.7GB) - Best quality, slower
- `llama3.2:3b` (2.0GB) - Good balance
- `phi3:latest` (2.2GB) - Fastest, smaller

## Still Having Issues?

1. **Check the MindAlly logs**: Look at browser console and server logs
2. **Verify Docker installation**: `docker --version`
3. **Check port conflicts**: `netstat -an | findstr 11434`
4. **Try a different model**: Switch to `phi3:latest` for testing
5. **Use Google AI instead**: Configure Google AI API key as fallback

## Quick Recovery Commands

```bash
# Nuclear option - complete reset
docker stop ollama && docker rm ollama
docker volume rm ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
docker exec ollama ollama pull llama3:latest

# Test everything is working
node fix-ollama-connection.js
```