import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo' or 'gallery'
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB' },
        { status: 400 }
      )
    }

    // Determine folder based on type
    const folder = type === 'logo' ? 'umroh/travels/logos' : 
                   type === 'cover' ? 'umroh/travels/covers' : 
                   'umroh/travels/gallery'

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, folder)

    return NextResponse.json({
      success: true,
      url: result.secure_url
    })
  } catch (error) {
    console.error('Error uploading travel image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
