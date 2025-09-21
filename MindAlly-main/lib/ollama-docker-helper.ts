// Helper functions for Ollama Docker connectivity

export const OLLAMA_DOCKER_CONFIGS = {
  // Common Docker configurations
  localhost: 'http://localhost:11434',
  dockerDesktop: 'http://host.docker.internal:11434',
  dockerCompose: 'http://ollama:11434',
  wsl: 'http://172.17.0.1:11434',
  // Add more as needed
} as const;

export async function testOllamaConnection(baseUrl: string): Promise<{
  success: boolean;
  error?: string;
  models?: string[];
}> {
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
    const models = data.models?.map((m: any) => m.name) || [];

    return {
      success: true,
      models,
    };
  } catch (error) {
    if (error instanceof Error) {
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
    return {
      success: false,
      error: 'Unknown connection error',
    };
  }
}

export function getDockerTroubleshootingSteps(): string[] {
  return [
    '1. Ensure Ollama is running: docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama',
    '2. Check if container is running: docker ps | grep ollama',
    '3. For Docker Desktop on Windows/Mac, try: http://host.docker.internal:11434',
    '4. For WSL2, try: http://172.17.0.1:11434',
    '5. For Docker Compose, use service name: http://ollama:11434',
    '6. Verify port mapping: docker port ollama',
    '7. Check container logs: docker logs ollama',
  ];
}

export function detectDockerEnvironment(): string {
  if (typeof window === 'undefined') return 'server';
  
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'windows';
  if (userAgent.includes('Mac')) return 'mac';
  if (userAgent.includes('Linux')) return 'linux';
  
  return 'unknown';
}

export function getSuggestedUrls(): { url: string; description: string }[] {
  const env = detectDockerEnvironment();
  
  const suggestions = [
    { url: 'http://localhost:11434', description: 'Standard localhost (native Ollama)' },
    { url: 'http://host.docker.internal:11434', description: 'Docker Desktop (Windows/Mac)' },
    { url: 'http://172.17.0.1:11434', description: 'Docker default bridge (Linux/WSL2)' },
    { url: 'http://ollama:11434', description: 'Docker Compose service name' },
  ];

  // Prioritize based on environment
  if (env === 'windows' || env === 'mac') {
    return [suggestions[1], suggestions[0], suggestions[2], suggestions[3]];
  }
  
  return suggestions;
}