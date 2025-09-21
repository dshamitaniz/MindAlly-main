# Ollama Docker Setup Guide

## Quick Setup

### 1. Run Ollama in Docker
```bash
# Pull and run Ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull a model (required)
docker exec ollama ollama pull llama3.1
```

### 2. Test Connection
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags
```

## Common Connection Issues & Solutions

### Issue 1: "Connection refused" or "Cannot connect"

**For Docker Desktop (Windows/Mac):**
- Use: `http://host.docker.internal:11434`
- This allows containers to access host services

**For Linux/WSL2:**
- Use: `http://172.17.0.1:11434` (Docker bridge IP)
- Or find Docker bridge IP: `docker network inspect bridge`

**For Docker Compose:**
- Use service name: `http://ollama:11434`
- Ensure both services are in same network

### Issue 2: "No models found"

```bash
# Pull required models
docker exec ollama ollama pull llama3.1
docker exec ollama ollama pull llama3.2:3b
docker exec ollama ollama pull gemma2:2b

# List available models
docker exec ollama ollama list
```

### Issue 3: Container not running

```bash
# Check container status
docker ps -a | grep ollama

# Start if stopped
docker start ollama

# Check logs for errors
docker logs ollama
```

## Docker Compose Setup

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

## Environment Variables

Add to `.env.local`:

```env
# For Docker Desktop
OLLAMA_BASE_URL=http://host.docker.internal:11434

# For Linux/WSL2
OLLAMA_BASE_URL=http://172.17.0.1:11434

# For Docker Compose
OLLAMA_BASE_URL=http://ollama:11434
```

## Verification Commands

```bash
# 1. Check container is running
docker ps | grep ollama

# 2. Test API endpoint
curl http://localhost:11434/api/tags

# 3. Test model generation
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Hello",
  "stream": false
}'

# 4. List available models
curl http://localhost:11434/api/tags | jq '.models[].name'
```

## Troubleshooting Network Issues

### Find Docker Bridge IP
```bash
# Get Docker bridge network IP
docker network inspect bridge | grep Gateway

# Or use this one-liner
docker network inspect bridge | jq -r '.[0].IPAM.Config[0].Gateway'
```

### Test from inside container
```bash
# Run test container
docker run --rm -it alpine/curl sh

# Test connection from inside Docker network
curl http://172.17.0.1:11434/api/tags
```

### Windows-specific issues
```bash
# Enable Docker Desktop integration with WSL2
# In Docker Desktop: Settings > Resources > WSL Integration

# Use Windows host IP from WSL2
ip route show | grep -i default | awk '{ print $3}'
```

## Performance Optimization

### GPU Support (NVIDIA)
```bash
# Install nvidia-container-toolkit first
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### Memory Limits
```bash
# Limit memory usage
docker run -d -v ollama:/root/.ollama -p 11434:11434 --memory=4g --name ollama ollama/ollama
```

## Common URLs by Environment

| Environment | URL | Description |
|-------------|-----|-------------|
| Native Ollama | `http://localhost:11434` | Direct installation |
| Docker Desktop | `http://host.docker.internal:11434` | Windows/Mac |
| Docker Linux | `http://172.17.0.1:11434` | Linux/WSL2 |
| Docker Compose | `http://ollama:11434` | Service name |
| Remote Docker | `http://YOUR_SERVER_IP:11434` | Remote server |

## Security Notes

- Ollama runs without authentication by default
- For production, consider adding reverse proxy with auth
- Bind to localhost only: `-p 127.0.0.1:11434:11434`
- Use Docker networks for service-to-service communication