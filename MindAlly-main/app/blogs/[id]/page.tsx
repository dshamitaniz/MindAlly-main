'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  User,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark
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

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      // Mock blog posts data (same as in blogs page)
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Understanding Anxiety in Indian Context: A Complete Guide',
          excerpt: 'Learn about anxiety disorders prevalent in India, cultural factors affecting mental health, and effective coping strategies for Indian families.',
          content: `
            <h2>Understanding Anxiety in Indian Society</h2>
            <p>Anxiety is a natural response to stress, but in Indian society, it often manifests differently due to cultural pressures and societal expectations. This comprehensive guide explores the unique aspects of anxiety disorders in the Indian context.</p>
            
            <h3>Cultural Factors Affecting Mental Health</h3>
            <p>Indian families often face unique stressors including:</p>
            <ul>
              <li>Academic pressure and competitive examinations (JEE, NEET, etc.)</li>
              <li>Family expectations and arranged marriages</li>
              <li>Joint family dynamics and generational conflicts</li>
              <li>Career pressures and job market competition</li>
              <li>Social stigma around mental health discussions</li>
            </ul>
            
            <h3>Recognizing Anxiety Symptoms</h3>
            <p>Common anxiety symptoms in Indian context include:</p>
            <ul>
              <li>Excessive worry about family honor and reputation</li>
              <li>Physical symptoms like headaches and stomach issues</li>
              <li>Sleep disturbances due to overthinking</li>
              <li>Avoidance of social situations or family gatherings</li>
              <li>Difficulty making decisions independently</li>
            </ul>
            
            <h3>Effective Coping Strategies</h3>
            <p>Here are culturally appropriate coping strategies:</p>
            <ul>
              <li>Practice traditional meditation techniques like Vipassana</li>
              <li>Engage in yoga and pranayama exercises</li>
              <li>Seek support from trusted family members or friends</li>
              <li>Consider professional counseling with culturally aware therapists</li>
              <li>Join support groups for people with similar experiences</li>
            </ul>
            
            <h3>When to Seek Professional Help</h3>
            <p>It's important to seek professional help when anxiety significantly impacts your daily life, relationships, or work performance. Remember, seeking help is a sign of strength, not weakness.</p>
          `,
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
          content: `
            <h2>The Ancient Wisdom of Indian Meditation</h2>
            <p>India has been the birthplace of meditation for thousands of years, with practices like Vipassana and Yoga Nidra offering profound benefits for modern mental health challenges.</p>
            
            <h3>Vipassana Meditation</h3>
            <p>Vipassana, meaning "to see things as they really are," is one of India's most ancient meditation techniques. This practice involves:</p>
            <ul>
              <li>Mindful observation of breath and bodily sensations</li>
              <li>Developing equanimity towards pleasant and unpleasant experiences</li>
              <li>Understanding the impermanent nature of all phenomena</li>
            </ul>
            
            <h3>Yoga Nidra</h3>
            <p>Often called "yogic sleep," Yoga Nidra is a powerful relaxation technique that:</p>
            <ul>
              <li>Reduces stress and anxiety</li>
              <li>Improves sleep quality</li>
              <li>Enhances creativity and problem-solving abilities</li>
              <li>Promotes deep physical and mental relaxation</li>
            </ul>
            
            <h3>Pranayama Breathing Techniques</h3>
            <p>Pranayama, the practice of breath control, includes various techniques:</p>
            <ul>
              <li>Anulom Vilom (Alternate Nostril Breathing)</li>
              <li>Bhramari (Bee Breath)</li>
              <li>Ujjayi (Ocean Breath)</li>
              <li>Kapalbhati (Skull Shining Breath)</li>
            </ul>
            
            <h3>Integrating Ancient Practices in Modern Life</h3>
            <p>To incorporate these practices into your daily routine:</p>
            <ul>
              <li>Start with just 10-15 minutes daily</li>
              <li>Find a quiet space in your home</li>
              <li>Use guided meditation apps or videos</li>
              <li>Join local meditation groups or classes</li>
              <li>Be patient and consistent with your practice</li>
            </ul>
          `,
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
        }
      ];

      const foundPost = mockPosts.find(p => p.id === params.id);
      setPost(foundPost || null);
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/blogs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.push('/blogs')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>

          {/* Article Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="mb-6">
                <Badge className="mb-4">
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {post.excerpt}
                </p>
              </div>

              {/* Author and Meta Info */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.author}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime} min read
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {post.views} views
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {post.likes} likes
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments} comments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like ({post.likes})
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comment ({post.comments})
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}