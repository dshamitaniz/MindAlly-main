'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Database, X } from 'lucide-react';

interface StorageStatus {
  mongoConnected: boolean;
  storageStatus: 'mongodb' | 'fallback' | 'demo';
  message: string;
}

export function StorageStatusBanner() {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/storage-status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to check storage status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!status || status.mongoConnected || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                Database Connection Issue
              </p>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              {status.message}
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 ml-4 text-amber-400 hover:text-amber-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}