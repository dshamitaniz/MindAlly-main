import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import MoodEntry from '@/lib/models/MoodEntry';
import JournalEntry from '@/lib/models/JournalEntry';
import Goal from '@/lib/models/Goal';
import MeditationSession from '@/lib/models/MeditationSession';
import Assessment from '@/lib/models/Assessment';

export const dynamic = 'force-dynamic';

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
    const jwtSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
    };

    await connectDB();

    const userId = decoded.userId;

    // Get current date and week start
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Get current mood (latest entry)
    const latestMood = await MoodEntry.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    // Get mood trend (last 7 days)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const moodEntries = await MoodEntry.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    // Create mood trend array (fill missing days with null)
    const moodTrend = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      
      const dayEntry = moodEntries.find(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.toDateString() === date.toDateString();
      });
      
      moodTrend.push(dayEntry ? dayEntry.mood : 3); // Default to neutral if no entry
    }

    // Get journal entries this week
    const journalEntriesThisWeek = await JournalEntry.countDocuments({
      userId,
      createdAt: { $gte: weekStart }
    });

    // Get meditation streak
    const meditationSessions = await MeditationSession.find({
      userId,
      completed: true
    }).sort({ timestamp: -1 });

    // Calculate meditation streak
    let meditationStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < meditationSessions.length; i++) {
      const sessionDate = new Date(meditationSessions[i].timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (sessionDate.getTime() === expectedDate.getTime()) {
        meditationStreak++;
      } else {
        break;
      }
    }

    // Get meditation time this week
    const meditationTimeThisWeek = await MeditationSession.aggregate([
      {
        $match: {
          userId,
          completed: true,
          timestamp: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$duration' }
        }
      }
    ]);

    // Get active goals
    const activeGoals = await Goal.countDocuments({
      userId,
      status: { $in: ['not-started', 'in-progress'] }
    });

    // Get completed goals this week
    const completedGoalsThisWeek = await Goal.countDocuments({
      userId,
      status: 'completed',
      updatedAt: { $gte: weekStart }
    });

    // Get assessments completed
    const assessmentsCompleted = await Assessment.countDocuments({
      userId
    });

    // Get last assessment date
    const lastAssessment = await Assessment.findOne({ userId })
      .sort({ completedAt: -1 });

    const stats = {
      currentMood: latestMood?.mood || 3,
      moodTrend,
      journalEntriesThisWeek,
      meditationStreak,
      meditationTimeThisWeek: meditationTimeThisWeek[0]?.totalMinutes || 0,
      activeGoals,
      completedGoalsThisWeek,
      assessmentsCompleted,
      lastAssessmentDate: lastAssessment?.completedAt,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
