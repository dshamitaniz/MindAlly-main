'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LoadingProviderProps {
  children: React.ReactNode;
}

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingText: string;
  setLoadingText: (text: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const router = useRouter();

  // Handle page refresh loading
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsLoading(true);
      setLoadingText('Saving your progress...');
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
      setLoadingText('Navigating...');
    };

    const handleRouteChangeComplete = () => {
      setIsLoading(false);
    };

    // Listen for navigation events
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args: Parameters<typeof originalPush>) => {
      handleRouteChangeStart();
      try {
        const result = originalPush.apply(router, args) as Promise<boolean> | void;
        // Always treat as a promise for consistency
        if (result && typeof result === 'object' && 'then' in result) {
          return result.finally(() => {
            setTimeout(handleRouteChangeComplete, 500);
          });
        } else {
          // If it's not a promise, just set a timeout
          setTimeout(handleRouteChangeComplete, 500);
          return Promise.resolve(true);
        }
      } catch (error) {
        setTimeout(handleRouteChangeComplete, 500);
        throw error;
      }
    };

    router.replace = (...args: Parameters<typeof originalReplace>) => {
      handleRouteChangeStart();
      try {
        const result = originalReplace.apply(router, args) as Promise<boolean> | void;
        // Always treat as a promise for consistency
        if (result && typeof result === 'object' && 'then' in result) {
          return result.finally(() => {
            setTimeout(handleRouteChangeComplete, 500);
          });
        } else {
          // If it's not a promise, just set a timeout
          setTimeout(handleRouteChangeComplete, 500);
          return Promise.resolve(true);
        }
      } catch (error) {
        setTimeout(handleRouteChangeComplete, 500);
        throw error;
      }
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const value = {
    isLoading,
    setLoading,
    loadingText,
    setLoadingText,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
