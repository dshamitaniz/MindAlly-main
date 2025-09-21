'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Heart, 
  BookOpen, 
  Brain, 
  Target, 
  Clock,
  Calendar,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function ActivityPage() {
  const router = useRouter();
  const activities = [
    {
      type: 'mood',
      title: 'Mood Entry',
      description: 'You logged your mood as Happy',
      time: '2 hours ago',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      type: 'journal',
      title: 'Journal Entry',
      description: 'You wrote about your day - "Had a great morning walk and felt energized"',
      time: '1 day ago',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      type: 'meditation',
      title: 'Meditation Session',
      description: 'You completed a 10-minute breathing exercise',
      time: '2 days ago',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: Brain,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      type: 'goal',
      title: 'Goal Progress',
      description: 'You updated progress on "Exercise 3 times a week"',
      time: '3 days ago',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      type: 'mood',
      title: 'Mood Entry',
      description: 'You logged your mood as Calm',
      time: '4 days ago',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      type: 'meditation',
      title: 'Meditation Session',
      description: 'You completed a 15-minute mindfulness session',
      time: '5 days ago',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: Brain,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'mood': return 'Mood Tracking';
      case 'journal': return 'Journaling';
      case 'meditation': return 'Meditation';
      case 'goal': return 'Goals';
      default: return 'Activity';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'mood': return 'bg-red-100 text-red-800';
      case 'journal': return 'bg-blue-100 text-blue-800';
      case 'meditation': return 'bg-green-100 text-green-800';
      case 'goal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity History</h1>
            <p className="text-gray-600">
              Track your wellness journey and see your progress over time
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mood Entries</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Meditations</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <Brain className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Journal Entries</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-3 rounded-full ${activity.bgColor}`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {activity.title}
                        </h3>
                        <Badge className={getActivityTypeColor(activity.type)}>
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(activity.date)} • {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}