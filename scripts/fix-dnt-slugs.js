const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

async function fixDNTSlugs() {
  try {
    console.log('🔧 Fixing DNT package slugs...\n')

    // Find DNT travel
    const dntTravel = await prisma.travel.findFirst({
      where: {
        username: 'dnt'
      }
    })

    if (!dntTravel) {
      console.log('❌ DNT Travel not found')
      return
    }

    console.log('✅ Found DNT Travel:', dntTravel.name)
    console.log('')

    // Find all packages from DNT
    const packages = await prisma.package.findMany({
      where: {
        travelId: dntTravel.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`📦 Found ${packages.length} DNT packages\n`)

    for (const pkg of packages) {
      const oldSlug = pkg.slug
      let newSlug = generateSlug(pkg.name)
      
      // Check if slug already exists
      let counter = 1
      let finalSlug = newSlug
      
      while (true) {
        const existing = await prisma.package.findUnique({
          where: { slug: finalSlug }
        })
        
        // If slug doesn't exist, or it's the current package, use it
        if (!existing || existing.id === pkg.id) {
          break
        }
        
        // Slug exists, try with number
        finalSlug = `${newSlug}-${counter}`
        counter++
      }
      
      // Update slug if different
      if (oldSlug !== finalSlug) {
        await prisma.package.update({
          where: { id: pkg.id },
          data: { slug: finalSlug }
        })
        
        console.log(`✅ Updated: ${pkg.name}`)
        console.log(`   Old slug: ${oldSlug}`)
        console.log(`   New slug: ${finalSlug}`)
        console.log('')
      } else {
        console.log(`⏭️  Skipped: ${pkg.name}`)
        console.log(`   Slug already correct: ${oldSlug}`)
        console.log('')
      }
    }

    console.log('✨ Done! All DNT package slugs have been fixed.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDNTSlugs()
