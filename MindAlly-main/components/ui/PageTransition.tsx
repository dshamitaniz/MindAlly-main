'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export function PageTransition({ 
  children, 
  isLoading = false, 
  loadingText = 'Loading...' 
}: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsTransitioning(true);
      return; // Add explicit return for consistency
    } else {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isTransitioning || isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner 
          fullScreen 
          variant="mind" 
          showLogo 
          text={loadingText}
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}

