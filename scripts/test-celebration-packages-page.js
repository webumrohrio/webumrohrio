const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCelebrationPackagesPage() {
  try {
    console.log('🎉 Testing Celebration on Packages Page\n')
    
    // Get a travel admin
    const travel = await prisma.travel.findFirst({
      where: {
        username: 'testes3'
      }
    })
    
    if (!travel) {
      console.log('❌ Travel not found')
      return
    }
    
    console.log('✅ Travel found:', travel.name)
    console.log('   Username:', travel.username)
    
    // Get all packages for this travel
    const packages = await prisma.package.findMany({
      where: {
        travelId: travel.id
      },
      select: {
        id: true,
        name: true,
        views: true,
        bookingClicks: true,
        isActive: true
      }
    })
    
    console.log('\n📦 Packages:')
    console.log('   Total:', packages.length)
    
    // Calculate totals
    let totalViews = 0
    let totalBookingClicks = 0
    
    packages.forEach((pkg, index) => {
      console.log(`\n   ${index + 1}. ${pkg.name}`)
      console.log(`      Views: ${pkg.views}`)
      console.log(`      Booking Clicks: ${pkg.bookingClicks}`)
      console.log(`      Active: ${pkg.isActive}`)
      
      totalViews += pkg.views
      totalBookingClicks += pkg.bookingClicks
      
      // Check milestones
      const viewMilestones = [10, 100, 500, 1000]
      const bookingMilestones = [10, 100, 500]
      
      viewMilestones.forEach(milestone => {
        if (pkg.views >= milestone) {
          console.log(`      ✅ Reached ${milestone} views milestone!`)
        }
      })
      
      bookingMilestones.forEach(milestone => {
        if (pkg.bookingClicks >= milestone) {
          console.log(`      ✅ Reached ${milestone} booking milestone!`)
        }
      })
    })
    
    console.log('\n📊 Totals:')
    console.log(`   Total Views: ${totalViews}`)
    console.log(`   Total Booking Clicks: ${totalBookingClicks}`)
    
    // Check total milestones
    const totalMilestones = [100, 500, 1000]
    
    console.log('\n🎯 Total Milestones:')
    totalMilestones.forEach(milestone => {
      if (totalViews >= milestone) {
        console.log(`   ✅ Reached ${milestone} total views milestone!`)
      }
      if (totalBookingClicks >= milestone) {
        console.log(`   ✅ Reached ${milestone} total booking milestone!`)
      }
    })
    
    // Check localStorage simulation
    console.log('\n💾 localStorage Check:')
    console.log('   To test celebration, clear localStorage:')
    console.log('   localStorage.removeItem("celebrationMilestones")')
    
    console.log('\n🔍 Testing Instructions:')
    console.log('   1. Login as travel admin: http://localhost:3000/travel-admin/login')
    console.log(`   2. Username: ${travel.username}`)
    console.log('   3. Go to packages page: http://localhost:3000/travel-admin/packages')
    console.log('   4. Clear localStorage if needed (F12 → Console):')
    console.log('      localStorage.removeItem("celebrationMilestones")')
    console.log('   5. Refresh page')
    console.log('   6. Popup should appear if milestone reached!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCelebrationPackagesPage()
