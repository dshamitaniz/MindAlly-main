@echo off
echo Setting up Ollama with Docker for MindAlly...
echo.

echo Step 1: Stopping any existing Ollama container...
docker stop ollama 2>nul
docker rm ollama 2>nul

echo.
echo Step 2: Starting Ollama container...
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

echo.
echo Step 3: Waiting for Ollama to start...
timeout /t 10 /nobreak >nul

echo.
echo Step 4: Pulling Llama3 model (this may take a while)...
docker exec ollama ollama pull llama3:latest

echo.
echo Step 5: Pulling additional recommended models...
docker exec ollama ollama pull llama3.2:3b
docker exec ollama ollama pull phi3:latest

echo.
echo Step 6: Testing connection...
curl -s http://localhost:11434/api/tags

echo.
echo Step 7: Listing available models...
docker exec ollama ollama list

echo.
echo ✅ Setup complete! 
echo.
echo Update your .env.local file with:
echo OLLAMA_BASE_URL=http://localhost:11434
echo OLLAMA_MODEL=llama3:latest
echo.
echo Test the connection by running: node fix-ollama-connection.js
pause