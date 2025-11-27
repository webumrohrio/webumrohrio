import { NextRequest, NextResponse } from 'next/server'

import { exportDatabase, getDatabaseStats } from '@/lib/database-backup'

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

// Old GET function (commented out)
/*
export async function GET_OLD() {
  try {
    // Check if running on Vercel (read-only filesystem)
    const isVercel = process.env.VERCEL === '1'
    
    if (isVercel) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Backup feature is disabled on Vercel. Use Neon database backups instead.',
        info: 'Database backups are automatically handled by Neon PostgreSQL. Visit https://console.neon.tech for backup management.'
      })
    }

    await ensureBackupDir()

    const files = await readdir(BACKUP_DIR)
    const backups = await Promise.all(
      files
        .filter(file => file.endsWith('.zip') || file.endsWith('.db'))
        .map(async (file) => {
          const filePath = path.join(BACKUP_DIR, file)
          const stats = await stat(filePath)
          
          return {
            filename: file,
            size: stats.size,
            date: stats.mtime.toISOString(),
            type: file.includes('full') ? 'full' : 'database'
          }
        })
    )

    // Sort by date descending
    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      data: backups
    })
  } catch (error) {
    console.error('Error listing backups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list backups' },
      { status: 500 }
    )
  }
}

import { importDatabase } from '@/lib/database-backup'

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

// Old POST function (commented out)
/*
export async function POST_OLD(request: NextRequest) {
  try {
    // Check if running on Vercel (read-only filesystem)
    const isVercel = process.env.VERCEL === '1'
    
    if (isVercel) {
      return NextResponse.json({
        success: false,
        error: 'Backup feature is disabled on Vercel',
        message: 'Database backups are automatically handled by Neon PostgreSQL. Visit https://console.neon.tech for backup management.',
        info: 'Neon provides automatic daily backups and point-in-time recovery.'
      }, { status: 400 })
    }

    const body = await request.json()
    const { type } = body // 'database' or 'full'

    await ensureBackupDir()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
    
    if (type === 'database') {
      // Backup database only
      const backupFilename = `backup-db-${timestamp}.db`
      const backupPath = path.join(BACKUP_DIR, backupFilename)

      if (!fs.existsSync(DB_PATH)) {
        return NextResponse.json(
          { success: false, error: 'Database file not found' },
          { status: 404 }
        )
      }

      await copyFile(DB_PATH, backupPath)

      return NextResponse.json({
        success: true,
        message: 'Database backup created successfully',
        filename: backupFilename
      })
    } else if (type === 'full') {
      // Backup database + uploads
      const backupFilename = `backup-full-${timestamp}.zip`
      const backupPath = path.join(BACKUP_DIR, backupFilename)

      const output = fs.createWriteStream(backupPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          resolve(NextResponse.json({
            success: true,
            message: 'Full backup created successfully',
            filename: backupFilename,
            size: archive.pointer()
          }))
        })

        archive.on('error', (err) => {
          reject(NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
          ))
        })

        archive.pipe(output)

        // Add database
        if (fs.existsSync(DB_PATH)) {
          archive.file(DB_PATH, { name: 'database/custom.db' })
        }

        // Add uploads directory
        if (fs.existsSync(UPLOADS_DIR)) {
          archive.directory(UPLOADS_DIR, 'uploads')
        }

        archive.finalize()
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid backup type' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

// DELETE function removed - not needed for serverless backup
