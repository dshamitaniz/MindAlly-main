'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  Heart,
  Share2,
  Bookmark,
  Tag,
  ArrowRight,
  TrendingUp,
  Star,
  Eye,
  MessageCircle,
  ThumbsUp,
  BookOpen,
  Brain,
  Shield,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  image?: string;
}

const categories = [
  { id: 'all', name: 'All Posts', icon: FileText, color: 'from-gray-500 to-slate-500' },
  { id: 'anxiety', name: 'Anxiety & Stress', icon: Brain, color: 'from-red-500 to-pink-500' },
  { id: 'depression', name: 'Depression', icon: Heart, color: 'from-blue-500 to-indigo-500' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Shield, color: 'from-green-500 to-emerald-500' },
  { id: 'relationships', name: 'Relationships', icon: User, color: 'from-purple-500 to-violet-500' },
  { id: 'self-care', name: 'Self-Care', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
  { id: 'therapy', name: 'Therapy & Treatment', icon: Target, color: 'from-teal-500 to-cyan-500' },
  { id: 'wellness', name: 'Wellness Tips', icon: Zap, color: 'from-pink-500 to-rose-500' }
];

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const fetchPosts = async () => {
    try {
      // Always show demo data for public access
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Understanding Anxiety in Indian Context: A Complete Guide',
          excerpt: 'Learn about anxiety disorders prevalent in India, cultural factors affecting mental health, and effective coping strategies for Indian families.',
          content: 'Anxiety is a natural response to stress, but in Indian society, it often manifests differently due to cultural pressures...',
          author: 'Dr. Priya Sharma',
          authorAvatar: '/avatars/priya.jpg',
          category: 'anxiety',
          tags: ['anxiety', 'mental-health', 'indian-context', 'family-pressure'],
          publishedAt: new Date('2024-01-15'),
          readTime: 8,
          views: 1250,
          likes: 89,
          comments: 23,
          featured: true,
          image: '/blog-images/anxiety-guide.jpg'
        },
        {
          id: '2',
          title: 'Ancient Indian Meditation Techniques for Modern Life',
          excerpt: 'Discover traditional Indian meditation practices like Vipassana, Yoga Nidra, and Pranayama that can transform your mental health.',
          content: 'India has been the birthplace of meditation for thousands of years, with practices like Vipassana and Yoga Nidra...',
          author: 'Dr. Rajesh Kumar',
          authorAvatar: '/avatars/rajesh.jpg',
          category: 'mindfulness',
          tags: ['meditation', 'mindfulness', 'yoga', 'pranayama', 'indian-traditions'],
          publishedAt: new Date('2024-01-12'),
          readTime: 6,
          views: 980,
          likes: 67,
          comments: 15,
          featured: true,
          image: '/blog-images/mindfulness.jpg'
        },
        {
          id: '3',
          title: 'Navigating Family Dynamics in Indian Households',
          excerpt: 'Learn how to maintain healthy relationships with extended family, handle generational conflicts, and balance traditional values with modern life.',
          content: 'Indian families have unique dynamics with joint families, arranged marriages, and strong cultural traditions...',
          author: 'Dr. Anjali Mehta',
          authorAvatar: '/avatars/anjali.jpg',
          category: 'relationships',
          tags: ['relationships', 'family', 'indian-culture', 'generation-gap', 'joint-family'],
          publishedAt: new Date('2024-01-10'),
          readTime: 10,
          views: 756,
          likes: 45,
          comments: 12,
          featured: false,
          image: '/blog-images/relationships.jpg'
        },
        {
          id: '4',
          title: 'Self-Care for Indian Women: Balancing Family and Personal Needs',
          excerpt: 'Practical self-care strategies that respect Indian cultural values while prioritizing your mental health and wellbeing.',
          content: 'In Indian culture, women often prioritize family needs over their own wellbeing. However, self-care is essential...',
          author: 'Dr. Sushma Reddy',
          authorAvatar: '/avatars/sushma.jpg',
          category: 'self-care',
          tags: ['self-care', 'women', 'indian-culture', 'family-balance', 'wellness'],
          publishedAt: new Date('2024-01-08'),
          readTime: 5,
          views: 634,
          likes: 38,
          comments: 8,
          featured: false,
          image: '/blog-images/self-care.jpg'
        },
        {
          id: '5',
          title: 'Depression in India: Breaking the Stigma and Finding Support',
          excerpt: 'Understanding depression in Indian society, overcoming cultural stigma, and finding appropriate mental health support.',
          content: 'Depression affects millions in India, but cultural stigma often prevents people from seeking help...',
          author: 'Dr. Vikram Singh',
          authorAvatar: '/avatars/vikram.jpg',
          category: 'depression',
          tags: ['depression', 'mental-health', 'stigma', 'indian-society', 'support'],
          publishedAt: new Date('2024-01-05'),
          readTime: 12,
          views: 892,
          likes: 72,
          comments: 19,
          featured: true,
          image: '/blog-images/depression.jpg'
        },
        {
          id: '6',
          title: 'Sleep and Mental Health: Indian Lifestyle Challenges',
          excerpt: 'Understanding sleep disorders in Indian urban life, dealing with noise pollution, and creating better sleep habits.',
          content: 'Sleep quality in Indian cities is affected by noise pollution, late work hours, and family dynamics...',
          author: 'Dr. Arjun Patel',
          authorAvatar: '/avatars/arjun.jpg',
          category: 'wellness',
          tags: ['sleep', 'mental-health', 'urban-life', 'noise-pollution', 'indian-lifestyle'],
          publishedAt: new Date('2024-01-03'),
          readTime: 7,
          views: 567,
          likes: 41,
          comments: 6,
          featured: false,
          image: '/blog-images/sleep.jpg'
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'most-viewed':
          return b.views - a.views;
        case 'most-liked':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

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
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <BookOpen className="h-10 w-10 mr-3 text-primary-600" />
              Mental Health Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover insights, tips, and expert advice to support your mental wellness journey
            </p>
          </div>
        </div>

        {/* Featured Posts */}
        {(() => {
          const featuredPosts = filteredPosts.filter(post => post.featured);
          return featuredPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="h-6 w-6 mr-2 text-yellow-500" />
                Featured Articles
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-600">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-primary-600">
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary-200 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-primary-100 text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-500">{formatDate(post.publishedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime} min read
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="group-hover:text-primary-600"
                        onClick={() => window.location.href = `/blogs/${post.id}`}
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-viewed">Most Viewed</option>
                    <option value="most-liked">Most Liked</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className={`p-1 rounded bg-gradient-to-r ${category.color}`}>
                  <category.icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    className={`bg-gradient-to-r ${getCategoryInfo(post.category).color} text-white`}
                  >
                    {getCategoryInfo(post.category).name}
                  </Badge>
                  {post.featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-primary-600 transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600">{post.author}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.publishedAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime} min
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.views}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {post.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="group-hover:text-primary-600"
                    onClick={() => window.location.href = `/blogs/${post.id}`}
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No blog posts available at the moment'
              }
            </p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                Get the latest mental health insights, tips, and resources delivered to your inbox weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button className="bg-white text-primary-600 hover:bg-gray-100">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </>
  );
}
