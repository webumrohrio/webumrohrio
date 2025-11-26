/**
 * Test script for Package Isolation
 * Verifies that travel admin can only see their own packages
 * 
 * Usage:
 * node scripts/test-package-isolation.js
 */

const BASE_URL = 'http://localhost:3000'

// Test data - different travel usernames
const travelAccounts = [
  { username: 'barokahmadinahtour', name: 'Barokah Madinah Tour' },
  { username: 'nurarafahtravel', name: 'Nur Arafah Travel' },
  { username: 'alfattahtour', name: 'Al-Fattah Premium Tour' },
  { username: 'rahmatullahtour', name: 'Rahmatullah Umroh & Haji' },
  { username: 'amanah-mekkah-travel', name: 'Amanah Mekkah Travel' }
]

async function testPackageIsolation(username, travelName) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🧪 Testing: ${travelName}`)
  console.log(`   Username: ${username}`)
  console.log('='.repeat(60))
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/packages?username=${username}&includeInactive=true`
    )
    const data = await response.json()
    
    if (!data.success) {
      console.log('❌ API Error:', data.error)
      return
    }

    const packages = data.data
    console.log(`\n📦 Found ${packages.length} package(s)`)

    if (packages.length === 0) {
      console.log('⚠️  No packages found for this travel')
      return
    }

    // Verify all packages belong to this travel
    let allValid = true
    packages.forEach((pkg, index) => {
      const belongsToTravel = pkg.travel.username === username
      const status = pkg.isActive ? '✅ Active' : '⚠️  Inactive'
      
      console.log(`\n${index + 1}. ${pkg.name}`)
      console.log(`   Travel: ${pkg.travel.name}`)
      console.log(`   Username: ${pkg.travel.username}`)
      console.log(`   Status: ${status}`)
      console.log(`   Price: Rp ${pkg.price.toLocaleString('id-ID')}`)
      console.log(`   Views: ${pkg.views} | Favorites: ${pkg.favoriteCount} | Bookings: ${pkg.bookingClicks}`)
      
      if (!belongsToTravel) {
        console.log(`   ❌ ERROR: Package belongs to different travel!`)
        allValid = false
      } else {
        console.log(`   ✅ Ownership verified`)
      }
    })

    console.log(`\n${'─'.repeat(60)}`)
    if (allValid) {
      console.log('✅ PASSED: All packages belong to this travel')
    } else {
      console.log('❌ FAILED: Some packages belong to other travels!')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testCrossContamination() {
  console.log('\n\n' + '='.repeat(60))
  console.log('🔍 CROSS-CONTAMINATION TEST')
  console.log('   Checking if any travel sees packages from others')
  console.log('='.repeat(60))

  const allPackagesByTravel = new Map()

  // Fetch packages for each travel
  for (const travel of travelAccounts) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/packages?username=${travel.username}&includeInactive=true`
      )
      const data = await response.json()
      
      if (data.success) {
        allPackagesByTravel.set(travel.username, data.data)
      }
    } catch (error) {
      console.error(`Error fetching for ${travel.username}:`, error.message)
    }
  }

  // Check for cross-contamination
  let crossContaminationFound = false

  allPackagesByTravel.forEach((packages, username) => {
    packages.forEach(pkg => {
      if (pkg.travel.username !== username) {
        console.log(`\n❌ CROSS-CONTAMINATION DETECTED!`)
        console.log(`   Travel: ${username}`)
        console.log(`   Sees package: ${pkg.name}`)
        console.log(`   Which belongs to: ${pkg.travel.username}`)
        crossContaminationFound = true
      }
    })
  })

  console.log(`\n${'─'.repeat(60)}`)
  if (!crossContaminationFound) {
    console.log('✅ PASSED: No cross-contamination detected')
    console.log('   Each travel only sees their own packages')
  } else {
    console.log('❌ FAILED: Cross-contamination detected!')
    console.log('   Some travels can see packages from others')
  }
}

async function main() {
  console.log('\n🚀 Starting Package Isolation Tests...')
  console.log('Testing URL:', BASE_URL)
  console.log('Testing', travelAccounts.length, 'travel accounts\n')

  // Test each travel individually
  for (const travel of travelAccounts) {
    await testPackageIsolation(travel.username, travel.name)
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay
  }

  // Test cross-contamination
  await testCrossContamination()

  console.log('\n\n' + '='.repeat(60))
  console.log('✅ All Package Isolation Tests Completed!')
  console.log('='.repeat(60))
  console.log('\n📝 Summary:')
  console.log('   - Each travel should only see their own packages')
  console.log('   - No cross-contamination between travels')
  console.log('   - Both active and inactive packages visible')
  console.log('\n')
}

main()
