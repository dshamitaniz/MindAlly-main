import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIService } from '@/lib/google-ai-service';
import { OllamaAIService } from '@/lib/ollama-ai-service';
import { enhancedCrisisDetection } from '@/lib/enhanced-crisis-detection';
import Conversation from '@/lib/models/Conversation';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

const DEFAULT_GOOGLE_MODEL = 'gemini-1.5-flash';
const DEFAULT_OLLAMA_MODEL = 'llama3:latest';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { message, sessionId, userId } = await request.json();

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user preferences
    const user = await User.findById(userId).select('+preferences.ai.provider +preferences.ai.googleApiKey +preferences.ai.ollamaBaseUrl +preferences.ai.ollamaModel');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Initialize AI preferences if not set
    if (!user.preferences) {
      user.preferences = {};
    }
    if (!user.preferences.ai) {
      user.preferences.ai = {
        provider: process.env.GOOGLE_AI_API_KEY ? 'google' : 'ollama',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        ollamaModel: process.env.OLLAMA_MODEL || 'llama3:latest',
        googleApiKey: process.env.GOOGLE_AI_API_KEY
      };
      await user.save();
    }

    let aiService;
    let modelUsed = 'unknown';

    if (user.preferences.ai.provider === 'google') {
      const googleApiKey = user.preferences.ai.googleApiKey || process.env.GOOGLE_AI_API_KEY;
      if (!googleApiKey) {
        return NextResponse.json(
          { error: 'Google AI not configured. Please set up your Google API key in settings.' },
          { status: 400 }
        );
      }
      aiService = new GoogleAIService(googleApiKey);
      modelUsed = DEFAULT_GOOGLE_MODEL;
    } else {
      // Default to Ollama if no provider set or provider is ollama
      const ollamaBaseUrl = user.preferences.ai?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const ollamaModel = user.preferences.ai?.ollamaModel || process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
      
      try {
        aiService = new OllamaAIService(ollamaBaseUrl, ollamaModel);
        // Test connection with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        await Promise.race([aiService.testConnection(), timeoutPromise]);
        modelUsed = ollamaModel;
      } catch (error) {
        // Fallback to Google AI if available
        const googleApiKey = user.preferences.ai.googleApiKey || process.env.GOOGLE_AI_API_KEY;
        if (googleApiKey) {
          console.log('Ollama failed, falling back to Google AI');
          aiService = new GoogleAIService(googleApiKey);
          modelUsed = DEFAULT_GOOGLE_MODEL;
          
          // Update user preference to Google AI for future requests
          user.preferences.ai.provider = 'google';
          await user.save();
        } else {
          return NextResponse.json(
            { 
              error: `Ollama connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check if Ollama is running and accessible at ${ollamaBaseUrl}`,
              troubleshooting: [
                'Ensure Ollama is running: docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama',
                'Pull the model: docker exec ollama ollama pull llama3:latest',
                'Check container: docker ps | grep ollama',
                'For Docker Desktop, try: http://host.docker.internal:11434',
                'For WSL2, try: http://172.17.0.1:11434',
                'Or switch to Google AI in chat settings'
              ]
            },
            { status: 503 }
          );
        }
      }
    }

    // Get conversation history
    let conversation = await Conversation.findOne({
      userId,
      'context.sessionId': sessionId
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        userId,
        messages: [],
        context: {
          sessionId,
          lastActivity: new Date(),
          totalMessages: 0,
        }
      });
    }

    // Detect crisis in user message
    const crisisAnalysis = enhancedCrisisDetection.processMessage(message);
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        crisisLevel: crisisAnalysis.assessment.riskLevel,
        crisisIndicators: crisisAnalysis.assessment.indicators
      }
    });

    // Prepare conversation history for AI
    const conversationHistory = conversation.messages.slice(-10); // Last 10 messages for context
    const formattedMessages = user.preferences.ai.provider === 'google' 
      ? GoogleAIService.formatMessages(conversationHistory)
      : conversationHistory;

    // Generate AI response with crisis awareness
    let systemPrompt = user.preferences.ai.provider === 'google'
      ? GoogleAIService.getMentalHealthSystemPrompt()
      : OllamaAIService.getMentalHealthSystemPrompt();
    
    // If crisis detected, use crisis-specific response
    if (crisisAnalysis.assessment.requiresImmediate) {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: crisisAnalysis.response,
        timestamp: new Date(),
        metadata: {
          crisisResponse: true,
          riskLevel: crisisAnalysis.assessment.riskLevel,
          resources: crisisAnalysis.resources,
          immediateActions: crisisAnalysis.immediateActions
        }
      };
      
      conversation.messages.push(assistantMessage);
      conversation.context.lastActivity = new Date();
      conversation.context.totalMessages = conversation.messages.length;
      await conversation.save();
      
      return NextResponse.json({
        message: crisisAnalysis.response,
        metadata: {
          crisisDetected: true,
          riskLevel: crisisAnalysis.assessment.riskLevel,
          resources: crisisAnalysis.resources,
          immediateActions: crisisAnalysis.immediateActions,
          sessionId
        }
      });
    }
    
    // Generate response with timeout and fallback
    let response: { content: string; model?: string; tokens: number; latency: number };
    try {
      const responseTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI response timeout')), 25000)
      );
      const aiResponse = await Promise.race([
        aiService.generateResponse(formattedMessages, systemPrompt),
        responseTimeoutPromise
      ]);
      
      // Handle different response formats from different AI services
      response = {
        content: aiResponse.content,
        model: (aiResponse as any).model || modelUsed,
        tokens: aiResponse.tokens,
        latency: aiResponse.latency
      };
    } catch (aiError) {
      // Fallback response when AI service fails
      const fallbackMessage = "I'm experiencing some technical difficulties right now, but I'm here to listen. Could you tell me more about what's on your mind? If you're in crisis, please contact KIRAN helpline at 1800-599-0019 (24/7, free).";
      
      response = {
        content: fallbackMessage,
        model: 'fallback',
        tokens: 0,
        latency: 0
      };
      
      console.error('AI Service Error (using fallback):', {
        error: aiError instanceof Error ? aiError.message : 'Unknown error',
        userId
      });
    }

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: {
        model: response.model || modelUsed,
        tokens: response.tokens,
        latency: response.latency,
      },
    });

    // Update conversation context
    conversation.context.lastActivity = new Date();
    conversation.context.totalMessages = conversation.messages.length;

    // Save conversation
    await conversation.save();

    return NextResponse.json({
      message: response.content,
      metadata: {
        model: response.model || modelUsed,
        tokens: response.tokens,
        latency: response.latency,
        sessionId,
      },
    });

  } catch (error) {
    console.error('AI Chat Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId: 'unknown'
    });
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing userId or sessionId' },
        { status: 400 }
      );
    }

    const conversation = await Conversation.findOne({
      userId,
      'context.sessionId': sessionId
    });

    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      messages: conversation.messages,
      context: conversation.context,
    });

  } catch (error) {
    console.error('Get Conversation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear conversation history
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing userId or sessionId' },
        { status: 400 }
      );
    }

    const result = await Conversation.deleteOne({
      userId,
      'context.sessionId': sessionId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Clear Conversation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}