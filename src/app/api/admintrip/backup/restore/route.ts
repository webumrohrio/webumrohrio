import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated',
    message: 'Please use POST /api/admintrip/backup with file upload for restore functionality'
  }, { status: 410 })
}
