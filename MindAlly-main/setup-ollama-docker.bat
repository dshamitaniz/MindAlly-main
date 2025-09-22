@echo off
REM MindAlly Ollama Docker Setup Script for Windows
REM This script sets up Ollama with Docker for the MindAlly project

echo 🚀 Setting up Ollama with Docker for MindAlly...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running

REM Stop and remove existing Ollama container if it exists
echo 🧹 Cleaning up existing Ollama container...
docker stop ollama >nul 2>&1
docker rm ollama >nul 2>&1

REM Pull and run Ollama container
echo 📦 Pulling and starting Ollama container...
docker run -d --name ollama -p 11434:11434 -v ollama:/root/.ollama --restart unless-stopped ollama/ollama

REM Wait for container to start
echo ⏳ Waiting for Ollama to start...
timeout /t 10 /nobreak >nul

REM Check if container is running
docker ps | findstr ollama >nul
if %errorlevel% neq 0 (
    echo ❌ Failed to start Ollama container
    pause
    exit /b 1
)

echo ✅ Ollama container is running

REM Pull recommended models
echo 📥 Pulling recommended AI models...

echo 📥 Pulling llama3:latest...
docker exec ollama ollama pull llama3:latest
if %errorlevel% equ 0 (
    echo ✅ Successfully pulled llama3:latest
) else (
    echo ⚠️  Failed to pull llama3:latest ^(continuing...^)
)

echo 📥 Pulling mistral:latest...
docker exec ollama ollama pull mistral:latest
if %errorlevel% equ 0 (
    echo ✅ Successfully pulled mistral:latest
) else (
    echo ⚠️  Failed to pull mistral:latest ^(continuing...^)
)

echo 📥 Pulling phi3:latest...
docker exec ollama ollama pull phi3:latest
if %errorlevel% equ 0 (
    echo ✅ Successfully pulled phi3:latest
) else (
    echo ⚠️  Failed to pull phi3:latest ^(continuing...^)
)

REM Test connection
echo 🔍 Testing Ollama connection...
timeout /t 5 /nobreak >nul

curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ollama is accessible at http://localhost:11434
) else (
    echo ⚠️  Ollama might not be fully ready yet. Try again in a few minutes.
)

REM Display status
echo.
echo 🎉 Ollama setup complete!
echo.
echo 📋 Setup Summary:
echo    • Container: ollama
echo    • Port: 11434
echo    • URL: http://localhost:11434
echo    • Models: llama3:latest, mistral:latest, phi3:latest
echo.
echo 🔧 Useful Commands:
echo    • Check status: docker ps ^| findstr ollama
echo    • View logs: docker logs ollama
echo    • Stop: docker stop ollama
echo    • Start: docker start ollama
echo    • Pull model: docker exec ollama ollama pull ^<model-name^>
echo    • List models: docker exec ollama ollama list
echo.
echo 🌐 For Docker Desktop users:
echo    • Use: http://host.docker.internal:11434
echo.
echo 🐧 For WSL2 users:
echo    • Use: http://172.17.0.1:11434
echo.
echo ✨ Your MindAlly app should now be able to connect to Ollama!
echo.
pause