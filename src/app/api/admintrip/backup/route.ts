import { NextRequest, NextResponse } from 'next/server'
import { exportDatabase, getDatabaseStats, importDatabase } from '@/lib/database-backup'

// GET - Export database or get stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // Export database
    if (action === 'export') {
      const sql = await exportDatabase()
      const filename = `backup-${new Date().toISOString().split('T')[0]}.sql`
      
      return new NextResponse(sql, {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': Buffer.byteLength(sql).toString()
        }
      })
    }
    
    // Get database stats
    const stats = await getDatabaseStats()
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Database backup available for download'
    })
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process backup request' },
      { status: 500 }
    )
  }
}

// POST - Restore database from SQL file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!file.name.endsWith('.sql')) {
      return NextResponse.json(
        { success: false, error: 'Only .sql files are supported' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum 10MB' },
        { status: 400 }
      )
    }
    
    // Read file content
    const sql = await file.text()
    
    // Import database
    await importDatabase(sql)
    
    return NextResponse.json({
      success: true,
      message: 'Database restored successfully'
    })
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to restore database: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
