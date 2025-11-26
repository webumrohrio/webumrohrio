const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const BACKUP_DIR = path.join(__dirname, '..', 'backups')
const DB_PATH = path.join(__dirname, '..', 'prisma', 'db', 'custom.db')
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads')

// Configuration
const MAX_BACKUPS = 7 // Keep last 7 backups
const BACKUP_TYPE = process.argv[2] || 'database' // 'database' or 'full'

async function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
}

async function createBackup() {
  try {
    await ensureBackupDir()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '-')

    if (BACKUP_TYPE === 'database') {
      // Backup database only
      const backupFilename = `backup-db-${timestamp}.db`
      const backupPath = path.join(BACKUP_DIR, backupFilename)

      if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Database file not found')
        process.exit(1)
      }

      fs.copyFileSync(DB_PATH, backupPath)
      console.log(`✅ Database backup created: ${backupFilename}`)
      
      return backupFilename
    } else if (BACKUP_TYPE === 'full') {
      // Backup database + uploads
      const backupFilename = `backup-full-${timestamp}.zip`
      const backupPath = path.join(BACKUP_DIR, backupFilename)

      const output = fs.createWriteStream(backupPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`✅ Full backup created: ${backupFilename}`)
          console.log(`   Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`)
          resolve(backupFilename)
        })

        archive.on('error', (err) => {
          console.error('❌ Error creating backup:', err)
          reject(err)
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
    }
  } catch (error) {
    console.error('❌ Error creating backup:', error)
    process.exit(1)
  }
}

async function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
    const backups = files
      .filter(file => file.startsWith('backup-') && (file.endsWith('.zip') || file.endsWith('.db')))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time)

    // Keep only MAX_BACKUPS
    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS)
      toDelete.forEach(backup => {
        fs.unlinkSync(backup.path)
        console.log(`🗑️  Deleted old backup: ${backup.name}`)
      })
    }
  } catch (error) {
    console.error('⚠️  Error cleaning old backups:', error)
  }
}

async function main() {
  console.log('🔄 Starting automated backup...')
  console.log(`   Type: ${BACKUP_TYPE}`)
  console.log(`   Time: ${new Date().toLocaleString('id-ID')}`)
  console.log('')

  await createBackup()
  await cleanOldBackups()

  console.log('')
  console.log('✨ Backup completed successfully!')
}

main().catch(error => {
  console.error('❌ Backup failed:', error)
  process.exit(1)
})
