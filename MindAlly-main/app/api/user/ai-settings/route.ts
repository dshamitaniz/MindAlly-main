import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';
import { testOllamaConnection } from '@/lib/ollama-docker-helper';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select('+preferences.ai');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Provide defaults if not set
    const aiSettings = {
      provider: user.preferences?.ai?.provider || 'ollama',
      conversationMemory: user.preferences?.ai?.conversationMemory ?? true,
      ollamaBaseUrl: user.preferences?.ai?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      ollamaModel: user.preferences?.ai?.ollamaModel || process.env.OLLAMA_MODEL || 'llama3:latest',
      googleApiKey: user.preferences?.ai?.googleApiKey || '',
    };

    return NextResponse.json({ aiSettings });

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
    await connectDB();

    const { userId, aiSettings } = await request.json();

    if (!userId || !aiSettings) {
      return NextResponse.json(
        { error: 'Missing userId or aiSettings' },
        { status: 400 }
      );
    }

    // Validate Ollama connection if provider is ollama
    if (aiSettings.provider === 'ollama' && aiSettings.ollamaBaseUrl) {
      try {
        const connectionTest = await testOllamaConnection(aiSettings.ollamaBaseUrl);
        if (!connectionTest.success) {
          return NextResponse.json(
            { 
              error: `Ollama connection test failed: ${connectionTest.error}`,
              troubleshooting: [
                'Ensure Ollama is running in Docker',
                'Check if the URL is correct',
                'Try alternative URLs like http://host.docker.internal:11434',
                'Verify the model is pulled: docker exec ollama ollama list'
              ]
            },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { 
            error: `Failed to test Ollama connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
            troubleshooting: [
              'Check if Ollama container is running: docker ps | grep ollama',
              'Start Ollama: docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama',
              'Pull model: docker exec ollama ollama pull llama3:latest'
            ]
          },
          { status: 400 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'preferences.ai': {
            provider: aiSettings.provider,
            conversationMemory: aiSettings.conversationMemory,
            ollamaBaseUrl: aiSettings.ollamaBaseUrl,
            ollamaModel: aiSettings.ollamaModel,
            googleApiKey: aiSettings.googleApiKey,
          }
        }
      },
      { new: true, upsert: false }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'AI settings saved successfully',
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