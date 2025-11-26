const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Function to generate slug from package name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

async function main() {
  console.log('🚀 Starting migration: Add slug to packages...')
  console.log('📊 Progress: 30%')
  
  try {
    // First, add slug column if not exists (using raw SQL)
    try {
      await prisma.$executeRaw`ALTER TABLE Package ADD COLUMN slug TEXT`
      console.log('✅ Added slug column to Package table')
    } catch (e) {
      console.log('ℹ️  Slug column already exists or error:', e.message)
    }
    
    console.log('📊 Progress: 40%')
    
    // Get all packages
    const packages = await prisma.$queryRaw`SELECT * FROM Package`
    
    console.log(`📦 Found ${packages.length} packages`)
    console.log('📊 Progress: 50%')
    
    // Update each package with slug
    let processed = 0
    for (const pkg of packages) {
      const baseSlug = generateSlug(pkg.name)
      let slug = baseSlug
      let counter = 1
      
      // Check if slug exists, if yes add counter
      while (true) {
        const existing = await prisma.$queryRaw`SELECT id FROM Package WHERE slug = ${slug} AND id != ${pkg.id} LIMIT 1`
        
        if (existing.length === 0) break
        
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      // Update package with slug using raw SQL
      await prisma.$executeRaw`UPDATE Package SET slug = ${slug} WHERE id = ${pkg.id}`
      
      processed++
      const progress = 50 + Math.floor((processed / packages.length) * 40)
      console.log(`✅ [${progress}%] Updated: ${pkg.name} -> ${slug}`)
    }
    
    console.log('📊 Progress: 90%')
    console.log('✨ Migration completed successfully!')
    console.log('📊 Progress: 100%')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
