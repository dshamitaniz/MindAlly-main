import { NextRequest, NextResponse } from 'next/server';
import { demoStorage } from '@/lib/demo-storage';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    let user;
    
    if (userId.startsWith('demo-')) {
      // Demo user - return default settings
      return NextResponse.json({
        aiSettings: {
          provider: process.env.GOOGLE_AI_API_KEY ? 'google' : 'ollama',
          ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          ollamaModel: process.env.OLLAMA_MODEL || 'llama3:latest',
          conversationMemory: true,
          googleApiKey: process.env.GOOGLE_AI_API_KEY
        }
      });
    }

    // Regular user - use MongoDB
    await connectDB();
    user = await User.findById(userId).select('+preferences.ai.googleApiKey +preferences.ai.ollamaBaseUrl');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Initialize AI preferences if not set
    if (!user.preferences?.ai) {
      user.preferences = {
        ...user.preferences,
        ai: {
          provider: process.env.GOOGLE_AI_API_KEY ? 'google' : 'ollama',
          ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          ollamaModel: process.env.OLLAMA_MODEL || 'llama3:latest',
          conversationMemory: true,
          googleApiKey: process.env.GOOGLE_AI_API_KEY
        }
      };
      await user.save();
    }

    return NextResponse.json({
      aiSettings: user.preferences.ai
    });

  } catch (error) {
    console.error('Get AI Settings Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, aiSettings } = await request.json();

    if (!userId || !aiSettings) {
      return NextResponse.json(
        { error: 'Missing userId or aiSettings' },
        { status: 400 }
      );
    }

    if (userId.startsWith('demo-')) {
      // Demo user - just return success (settings not persisted)
      return NextResponse.json({
        success: true,
        aiSettings: {
          provider: aiSettings.provider || 'ollama',
          ollamaBaseUrl: aiSettings.ollamaBaseUrl || 'http://localhost:11434',
          ollamaModel: aiSettings.ollamaModel || 'llama3:latest',
          conversationMemory: aiSettings.conversationMemory ?? true,
          googleApiKey: aiSettings.googleApiKey || process.env.GOOGLE_AI_API_KEY
        }
      });
    }

    // Regular user - use MongoDB
    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update AI preferences
    if (!user.preferences) {
      user.preferences = {} as any;
    }

    user.preferences.ai = {
      provider: aiSettings.provider || 'ollama',
      ollamaBaseUrl: aiSettings.ollamaBaseUrl || 'http://localhost:11434',
      ollamaModel: aiSettings.ollamaModel || 'llama3:latest',
      conversationMemory: aiSettings.conversationMemory ?? true,
      googleApiKey: aiSettings.googleApiKey || process.env.GOOGLE_AI_API_KEY
    };

    await user.save();

    return NextResponse.json({
      success: true,
      aiSettings: user.preferences.ai
    });

  } catch (error) {
    console.error('Update AI Settings Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}