import { NextResponse } from 'next/server';
import { checkMongoConnection, getStorageStatus } from '@/lib/storage-fallback';

export async function GET() {
  try {
    const mongoConnected = await checkMongoConnection();
    const storageStatus = getStorageStatus();
    
    return NextResponse.json({
      mongoConnected,
      storageStatus,
      message: mongoConnected 
        ? 'Connected to MongoDB - data will be saved permanently'
        : 'MongoDB unavailable - using temporary storage until you leave the app'
    });
  } catch (error) {
    return NextResponse.json({
      mongoConnected: false,
      storageStatus: 'fallback',
      message: 'MongoDB unavailable - using temporary storage until you leave the app'
    });
  }
}