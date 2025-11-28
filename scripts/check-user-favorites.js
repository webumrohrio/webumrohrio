const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserFavorites() {
  try {
    const email = 'rio.gusti123@gmail.com'
    
    console.log(`🔍 Checking favorites for: ${email}\n`)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log(`✅ User found: ${user.name} (ID: ${user.id})\n`)
    
    // Get favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    
    console.log(`📦 Total favorites in database: ${favorites.length}\n`)
    
    if (favorites.length === 0) {
      console.log('No favorites found')
      return
    }
    
    // Check each favorite package
    for (const fav of favorites) {
      console.log(`\n--- Favorite #${favorites.indexOf(fav) + 1} ---`)
      console.log(`Package ID: ${fav.packageId}`)
      console.log(`Created: ${fav.createdAt}`)
      
      // Check if package exists
      const pkg = await prisma.package.findUnique({
        where: { id: fav.packageId },
        include: {
          travel: {
            select: {
              name: true,
              username: true,
              isActive: true
            }
          }
        }
      })
      
      if (!pkg) {
        console.log(`❌ Package NOT FOUND (deleted)`)
      } else {
        console.log(`✅ Package exists: ${pkg.name}`)
        console.log(`   Travel: ${pkg.travel.name} (@${pkg.travel.username})`)
        console.log(`   Package Active: ${pkg.isActive}`)
        console.log(`   Travel Active: ${pkg.travel.isActive}`)
        console.log(`   Slug: ${pkg.slug}`)
        
        if (!pkg.isActive) {
          console.log(`   ⚠️  Package is INACTIVE`)
        }
        if (!pkg.travel.isActive) {
          console.log(`   ⚠️  Travel is INACTIVE`)
        }
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('Summary:')
    console.log(`Total favorites: ${favorites.length}`)
    
    const validPackages = await Promise.all(
      favorites.map(async (fav) => {
        const pkg = await prisma.package.findUnique({
          where: { id: fav.packageId },
          include: { travel: true }
        })
        return pkg && pkg.isActive && pkg.travel.isActive
      })
    )
    
    const validCount = validPackages.filter(Boolean).length
    console.log(`Valid & active packages: ${validCount}`)
    console.log(`Deleted or inactive: ${favorites.length - validCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserFavorites()
