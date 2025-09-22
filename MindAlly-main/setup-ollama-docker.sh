#!/bin/bash

# MindAlly Ollama Docker Setup Script
# This script sets up Ollama with Docker for the MindAlly project

echo "🚀 Setting up Ollama with Docker for MindAlly..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is installed and running"

# Stop and remove existing Ollama container if it exists
echo "🧹 Cleaning up existing Ollama container..."
docker stop ollama 2>/dev/null || true
docker rm ollama 2>/dev/null || true

# Pull and run Ollama container
echo "📦 Pulling and starting Ollama container..."
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  --restart unless-stopped \
  ollama/ollama

# Wait for container to start
echo "⏳ Waiting for Ollama to start..."
sleep 10

# Check if container is running
if ! docker ps | grep -q ollama; then
    echo "❌ Failed to start Ollama container"
    exit 1
fi

echo "✅ Ollama container is running"

# Pull recommended models
echo "📥 Pulling recommended AI models..."

models=("llama3:latest" "mistral:latest" "phi3:latest")

for model in "${models[@]}"; do
    echo "📥 Pulling $model..."
    docker exec ollama ollama pull "$model"
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pulled $model"
    else
        echo "⚠️  Failed to pull $model (continuing...)"
    fi
done

# Test connection
echo "🔍 Testing Ollama connection..."
sleep 5

if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is accessible at http://localhost:11434"
else
    echo "⚠️  Ollama might not be fully ready yet. Try again in a few minutes."
fi

# Display status
echo ""
echo "🎉 Ollama setup complete!"
echo ""
echo "📋 Setup Summary:"
echo "   • Container: ollama"
echo "   • Port: 11434"
echo "   • URL: http://localhost:11434"
echo "   • Models: llama3:latest, mistral:latest, phi3:latest"
echo ""
echo "🔧 Useful Commands:"
echo "   • Check status: docker ps | grep ollama"
echo "   • View logs: docker logs ollama"
echo "   • Stop: docker stop ollama"
echo "   • Start: docker start ollama"
echo "   • Pull model: docker exec ollama ollama pull <model-name>"
echo "   • List models: docker exec ollama ollama list"
echo ""
echo "🌐 For Docker Desktop users:"
echo "   • Use: http://host.docker.internal:11434"
echo ""
echo "🐧 For WSL2 users:"
echo "   • Use: http://172.17.0.1:11434"
echo ""
echo "✨ Your MindAlly app should now be able to connect to Ollama!"