import { NextRequest, NextResponse } from 'next/server';
import { authenticateDemo } from '@/lib/demo-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const user = await authenticateDemo(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid demo credentials' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error('Demo auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}