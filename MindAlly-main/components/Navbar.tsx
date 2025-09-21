'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { 
  Brain, 
  Menu, 
  X, 
  User, 
  LogOut,
  Heart,
  BookOpen,
  Target,
  MessageCircle,
  Phone,
  FileText,
  Calendar,
  Users,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export function Navbar() {
  const { user, login, register, logout, setDemoUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      toast.success('Welcome back!');
      setIsAuthModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const handleRegister = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      setIsAuthModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }, [register]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  }, [logout]);

  const handleDemoLogin = useCallback(async () => {
    try {
      setDemoUser();
      toast.success('Welcome Team Aivoria! Explore all the features.');
    } catch (error) {
      toast.error('Demo login failed. Please try again.');
      console.error('Demo login error:', error);
    }
  }, [setDemoUser]);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5 group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <div className="h-full w-full rounded-xl bg-white flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="mindGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                    {/* Modern brain/mind icon */}
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7C13 7.55 13.45 8 14 8H16C17.1 8 18 8.9 18 10V11C19.1 11 20 11.9 20 13C20 14.1 19.1 15 18 15H16C15.45 15 15 15.45 15 16V18C15 19.1 14.1 20 13 20H11C9.9 20 9 19.1 9 18V16C9 15.45 8.55 15 8 15H6C4.9 15 4 14.1 4 13C4 11.9 4.9 11 6 11V10C6 8.9 6.9 8 8 8H10C10.55 8 11 7.55 11 7V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z" fill="url(#mindGradient)" />
                    {/* Sparkle effects */}
                    <circle cx="7" cy="6" r="1" fill="#F59E0B" opacity="0.8">
                      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="17" cy="7" r="0.8" fill="#10B981" opacity="0.6">
                      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="16" cy="17" r="1.2" fill="#F472B6" opacity="0.7">
                      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300">
                  MindAlly
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Mental Wellness
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {user ? (
                <>
                  <Link href="/mood" className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 transition-all duration-300 group">
                    <Heart className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Mood</span>
                  </Link>
                  <Link href="/journal" className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 group">
                    <BookOpen className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Journal</span>
                  </Link>
                  <Link href="/meditation" className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 transition-all duration-300 group">
                    <Brain className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Meditation</span>
                  </Link>
                  <Link href="/goals" className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-violet-500 transition-all duration-300 group">
                    <Target className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Goals</span>
                  </Link>
                  <Link href="/blogs" className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 transition-all duration-300 group">
                    <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Blogs</span>
                  </Link>
                  <Link href="/therapists" className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 transition-all duration-300 group">
                    <Stethoscope className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Therapists</span>
                  </Link>
                  <Link href="/ai-chat" className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 group">
                    <MessageCircle className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">AI Chat</span>
                  </Link>
                </>
              ) : (
                <>
                  <a href="#features" className="px-3 py-1.5 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 text-sm font-medium">
                    Features
                  </a>
                  <a href="#blogs" className="px-3 py-1.5 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 text-sm font-medium">
                    Blogs
                  </a>
                  <a href="#therapists" className="px-3 py-1.5 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 text-sm font-medium">
                    Therapists
                  </a>
                  <a href="#about" className="px-3 py-1.5 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 text-sm font-medium">
                    About
                  </a>
                </>
              )}
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {user.name?.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-500">Welcome back</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    onClick={handleDemoLogin}
                    className="text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-sm font-medium px-3 py-1.5"
                  >
                    Demo
                  </Button>
                  <Button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </a>
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  About
                </a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact
                </a>
                
                {user ? (
                  <>
                    <div className="space-y-2">
                      <Link href="/mood" className="block text-gray-600 hover:text-gray-900 transition-colors">
                        Mood Tracking
                      </Link>
                      <Link href="/journal" className="block text-gray-600 hover:text-gray-900 transition-colors">
                        Journal
                      </Link>
                      <Link href="/meditation" className="block text-gray-600 hover:text-gray-900 transition-colors">
                        Meditation
                      </Link>
                      <Link href="/goals" className="block text-gray-600 hover:text-gray-900 transition-colors">
                        Goals
                      </Link>
                      <Link href="/blogs" className="block text-gray-600 hover:text-gray-900 transition-colors">
                        Blogs
                      </Link>
                      <Link href="/therapists" className="block text-gray-600 hover:text-gray-900 transition-colors">
                        Therapists
                      </Link>
                      <Link href="/ai-chat" className="block text-gray-600 hover:text-gray-900 transition-colors">
                        AI Chat
                      </Link>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {user.name?.split(' ')[0]}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="justify-start"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => setIsAuthModalOpen(true)}
                      size="sm"
                      className="justify-start"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Welcome to MindAlly"
        description="Sign in to your account or create a new one to get started."
        size="md"
      >
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                />
              </div>
              <Button type="submit" className="w-full" loading={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                />
              </div>
              <Button type="submit" className="w-full" loading={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Modal>

    </>
  );
}
