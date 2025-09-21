interface GoogleAIMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GoogleAIResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
    finishReason: string;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleAIService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateResponse(
    messages: GoogleAIMessage[],
    systemPrompt?: string
  ): Promise<{
    content: string;
    tokens: number;
    latency: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Prepare the request payload
      const requestBody = {
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestBody.contents.unshift({
          role: 'user',
          parts: [{ text: systemPrompt }]
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google AI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GoogleAIResponse = await response.json();
      const latency = Date.now() - startTime;

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Google AI');
      }

      const content = data.candidates[0].content.parts[0].text;
      const tokens = data.usageMetadata?.totalTokenCount || 0;

      return {
        content,
        tokens,
        latency,
      };
    } catch (error) {
      console.error('Google AI Service Error:', error);
      throw error;
    }
  }

  // Convert conversation history to Google AI format
  static formatMessages(conversationHistory: Array<{ role: string; content: string }>): GoogleAIMessage[] {
    return conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  // Create a mental health focused system prompt
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
- KIRAN: 1800-599-0019 (National helpline)
- AASRA: 91-22-2754-6669 (Mumbai-based, 24/7)
- Vandrevala Foundation: 1860-266-2345

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
