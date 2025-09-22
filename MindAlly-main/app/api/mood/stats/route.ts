import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import MoodEntry from '@/lib/models/MoodEntry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let authenticatedUserId = userId;
    
    // If no userId provided, try to get from auth token
    if (!authenticatedUserId) {
      const token = request.cookies.get('auth-token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { message: 'No authentication provided' },
          { status: 401 }
        );
      }
      
      const jwtSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
      if (!process.env.NEXTAUTH_SECRET) {
        console.warn('NEXTAUTH_SECRET not set, using fallback');
      }
      
      try {
        const decoded = jwt.verify(token, jwtSecret) as {
          userId: string;
          email: string;
        };
        authenticatedUserId = decoded.userId;
      } catch (jwtError) {
        return NextResponse.json(
          { message: 'Invalid authentication token' },
          { status: 401 }
        );
      }
    }

    await connectDB();

    // Get all mood entries
    const entries = await MoodEntry.find({ userId: authenticatedUserId }).sort({ createdAt: -1 });

    // Calculate average mood
    const averageMood = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length 
      : 0;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    const stats = {
      averageMood,
      totalEntries: entries.length,
      streak,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Get mood stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
