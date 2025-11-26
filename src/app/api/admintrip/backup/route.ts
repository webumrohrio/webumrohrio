import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { promisify } from 'util'

const mkdir = promisify(fs.mkdir)
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const unlink = promisify(fs.unlink)
const copyFile = promisify(fs.copyFile)

const BACKUP_DIR = path.join(process.cwd(), 'backups')
const DB_PATH = path.join(process.cwd(), 'prisma', 'db', 'custom.db')
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure backup directory exists
async function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true })
  }
}

// GET - List all backups
export async function GET() {
  try {
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

// POST - Create new backup
export async function POST(request: NextRequest) {
  try {
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

// DELETE - Delete a backup
export async function DELETE(request: NextRequest) {
  try {
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

    await unlink(filePath)

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting backup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
}
