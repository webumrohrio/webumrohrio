import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated',
    message: 'Please use /api/admintrip/backup?action=export for database export'
  }, { status: 410 })
}

/*
// Old implementation - commented out
import fs from 'fs'
import path from 'path'

const BACKUP_DIR = path.join(process.cwd(), 'backups')

export async function GET_OLD(request: NextRequest) {
  try {
    // Check if running on Vercel (read-only filesystem)
    const isVercel = process.env.VERCEL === '1'
    
    if (isVercel) {
      return NextResponse.json({
        success: false,
        error: 'Backup download is disabled on Vercel',
        message: 'Use Neon Console to export your database.',
        info: 'Visit https://console.neon.tech to manage backups.'
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('file')

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      )
    }

    const filePath = path.join(BACKUP_DIR, filename)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 404 }
      )
    }

    const fileBuffer = fs.readFileSync(filePath)
    const stats = fs.statSync(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': stats.size.toString()
      }
    })
  } catch (error) {
    console.error('Error downloading backup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download backup' },
      { status: 500 }
    )
  }
}
*/
