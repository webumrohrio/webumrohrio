import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import extract from 'extract-zip'

const copyFile = promisify(fs.copyFile)

const BACKUP_DIR = path.join(process.cwd(), 'backups')
const DB_PATH = path.join(process.cwd(), 'prisma', 'db', 'custom.db')
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename } = body

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

    const backupPath = path.join(BACKUP_DIR, filename)

    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 404 }
      )
    }

    if (filename.endsWith('.db')) {
      // Restore database only
      // Create backup of current database first
      const currentBackup = path.join(BACKUP_DIR, `pre-restore-${Date.now()}.db`)
      if (fs.existsSync(DB_PATH)) {
        await copyFile(DB_PATH, currentBackup)
      }

      // Restore from backup
      await copyFile(backupPath, DB_PATH)

      return NextResponse.json({
        success: true,
        message: 'Database restored successfully',
        backup: currentBackup
      })
    } else if (filename.endsWith('.zip')) {
      // Restore full backup
      const tempDir = path.join(BACKUP_DIR, 'temp-restore')
      
      // Create temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      // Extract zip
      await extract(backupPath, { dir: tempDir })

      // Backup current database
      const currentBackup = path.join(BACKUP_DIR, `pre-restore-${Date.now()}.db`)
      if (fs.existsSync(DB_PATH)) {
        await copyFile(DB_PATH, currentBackup)
      }

      // Restore database
      const extractedDb = path.join(tempDir, 'database', 'custom.db')
      if (fs.existsSync(extractedDb)) {
        await copyFile(extractedDb, DB_PATH)
      }

      // Restore uploads
      const extractedUploads = path.join(tempDir, 'uploads')
      if (fs.existsSync(extractedUploads)) {
        // Remove current uploads
        if (fs.existsSync(UPLOADS_DIR)) {
          fs.rmSync(UPLOADS_DIR, { recursive: true, force: true })
        }
        
        // Copy extracted uploads
        fs.cpSync(extractedUploads, UPLOADS_DIR, { recursive: true })
      }

      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true })

      return NextResponse.json({
        success: true,
        message: 'Full restore completed successfully',
        backup: currentBackup
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid backup file format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error restoring backup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to restore backup: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
