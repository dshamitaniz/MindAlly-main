'use client';

import { useState } from 'react';
import { DemoLogin } from '@/components/DemoLogin';
import { Dashboard } from '@/components/Dashboard';
import { Navbar } from '@/components/Navbar';
import { AIChatbot } from '@/components/AIChatbot';

export default function DemoPage() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <DemoLogin onLogin={setUser} />;
  }

  return (
    <div className="demo-mode">
      <Navbar />
      <div className="bg-purple-100 border-b border-purple-200 p-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-purple-800 font-medium">🎭 Demo Mode Active</span>
            <span className="text-purple-600 text-sm">- All data is temporary and will be cleared when you leave</span>
          </div>
        </div>
      </div>
      <Dashboard />
      <AIChatbot />
    </div>
  );
}