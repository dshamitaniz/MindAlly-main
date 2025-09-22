import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIService } from '@/lib/google-ai-service';
import { OllamaAIService } from '@/lib/ollama-ai-service';
import { enhancedCrisisDetection } from '@/lib/enhanced-crisis-detection';
import { demoStorage } from '@/lib/demo-storage';
import { checkMongoConnection, fallbackStorage } from '@/lib/storage-fallback';
import Conversation from '@/lib/models/Conversation';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

const DEFAULT_GOOGLE_MODEL = 'gemini-1.5-flash';
const DEFAULT_OLLAMA_MODEL = 'llama3:latest';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json();

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check storage type
    let user;
    let storageType: 'demo' | 'fallback' | 'mongodb' = 'fallback';
    const GOOGLE_API_KEY = 'AIzaSyDn5HAnyD2xFBhev4wOmg8wEDvnnreKdqA';
    
    if (userId.startsWith('demo-')) {
      // Demo user - use JSON storage
      storageType = 'demo';
      user = { 
        _id: userId,
        preferences: {
          ai: {
            provider: 'google',
            ollamaBaseUrl: 'http://localhost:11434',
            ollamaModel: 'llama3:latest',
            googleApiKey: GOOGLE_API_KEY,
            conversationMemory: true
          }
        }
      };
    } else {
      // Check MongoDB connection
      const mongoConnected = await checkMongoConnection();
      
      if (!mongoConnected) {
        // Fallback to JSON storage
        storageType = 'fallback';
        user = { 
          _id: userId.startsWith('fallback-') ? userId : `fallback-${userId}`,
          preferences: {
            ai: {
              provider: 'google',
              ollamaBaseUrl: 'http://localhost:11434',
              ollamaModel: 'llama3:latest',
              googleApiKey: GOOGLE_API_KEY,
              conversationMemory: true
            }
          }
        };
      } else {
        // Regular user - use MongoDB
        user = await User.findById(userId).select('+preferences.ai.provider +preferences.ai.googleApiKey +preferences.ai.ollamaBaseUrl +preferences.ai.ollamaModel');
        
        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
      }
    }

    // Initialize AI preferences if not set
    if (!user.preferences) {
      user.preferences = {} as any;
    }
    if (!user.preferences.ai) {
      user.preferences.ai = {
        provider: 'google',
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'llama3:latest',
        googleApiKey: GOOGLE_API_KEY,
        conversationMemory: true
      };
    }

    let aiService;
    let modelUsed = 'unknown';
    let providerUsed = user.preferences.ai.provider;

    // Always use Google AI with hardcoded key
    try {
      aiService = new GoogleAIService(GOOGLE_API_KEY);
      modelUsed = DEFAULT_GOOGLE_MODEL;
      providerUsed = 'google';
    } catch (error) {
      console.error('Google AI initialization failed:', error);
      return NextResponse.json(
        { error: 'Google AI service initialization failed.' },
        { status: 500 }
      );
    }
    
    // Fallback code (not used but kept for structure)
    if (false) {
      // Try Ollama first, with automatic fallback to Google AI
      const ollamaBaseUrl = user.preferences.ai?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const ollamaModel = user.preferences.ai?.ollamaModel || process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
      
      try {
        aiService = new OllamaAIService(ollamaBaseUrl, ollamaModel);
        // Test connection with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 8000)
        );
        await Promise.race([aiService.testConnection(), timeoutPromise]);
        modelUsed = ollamaModel;
        providerUsed = 'ollama';
      } catch (ollamaError) {
        console.warn('Ollama connection failed, attempting Google AI fallback:', ollamaError);
        
        // Fallback to Google AI if available
        const googleApiKey = user.preferences.ai.googleApiKey || process.env.GOOGLE_AI_API_KEY;
        if (googleApiKey) {
          try {
            console.log('Falling back to Google AI');
            aiService = new GoogleAIService(googleApiKey);
            modelUsed = DEFAULT_GOOGLE_MODEL;
            providerUsed = 'google';
            
            // Temporarily update user preference for this session
            user.preferences.ai.provider = 'google';
            await user.save();
          } catch (googleError) {
            console.error('Google AI fallback also failed:', googleError);
            return NextResponse.json(
              { error: 'Both Ollama and Google AI are unavailable. Please check your configuration.' },
              { status: 503 }
            );
          }
        } else {
          return NextResponse.json(
            { 
              error: `Ollama connection failed and no Google AI key available. Error: ${ollamaError instanceof Error ? ollamaError.message : 'Unknown error'}`,
              troubleshooting: [
                'Ensure Ollama is running: docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama',
                'Pull the model: docker exec ollama ollama pull llama3:latest',
                'Check container: docker ps | grep ollama',
                'For Docker Desktop, try: http://host.docker.internal:11434',
                'For WSL2, try: http://172.17.0.1:11434',
                'Or add Google AI API key in chat settings'
              ]
            },
            { status: 503 }
          );
        }
      }
    }

    // Get conversation history
    let conversation;
    
    if (storageType === 'demo' || storageType === 'fallback') {
      // Use JSON storage
      const storage = storageType === 'demo' ? demoStorage : fallbackStorage;
      conversation = await storage.findConversation(user._id, sessionId);
      if (!conversation) {
        conversation = {
          userId: user._id,
          messages: [],
          context: {
            sessionId,
            lastActivity: new Date(),
            totalMessages: 0,
          }
        };
      }
    } else {
      // Regular user - use MongoDB
      conversation = await Conversation.findOne({
        userId,
        'context.sessionId': sessionId
      });

      if (!conversation) {
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
    const formattedMessages = providerUsed === 'google' 
      ? GoogleAIService.formatMessages(conversationHistory)
      : conversationHistory;

    // Generate AI response with crisis awareness
    let systemPrompt = providerUsed === 'google'
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
      
      if (storageType === 'demo') {
        await demoStorage.saveConversation(conversation);
      } else if (storageType === 'fallback') {
        await fallbackStorage.saveConversation(conversation);
      } else {
        await conversation.save();
      }
      
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
    if (storageType === 'demo') {
      await demoStorage.saveConversation(conversation);
    } else if (storageType === 'fallback') {
      await fallbackStorage.saveConversation(conversation);
    } else {
      await conversation.save();
    }

    return NextResponse.json({
      message: response.content,
      metadata: {
        model: response.model || modelUsed,
        tokens: response.tokens,
        latency: response.latency,
        sessionId,
        storageType,
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing userId or sessionId' },
        { status: 400 }
      );
    }

    let conversation;
    
    if (userId?.startsWith('demo-')) {
      // Demo user - use JSON storage
      conversation = await demoStorage.findConversation(userId, sessionId);
    } else if (userId?.startsWith('fallback-') || !(await checkMongoConnection())) {
      // Fallback storage
      conversation = await fallbackStorage.findConversation(userId, sessionId);
    } else {
      // Regular user - use MongoDB
      await connectDB();
      conversation = await Conversation.findOne({
        userId,
        'context.sessionId': sessionId
      });
    }

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
    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing userId or sessionId' },
        { status: 400 }
      );
    }

    let success = false;
    
    if (userId?.startsWith('demo-')) {
      // Demo user - use JSON storage
      success = await demoStorage.deleteConversation(userId, sessionId);
    } else if (userId?.startsWith('fallback-') || !(await checkMongoConnection())) {
      // Fallback storage
      success = await fallbackStorage.deleteConversation(userId, sessionId);
    } else {
      // Regular user - use MongoDB
      await connectDB();
      const result = await Conversation.deleteOne({
        userId,
        'context.sessionId': sessionId
      });
      success = result.deletedCount > 0;
    }

    if (!success) {
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