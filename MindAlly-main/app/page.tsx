'use client';

import { useAuth } from '@/contexts/AuthProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import { useLoading } from '@/contexts/LoadingProvider';
import { useEffect, useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { LandingPage } from '@/components/LandingPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AIChatbot } from '@/components/AIChatbot';
import { Navbar } from '@/components/Navbar';
import { MultilingualDemo } from '@/components/MultilingualDemo';
import { StorageStatusBanner } from '@/components/StorageStatusBanner';

export default function Home() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { isLoading: globalLoading, setLoading, setLoadingText: setGlobalLoadingText } = useLoading();
  const [mounted, setMounted] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Progressive loading text for better UX
    const loadingMessages = [
      'Initializing...',
      'Loading your wellness journey...',
      'Preparing your dashboard...',
      'Almost ready...'
    ];
    
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Update global loading state
  useEffect(() => {
    if (loading) {
      setLoading(true);
      setGlobalLoadingText('Authenticating...');
    } else {
      setLoading(false);
    }
  }, [loading, setLoading, setGlobalLoadingText]);

  if (!mounted) {
    return (
      <LoadingSpinner 
        fullScreen 
        variant="mind" 
        showLogo 
        text={loadingText}
        size="xl"
      />
    );
  }

  if (loading || globalLoading) {
    return (
      <LoadingSpinner 
        fullScreen 
        variant="breathing" 
        showLogo 
        text={globalLoading ? "Loading..." : "Authenticating..."}
        size="xl"
      />
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      <Navbar />
      <StorageStatusBanner />
      <Dashboard />
      <AIChatbot />
    </>
  );
}
