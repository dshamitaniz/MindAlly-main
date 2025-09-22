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

  // Don't show banner - JSON storage is intentional
  return null;
}