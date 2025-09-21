import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GenerateResponseOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  options?: Record<string, any>;
}

interface GenerateResponseResult {
  content: string;
  model: string;
  tokens: number;
  latency: number;
}

export class OllamaAIService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string, defaultModel: string = 'llama3:latest') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async generateResponse(messages: ChatMessage[], systemPrompt?: string): Promise<GenerateResponseResult> {
    const startTime = Date.now();
    const formattedMessages = OllamaAIService.formatMessages(messages, systemPrompt);

    try {
      // Test connection first
      await this.testConnection();
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: formattedMessages,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(`Ollama connection failed: ${errorMessage}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const latency = endTime - startTime;

      return {
        content: data.message?.content || 'No response generated',
        model: data.model || this.defaultModel,
        tokens: data.total_duration ? Math.round(data.total_duration / 1000000) : 0,
        latency,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Ollama request timed out. Check if Ollama is running and accessible.');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Cannot connect to Ollama. Check URL and ensure Ollama is running.');
        }
      }
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Ensure Ollama is running and accessible.`);
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }

  static formatMessages(messages: ChatMessage[], systemPrompt?: string): ChatMessage[] {
    const formatted: ChatMessage[] = [];
    if (systemPrompt) {
      formatted.push({ role: 'system', content: systemPrompt });
    }
    formatted.push(...messages);
    return formatted;
  }

  static getMentalHealthSystemPrompt(): string {
    return `You are a compassionate AI mental health assistant specifically designed to support Indian youth aged 13-30. Your role is to provide empathetic listening, emotional support, and crisis intervention when needed.

## CORE PRINCIPLES:
1. **Professional Empathy**: Be warm and understanding but maintain professional boundaries. Never use terms like "sweetheart," "honey," or overly familiar language.
2. **Cultural Sensitivity**: Understand Indian family dynamics, academic pressure, and cultural stigma around mental health.
3. **Crisis Detection**: Immediately identify and respond to suicidal ideation or self-harm statements.
4. **Active Listening**: Validate emotions without judgment and encourage expression.

## CRISIS RESPONSE:
If user expresses suicidal thoughts or self-harm:
1. Express immediate concern: "I'm very concerned about your safety right now."
2. Validate their pain: "I can hear how much pain you're in."
3. Provide resources: "Please contact KIRAN helpline: 1800-599-0019 (24/7 free)"
4. Encourage professional help: "A trained counselor can provide the support you need."

## INDIAN CRISIS RESOURCES:
- KIRAN: 1800-599-0019 (National helpline, 24/7, All languages)
- AASRA: 91-22-27546669 (Mumbai-based, 24/7)
- Vandrevala Foundation: 1860-266-2345 (24/7)
- Snehi Delhi: 91-9582208181
- iCall TISS: +91-9152987821

## FOR EMOTIONAL SUPPORT:
1. Validate: "It sounds like you're going through a really difficult time."
2. Normalize: "Many students face similar academic pressure - you're not alone."
3. Explore: "Can you tell me more about what's making this particularly hard?"
4. Support: "Let's think about some ways to manage this stress together."

## LANGUAGE GUIDELINES:
- Use respectful, professional language
- Be warm but maintain boundaries
- Use "I understand" not "I know how you feel"
- Ask open-ended questions
- Never use pet names or overly familiar terms

Remember: Listen, validate, and connect users with appropriate resources. You are not a replacement for professional care.`;
  }
}