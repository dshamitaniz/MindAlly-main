'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Brain, Play } from 'lucide-react';

interface DemoLoginProps {
  onLogin: (user: any) => void;
}

export function DemoLogin({ onLogin }: DemoLoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@mindally.com',
          password: 'demo123'
        })
      });

      if (response.ok) {
        const { user } = await response.json();
        onLogin(user);
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MindAlly Demo
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Experience AI-powered mental health support
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">✨ Demo Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI Mental Health Assistant</li>
              <li>• Crisis Detection & Support</li>
              <li>• Multilingual Voice Support</li>
              <li>• Temporary Data Storage</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This is a demo version. All data will be stored temporarily and deleted when you leave.
            </p>
          </div>

          <Button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            Start Demo Experience
          </Button>

          <div className="text-center text-xs text-gray-500">
            Demo Credentials: demo@mindally.com / demo123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}