import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // This endpoint helps ensure a session exists
  // It can be called before cart operations
  return NextResponse.json({ 
    success: true,
    timestamp: new Date().toISOString()
  });
}