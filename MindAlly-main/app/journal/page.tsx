'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Share2,
  Download,
  Heart,
  Star,
  Tag,
  Lock,
  Unlock,
  ArrowLeft
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  mood: number;
  activities: string[];
  moodTags: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
}

// Move constants outside component to prevent recreation on renders
const MOOD_SCALE = [
  { value: 1, label: 'Very Sad', color: 'text-red-600', emoji: '😢' },
  { value: 2, label: 'Sad', color: 'text-orange-600', emoji: '😔' },
  { value: 3, label: 'Neutral', color: 'text-yellow-600', emoji: '😐' },
  { value: 4, label: 'Good', color: 'text-green-600', emoji: '😊' },
  { value: 5, label: 'Great', color: 'text-blue-600', emoji: '😄' }
] as const;

const DAILY_ACTIVITIES = [
  'Exercise', 'Work', 'Socializing', 'Reading', 'Cooking', 'Music',
  'Nature', 'Gaming', 'Art', 'Sleep', 'Meditation', 'Family'
] as const;

const EMOTION_TAGS = [
  'Anxious', 'Stressed', 'Excited', 'Grateful', 'Lonely', 'Confident',
  'Overwhelmed', 'Peaceful', 'Frustrated', 'Hopeful', 'Tired', 'Energetic'
] as const;

const JOURNAL_TEMPLATES = [
  {
    id: 'gratitude',
    title: 'Gratitude Journal',
    description: 'Write about things you\'re grateful for today',
    icon: '🙏',
    prompts: [
      'What are three things you\'re grateful for today?',
      'Who made you smile today?',
      'What small moment brought you joy?'
    ]
  },
  {
    id: 'reflection',
    title: 'Daily Reflection',
    description: 'Reflect on your day and how you\'re feeling',
    icon: '🤔',
    prompts: [
      'How did today go overall?',
      'What was the highlight of your day?',
      'What would you do differently?'
    ]
  },
  {
    id: 'goals',
    title: 'Goal Setting',
    description: 'Set and track your personal goals',
    icon: '🎯',
    prompts: [
      'What do you want to achieve this week?',
      'What steps will you take tomorrow?',
      'How will you measure your progress?'
    ]
  },
  {
    id: 'emotions',
    title: 'Emotional Check-in',
    description: 'Explore and process your emotions',
    icon: '💭',
    prompts: [
      'What emotions did you experience today?',
      'What triggered these feelings?',
      'How did you handle them?'
    ]
  }
] as const;

