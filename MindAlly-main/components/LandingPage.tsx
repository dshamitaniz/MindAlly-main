'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Heart, 
  Brain, 
  BookOpen, 
  Target, 
  Users, 
  MessageCircle, 
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  FileText,
  Stethoscope,
  User,
  Clock,
  DollarSign,
  Calendar,
  Eye
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function LandingPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleDemoLogin = useCallback(async () => {
    try {
      await login('demo@mind.ally', 'demo@1234');
      toast.success('Welcome to the demo account! Explore all the features.');
    } catch (error) {
      toast.error('Demo login failed. Please try again.');
      console.error('Demo login error:', error);
    }
  }, [login]);

  const features = [
    {
      icon: Heart,
      title: 'Mood Tracking',
      description: 'Track your daily mood and emotions with our intuitive interface.',
    },
    {
      icon: BookOpen,
      title: 'Journaling',
      description: 'Express yourself through guided journaling templates and free-form writing.',
    },
    {
      icon: Brain,
      title: 'Meditation & Wellness',
      description: 'Access breathing exercises, sleep tools, and mindfulness practices.',
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and track personal goals with our comprehensive goal management system.',
    },
    {
      icon: FileText,
      title: 'Mental Health Blog',
      description: 'Read expert articles and insights on mental health and wellness.',
    },
    {
      icon: Users,
      title: 'Therapist Directory',
      description: 'Find and connect with verified mental health professionals.',
    },
    {
      icon: MessageCircle,
      title: 'AI Companion',
      description: 'Get support from our AI assistant with crisis detection and safety features.',
    },
    {
      icon: Stethoscope,
      title: 'Therapist Registration',
      description: 'Join our network as a licensed mental health professional.',
    },
  ];

  const stats = [
    { label: 'Users Helped', value: '10,000+' },
    { label: 'Mood Entries', value: '500,000+' },
    { label: 'Journal Entries', value: '1M+' },
    { label: 'Meditation Sessions', value: '250,000+' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Your Mental Health Companion
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed">
              Track your mood, journal your thoughts, practice mindfulness, and connect with professionals. 
              Take control of your mental wellness journey with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                variant="gradient" 
                className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => {
                  // Scroll to sign up section or open auth modal
                  const authSection = document.getElementById('auth-section');
                  if (authSection) {
                    authSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleDemoLogin}
              >
                Try Demo Account
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>Privacy first</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools and resources you need to support your mental health journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border-2 border-gray-100 hover:border-primary-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Mental Health Blog
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover insights, tips, and expert advice to support your mental wellness journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Understanding Anxiety in Indian Context',
                excerpt: 'Learn about anxiety disorders prevalent in India and cultural factors affecting mental health.',
                author: 'Dr. Priya Sharma',
                readTime: '8 min read',
                category: 'Anxiety & Stress',
                image: 'bg-gradient-to-r from-red-500 to-pink-500'
              },
              {
                title: 'Ancient Indian Meditation Techniques',
                excerpt: 'Discover traditional Indian meditation practices like Vipassana and Yoga Nidra.',
                author: 'Dr. Rajesh Kumar',
                readTime: '6 min read',
                category: 'Mindfulness',
                image: 'bg-gradient-to-r from-green-500 to-emerald-500'
              },
              {
                title: 'Navigating Indian Family Dynamics',
                excerpt: 'Learn how to maintain healthy relationships in Indian households and joint families.',
                author: 'Dr. Anjali Mehta',
                readTime: '10 min read',
                category: 'Relationships',
                image: 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }
            ].map((post, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className={`h-48 ${post.image} relative`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-700">
                      {post.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-gray-200 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-100 text-sm line-clamp-2">
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
                        <p className="text-xs text-gray-500">{post.readTime}</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:text-primary-600"
                    onClick={() => router.push('/blogs')}
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              onClick={() => router.push('/blogs')}
            >
              View All Articles
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Therapists Section */}
      <section id="therapists" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Find Your Therapist
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with licensed mental health professionals who can help you on your wellness journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Priya Sharma',
                title: 'Clinical Psychologist',
                specializations: ['Anxiety Disorders', 'Depression', 'Trauma & PTSD'],
                rating: 4.9,
                reviewCount: 156,
                price: 2500,
                experience: 12,
                verified: true
              },
              {
                name: 'Dr. Rajesh Kumar',
                title: 'Marriage and Family Therapist',
                specializations: ['Relationship Issues', 'Couples Therapy', 'Family Therapy'],
                rating: 4.8,
                reviewCount: 98,
                price: 2000,
                experience: 8,
                verified: true
              },
              {
                name: 'Dr. Anjali Mehta',
                title: 'Clinical Social Worker',
                specializations: ['Trauma & PTSD', 'Grief & Loss', 'Women&apos;s Issues'],
                rating: 4.9,
                reviewCount: 203,
                price: 2200,
                experience: 15,
                verified: true
              }
            ].map((therapist, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{therapist.name}</CardTitle>
                        <CardDescription>{therapist.title}</CardDescription>
                      </div>
                    </div>
                    {therapist.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {therapist.rating} ({therapist.reviewCount} reviews)
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {therapist.experience} years
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-1">
                        {therapist.specializations.slice(0, 2).map((spec, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {therapist.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{therapist.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ₹{therapist.price}/hr
                        </div>
                      </div>
                    </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push('/therapists')}
                        > 
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push('/therapists')}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Book Session
                        </Button>
                      </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              onClick={() => router.push('/therapists')}
            >
              Browse All Therapists
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              About Mind
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We&apos;re on a mission to make mental health care accessible, affordable, and effective for everyone
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide comprehensive mental health support through technology, making care accessible to everyone, everywhere.
              </p>
            </Card>
            <Card className="text-center p-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600">
                Your data is protected with end-to-end encryption and we never share your personal information without consent.
              </p>
            </Card>
            <Card className="text-center p-8">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Network</h3>
              <p className="text-gray-600">
                Our network of licensed mental health professionals is carefully vetted and verified to ensure quality care.
              </p>
            </Card>
          </div>
        </div>
      </section>


      {/* Safety Notice */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <h3 className="text-2xl font-bold">Your Safety is Our Priority</h3>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Our AI assistant includes advanced crisis detection and will immediately connect you with 
              professional help if you&apos;re experiencing thoughts of self-harm. Your privacy and safety are protected.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                End-to-end encryption
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Crisis detection
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Professional resources
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Privacy-first design
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Mind</span>
              </div>
              <p className="text-gray-400">
                Your comprehensive mental health companion for a better tomorrow.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mood Tracking</li>
                <li>Journaling</li>
                <li>Meditation</li>
                <li>Goal Setting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Crisis Resources</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mental Health Blog</li>
                <li>Therapist Directory</li>
                <li>Assessment Tools</li>
                <li>Community</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mind. All rights reserved. Built with care for your mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
