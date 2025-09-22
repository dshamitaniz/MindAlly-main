import { NextRequest, NextResponse } from 'next/server';
import { demoStorage } from '@/lib/demo-storage';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId || !userId.startsWith('demo-')) {
      return NextResponse.json(
        { error: 'Invalid demo user ID' },
        { status: 400 }
      );
    }

    await demoStorage.cleanup(userId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Demo cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}