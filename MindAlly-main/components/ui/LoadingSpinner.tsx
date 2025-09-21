import { cn } from '@/lib/utils';
import { Loader2, Brain, Heart, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'mind' | 'pulse' | 'dots' | 'breathing';
  showLogo?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  fullScreen = false,
  variant = 'default',
  showLogo = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'mind':
        return (
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
            <div className="rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
            {showLogo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className={cn('text-primary-600 animate-pulse', sizeClasses[size])} />
              </div>
            )}
          </div>
        );
      
      case 'pulse':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary-600 rounded-full animate-pulse',
                  size === 'sm' ? 'h-2 w-2' : 
                  size === 'md' ? 'h-3 w-3' : 
                  size === 'lg' ? 'h-4 w-4' : 'h-6 w-6'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary-600 rounded-full animate-bounce',
                  size === 'sm' ? 'h-2 w-2' : 
                  size === 'md' ? 'h-3 w-3' : 
                  size === 'lg' ? 'h-4 w-4' : 'h-6 w-6'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );
      
      case 'breathing':
        return (
          <div className="relative">
            <div className={cn(
              'bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse',
              sizeClasses[size]
            )} style={{ animationDuration: '2s' }} />
            <div className={cn(
              'absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full animate-ping opacity-75',
              sizeClasses[size]
            )} style={{ animationDuration: '2s' }} />
          </div>
        );
      
      default:
        return (
          <Loader2 
            className={cn(
              'animate-spin text-primary-600',
              sizeClasses[size],
              className
            )} 
          />
        );
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderSpinner()}
      {text && (
        <div className="text-center">
          <p className="text-sm text-gray-600 animate-pulse font-medium">
            {text}
          </p>
          {variant === 'mind' && (
            <p className="text-xs text-gray-500 mt-1 animate-fade-in">
              Taking care of your mental wellness...
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 backdrop-blur-sm">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200/50 animate-fade-in">
          {showLogo && (
            <div className="flex items-center justify-center mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center animate-float">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
          {content}
        </div>
      </div>
    );
  }

  return content;
}
