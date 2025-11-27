import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  // Redirect to main backup API
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated',
    message: 'Please use /api/admintrip/backup for restore functionality'
  }, { status: 410 })
}

/*
// Old implementation - commented out
export async function POST_OLD(request: NextRequest) {
  try {
  // Check if running on Vercel (read-only filesystem)
  const isVercel = process.env.VERCEL === '1'
  
  if (isVercel) {
    return NextResponse.json({
      success: false,
      error: 'Backup upload is disabled on Vercel',
      message: 'Vercel uses read-only filesystem. Use Neon Console for database management.',
      info: 'Visit https://console.neon.tech to manage your database backups.'
    }, { status: 400 })
  }

  await ensureBackupDir()

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No file uploaded' },
      { status: 400 }
    )
  }

  // Validate file type
  const fileName = file.name
  const fileExt = path.extname(fileName).toLowerCase()
  
  if (fileExt !== '.db' && fileExt !== '.zip') {
    return NextResponse.json(
      { success: false, error: 'Invalid file type. Only .db and .zip files are allowed' },
      { status: 400 }
    )
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { 
        success: false, 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      },
      { status: 400 }
    )
  }

  // Generate unique filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
  const type = fileExt === '.zip' ? 'full' : 'db'
  const newFileName = `backup-${type}-uploaded-${timestamp}${fileExt}`
  const filePath = path.join(BACKUP_DIR, newFileName)

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  await writeFile(filePath, buffer)

  // Get file stats
  const stats = fs.statSync(filePath)

  return NextResponse.json({
    success: true,
    message: 'Backup file uploaded successfully',
    data: {
      filename: newFileName,
      size: stats.size,
      type: type,
      originalName: fileName
    }
  })
} catch (error) {
    console.error('Error uploading backup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload backup file' },
      { status: 500 }
    )
  }
}
*/
