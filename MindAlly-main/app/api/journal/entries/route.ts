import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/lib/models/JournalEntry';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as {
      userId: string;
      email: string;
    };

    await connectDB();

    const entries = await JournalEntry.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token' },
        { status: 401 }
      );
    }

    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as {
      userId: string;
      email: string;
    };

    const { title, content, mood, activities, moodTags, tags, isPrivate } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const journalEntry = new JournalEntry({
      userId: decoded.userId,
      title,
      content,
      mood: mood || 3,
      activities: activities || [],
      moodTags: moodTags || [],
      tags: tags || [],
      isPrivate: isPrivate || false,
      wordCount: content.split(' ').length,
    });

    await journalEntry.save();

    return NextResponse.json(journalEntry, { status: 201 });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}