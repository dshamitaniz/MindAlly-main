'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { 
  Heart, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Plus,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { getMoodEmoji, getMoodColor, getMoodLabel, formatDate, formatTime } from '@/lib/utils';
import { MoodEntry } from '@/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-500' },
  { value: 2, emoji: '😔', label: 'Sad', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
  { value: 4, emoji: '😊', label: 'Happy', color: 'text-green-500' },
  { value: 5, emoji: '😄', label: 'Very Happy', color: 'text-blue-500' },
];

const ACTIVITIES = [
  'Yoga', 'Work', 'Family Time', 'Reading', 'Cooking', 'Music',
  'Nature Walk', 'Gaming', 'Art', 'Sleep', 'Meditation', 'Chai Time',
  'Prayer', 'Festival Prep', 'Gardening', 'Dancing'
];

const TAGS = [
  'Anxious', 'Stressed', 'Excited', 'Grateful', 'Lonely', 'Confident',
  'Overwhelmed', 'Peaceful', 'Frustrated', 'Hopeful', 'Tired', 'Energetic',
  'Family Pressure', 'Work Stress', 'Festival Joy', 'Monsoon Blues'
];

export default function MoodPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mood, setMood] = useState<number | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState({
    averageMood: 0,
    totalEntries: 0,
    streak: 0,
  });

  useEffect(() => {
    if (user) {
      fetchRecentEntries();
      fetchStats();
    }
  }, [user]);

  const fetchRecentEntries = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/mood/entries?userId=${user._id || user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecentEntries(data);
      }
    } catch (error) {
      console.error('Failed to fetch recent entries:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/mood/stats?userId=${user._id || user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleActivityToggle = (activity: string) => {
    setActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit clicked, user:', user, 'mood:', mood);
    
    if (!user) {
      toast.error('Please log in to save mood entries');
      return;
    }
    
    if (!mood) {
      toast.error('Please select a mood by clicking on one of the emoji faces above');
      return;
    }

    setLoading(true);
    
    const payload = {
      mood,
      activities,
      notes,
      tags,
      userId: user._id || user.id,
    };
    
    console.log('Sending payload:', payload);
    
    try {
      const response = await fetch('/api/mood/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success result:', result);
        toast.success('Mood entry saved successfully!');
        setMood(null);
        setActivities([]);
        setNotes('');
        setTags([]);
        fetchRecentEntries();
        fetchStats();
      } else {
        const error = await response.json();
        console.error('API error:', error);
        toast.error(error.message || 'Failed to save mood entry');
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      toast.error('Failed to save mood entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mood Tracking</h1>
              <p className="text-gray-600 mt-1">
                How are you feeling today? Track your emotions and activities.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Streak</div>
                <div className="text-2xl font-bold text-blue-600">{stats.streak} days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mood Entry Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Track Your Mood
                </CardTitle>
                <CardDescription>
                  Select how you&apos;re feeling and add some context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mood Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      How are you feeling right now?
                    </label>
                    <div className="grid grid-cols-5 gap-4">
                      {MOOD_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            console.log('Mood selected:', option.value);
                            setMood(option.value);
                          }}
                          className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                            mood === option.value
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-4xl mb-2">{option.emoji}</div>
                          <div className={`text-sm font-medium ${option.color}`}>
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      What have you been doing today? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {ACTIVITIES.map((activity) => (
                        <button
                          key={activity}
                          type="button"
                          onClick={() => handleActivityToggle(activity)}
                          className={`p-2 rounded-lg text-sm transition-all ${
                            activities.includes(activity)
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                          } border`}
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      How would you describe your current state? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`p-2 rounded-lg text-sm transition-all ${
                            tags.includes(tag)
                              ? 'bg-purple-100 text-purple-700 border-purple-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                          } border`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                      Additional notes (optional)
                    </label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What's on your mind? Any specific thoughts or feelings you'd like to remember?"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Mood Entry
                      </>
                    )}
                  </Button>
                  {!mood && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      Please select a mood above to save your entry
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Recent Entries */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.averageMood.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Average Mood</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.totalEntries}
                  </div>
                  <div className="text-sm text-gray-500">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.streak}
                  </div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEntries.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No mood entries yet. Start tracking your mood!
                    </p>
                  ) : (
                    recentEntries.slice(0, 5).map((entry) => (
                      <div key={entry._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl">
                          {getMoodEmoji(entry.mood)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getMoodColor(entry.mood)}`}>
                              {getMoodLabel(entry.mood)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(entry.createdAt)}
                            </span>
                          </div>
                          {entry.activities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.activities.slice(0, 2).map((activity) => (
                                <Badge key={activity} variant="secondary" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                              {entry.activities.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{entry.activities.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {recentEntries.length > 5 && (
                  <Button variant="ghost" className="w-full mt-4">
                    View All Entries
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
