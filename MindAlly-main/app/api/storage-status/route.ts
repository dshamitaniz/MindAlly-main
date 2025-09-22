import { NextResponse } from 'next/server';
import { checkMongoConnection, getStorageStatus } from '@/lib/storage-fallback';

export async function GET() {
  try {
    const mongoConnected = await checkMongoConnection();
    const storageStatus = getStorageStatus();
    
    return NextResponse.json({
      mongoConnected: false,
      storageStatus: 'fallback',
      message: 'Using temporary JSON storage - data will be cleared when you leave the app'
    });
  } catch (error) {
    return NextResponse.json({
      mongoConnected: false,
      storageStatus: 'fallback',
      message: 'Using temporary JSON storage - data will be cleared when you leave the app'
    });
  }
}