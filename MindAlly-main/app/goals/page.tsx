'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Navbar } from '@/components/Navbar';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Star,
  Filter,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'mental-health' | 'wellness' | 'productivity' | 'personal' | 'fitness' | 'learning' | 'spiritual' | 'family';
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  targetDate: string;
  createdAt: string;
  completedAt?: string;
  progress: number;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

const CATEGORY_COLORS = {
  'mental-health': 'bg-pink-100 text-pink-800',
  'wellness': 'bg-green-100 text-green-800',
  'productivity': 'bg-blue-100 text-blue-800',
  'personal': 'bg-purple-100 text-purple-800',
  'fitness': 'bg-orange-100 text-orange-800',
  'learning': 'bg-indigo-100 text-indigo-800',
  'spiritual': 'bg-yellow-100 text-yellow-800',
  'family': 'bg-red-100 text-red-800',
};

const PRIORITY_COLORS = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  'not-started': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'paused': 'bg-yellow-100 text-yellow-800',
};

export default function GoalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed' | 'paused'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'target' | 'priority' | 'progress'>('created');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'wellness' as Goal['category'],
    priority: 'medium' as Goal['priority'],
    targetDate: '',
  });

  // Load goals from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGoals = localStorage.getItem('mind-goals');
      if (savedGoals) {
        try {
          setGoals(JSON.parse(savedGoals));
        } catch (error) {
          console.error('Failed to parse saved goals:', error);
          localStorage.removeItem('mind-goals');
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && goals.length > 0) {
      localStorage.setItem('mind-goals', JSON.stringify(goals));
    }
  }, [goals]);

  const handleAddGoal = useCallback(() => {
    if (!formData.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'not-started',
      targetDate: formData.targetDate,
      createdAt: new Date().toISOString(),
      progress: 0,
      milestones: [],
    };

    setGoals(prev => [...prev, newGoal]);
    setFormData({
      title: '',
      description: '',
      category: 'wellness',
      priority: 'medium',
      targetDate: '',
    });
    setShowAddGoal(false);
    toast.success('Goal added successfully!');
  }, [formData]);

  const handleUpdateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
    setEditingGoal(null);
    toast.success('Goal updated successfully!');
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast.success('Goal deleted successfully!');
  }, []);

  const handleStatusChange = useCallback((id: string, status: Goal['status']) => {
    const updates: Partial<Goal> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
      updates.progress = 100;
    } else if (status === 'not-started') {
      updates.progress = 0;
    }
    handleUpdateGoal(id, updates);
  }, [handleUpdateGoal]);

  const handleProgressChange = useCallback((id: string, progress: number) => {
    const updates: Partial<Goal> = { progress };
    if (progress === 100) {
      updates.status = 'completed';
      updates.completedAt = new Date().toISOString();
    } else if (progress > 0) {
      updates.status = 'in-progress';
    }
    handleUpdateGoal(id, updates);
  }, [handleUpdateGoal]);

  const filteredGoals = goals
    .filter(goal => {
      if (filter !== 'all' && goal.status !== filter) return false;
      if (searchTerm && !goal.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'target':
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in-progress').length,
    overdue: goals.filter(g => 
      g.status !== 'completed' && 
      new Date(g.targetDate) < new Date()
    ).length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to access your goals and track your progress.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Goals & Progress</h1>
              <p className="text-gray-600">Track your mental health and wellness journey</p>
            </div>
            <Button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Goal</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Goals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Target className="h-8 w-8 text-primary-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                  </div>
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="created">Sort by Created</option>
                <option value="target">Sort by Target Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="progress">Sort by Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {goals.length === 0 
                    ? 'Start your journey by adding your first goal!'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {goals.length === 0 && (
                  <Button onClick={() => setShowAddGoal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Goal
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredGoals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <Badge className={CATEGORY_COLORS[goal.category]}>
                          {goal.category.replace('-', ' ')}
                        </Badge>
                        <Badge className={PRIORITY_COLORS[goal.priority]}>
                          {goal.priority}
                        </Badge>
                        <Badge className={STATUS_COLORS[goal.status]}>
                          {goal.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{goal.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4" />
                          <span>{goal.progress}% Complete</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(goal.id, 'not-started')}
                        className={goal.status === 'not-started' ? 'bg-gray-100' : ''}
                      >
                        <Circle className="h-4 w-4 mr-1" />
                        Not Started
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(goal.id, 'in-progress')}
                        className={goal.status === 'in-progress' ? 'bg-blue-100' : ''}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        In Progress
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(goal.id, 'completed')}
                        className={goal.status === 'completed' ? 'bg-green-100' : ''}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Progress:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => handleProgressChange(goal.id, parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">{goal.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Add New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter goal title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your goal"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="mental-health">Mental Health</option>
                      <option value="wellness">Wellness</option>
                      <option value="productivity">Productivity</option>
                      <option value="personal">Personal</option>
                      <option value="fitness">Fitness</option>
                      <option value="learning">Learning</option>
                      <option value="spiritual">Spiritual</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Target Date</label>
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddGoal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddGoal}>
                    Add Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Goal Modal */}
        {editingGoal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Edit Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                  <Input
                    value={editingGoal.title}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="Enter goal title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <Textarea
                    value={editingGoal.description}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Describe your goal"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <select
                      value={editingGoal.category}
                      onChange={(e) => setEditingGoal(prev => prev ? { ...prev, category: e.target.value as Goal['category'] } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="mental-health">Mental Health</option>
                      <option value="wellness">Wellness</option>
                      <option value="productivity">Productivity</option>
                      <option value="personal">Personal</option>
                      <option value="fitness">Fitness</option>
                      <option value="learning">Learning</option>
                      <option value="spiritual">Spiritual</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                    <select
                      value={editingGoal.priority}
                      onChange={(e) => setEditingGoal(prev => prev ? { ...prev, priority: e.target.value as Goal['priority'] } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Target Date</label>
                  <Input
                    type="date"
                    value={editingGoal.targetDate}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, targetDate: e.target.value } : null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingGoal(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    if (editingGoal) {
                      handleUpdateGoal(editingGoal.id, editingGoal);
                    }
                  }}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </>
  );
}