export default function JournalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 3,
    activities: [] as string[],
    moodTags: [] as string[],
    tags: [] as string[],
    isPrivate: false
  });
  const [isDemoMode, setIsDemoMode] = useState(true); // Always show demo data for public access

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      // Simulate API call with demo data
      const demoEntries: JournalEntry[] = [
        {
          _id: '1',
          title: 'Grateful for Today',
          content: 'Today was a beautiful day. I spent time with my family and we had a wonderful dinner together. I\'m grateful for these simple moments that bring so much joy to my life.',
          mood: 5,
          activities: ['Family', 'Cooking'],
          moodTags: ['Grateful', 'Hopeful'],
          tags: ['gratitude', 'family', 'joy'],
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wordCount: 42
        },
        {
          _id: '2',
          title: 'Work Stress',
          content: 'Had a challenging day at work today. The project deadline is approaching and I\'m feeling overwhelmed. Need to take a step back and prioritize my tasks.',
          mood: 2,
          activities: ['Work'],
          moodTags: ['Stressed', 'Overwhelmed'],
          tags: ['work', 'stress', 'challenge'],
          isPrivate: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          wordCount: 38
        },
        {
          _id: '3',
          title: 'New Hobby',
          content: 'Started learning to play the guitar today! It\'s been something I\'ve wanted to do for years. The first lesson was challenging but exciting.',
          mood: 4,
          activities: ['Music', 'Learning'],
          moodTags: ['Excited', 'Confident'],
          tags: ['hobby', 'learning', 'music'],
          isPrivate: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          wordCount: 35
        }
      ];
      setEntries(demoEntries);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;
    
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredEntries(filtered);
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const entry: JournalEntry = {
        _id: crypto.randomUUID(),
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        activities: newEntry.activities,
        moodTags: newEntry.moodTags,
        tags: newEntry.tags,
        isPrivate: newEntry.isPrivate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: newEntry.content.split(' ').length
      };
      
      setEntries([entry, ...entries]);
      setNewEntry({ title: '', content: '', mood: 3, activities: [], moodTags: [], tags: [], isPrivate: false });
      setIsCreateModalOpen(false);
      toast.success('Journal entry created successfully!');
    } catch (error) {
      console.error('Failed to create entry:', error);
      toast.error('Failed to create journal entry');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      setEntries(entries.filter(entry => entry._id !== id));
      toast.success('Journal entry deleted');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast.error('Failed to delete journal entry');
    }
  };

  const handleTemplateSelect = useCallback((template: typeof JOURNAL_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setNewEntry(prev => ({
      ...prev,
      title: template.title,
      content: template.prompts.join('\n\n'),
      activities: [],
      moodTags: [],
      tags: []
    }));
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getMoodColor = useCallback((mood: number) => {
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-blue-500'];
    return colors[mood - 1] || 'text-gray-500';
  }, []);

  const getMoodLabel = useCallback((mood: number) => {
    const moodObj = MOOD_SCALE.find(m => m.value === mood);
    return moodObj ? `${moodObj.emoji} ${moodObj.label}` : 'Unknown';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Demo Mode</h3>
                    <p className="text-sm text-blue-700">You&apos;re viewing sample journal entries. Sign in to create your own entries.</p>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <BookOpen className="h-10 w-10 mr-3 text-primary-600" />
                Journal & Mood
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Express your thoughts, track your mood, and reflect on your mental wellness journey
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Entry
              </Button>
            </div>
          </div>

          {/* Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Card key={entry._id} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {entry.title}
                      </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-sm font-medium ${getMoodColor(entry.mood)}`}>
                      {getMoodLabel(entry.mood)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  {entry.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.activities.slice(0, 3).map((activity) => (
                        <Badge key={activity} variant="outline" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                      {entry.activities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.activities.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {entry.isPrivate ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Unlock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {entry.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {entry.moodTags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs bg-blue-100 text-blue-800">
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {(entry.moodTags.length + entry.tags.length) > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(entry.moodTags.length + entry.tags.length) - 4}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(entry.createdAt)}
                      </span>
                      <span>{entry.wordCount} words</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Start your journaling journey by creating your first entry'
                }
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Entry
              </Button>
            </div>
          )}

          {/* Create Entry Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create New Journal Entry"
            description="Express your thoughts and feelings"
            size="journal"
          >
            <form onSubmit={handleCreateEntry} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="What&apos;s on your mind?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling?
                </label>
                <div className="flex space-x-2">
                  {MOOD_SCALE.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, mood: mood.value })}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        newEntry.mood === mood.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mb-1">{mood.emoji}</span>
                      <span className="text-xs text-gray-600">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Write your thoughts here..."
                  rows={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you do today?
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAILY_ACTIVITIES.map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => {
                        const newActivities = newEntry.activities.includes(activity)
                          ? newEntry.activities.filter(a => a !== activity)
                          : [...newEntry.activities, activity];
                        setNewEntry({ ...newEntry, activities: newActivities });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newEntry.activities.includes(activity)
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling? (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const newMoodTags = newEntry.moodTags.includes(tag)
                          ? newEntry.moodTags.filter(t => t !== tag)
                          : [...newEntry.moodTags, tag];
                        setNewEntry({ ...newEntry, moodTags: newMoodTags });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newEntry.moodTags.includes(tag)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  value={newEntry.tags.join(', ')}
                  onChange={(e) => setNewEntry({ 
                    ...newEntry, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  placeholder="gratitude, family, work..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="private"
                  checked={newEntry.isPrivate}
                  onChange={(e) => setNewEntry({ ...newEntry, isPrivate: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="private" className="ml-2 block text-sm text-gray-700">
                  Keep this entry private
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Entry
                </Button>
              </div>
            </form>
          </Modal>

          {/* View Entry Modal */}
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            title={selectedEntry?.title || ''}
            description={`Created on ${selectedEntry ? formatDate(selectedEntry.createdAt) : ''}`}
            size="journal"
          >
            {selectedEntry && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-medium ${getMoodColor(selectedEntry.mood)}`}>
                    {getMoodLabel(selectedEntry.mood)}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(selectedEntry.createdAt)}</span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedEntry.content}
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedEntry.activities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Activities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.activities.map((activity) => (
                          <Badge key={activity} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.moodTags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Mood Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.moodTags.map((tag) => (
                          <Badge key={tag} variant="default" className="bg-blue-100 text-blue-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    {selectedEntry.wordCount} words
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}
