import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import MeditationSession from '@/lib/models/MeditationSession';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId: string;
      email: string;
    };

    const { type, duration, completed } = await request.json();

    if (!type || !duration) {
      return NextResponse.json(
        { message: 'Type and duration are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const session = new MeditationSession({
      userId: decoded.userId,
      type,
      duration,
      completed: completed || false,
    });

    await session.save();

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Create meditation session error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId: string;
      email: string;
    };

    await connectDB();

    const sessions = await MeditationSession.find({ userId: decoded.userId })
      .sort({ timestamp: -1 })
      .limit(20);

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error('Get meditation sessions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
