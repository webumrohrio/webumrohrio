/**
 * Debug script to test package fetching for specific travel
 * 
 * Usage:
 * node scripts/debug-package-fetch.js [username]
 */

const BASE_URL = 'http://localhost:3000'

async function debugPackageFetch(username) {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 DEBUG: Package Fetch for Travel Admin')
  console.log('='.repeat(60))
  console.log(`Username: ${username}`)
  console.log(`URL: ${BASE_URL}/api/packages?username=${username}&includeInactive=true`)
  console.log('='.repeat(60))

  try {
    const response = await fetch(
      `${BASE_URL}/api/packages?username=${username}&includeInactive=true`
    )
    
    console.log('\n📡 Response Status:', response.status)
    
    const data = await response.json()
    
    console.log('\n📊 API Response:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.success && data.data) {
      console.log('\n' + '='.repeat(60))
      console.log(`📦 Total Packages: ${data.data.length}`)
      console.log('='.repeat(60))
      
      if (data.data.length === 0) {
        console.log('\n⚠️  No packages found for this travel')
        console.log('   Possible reasons:')
        console.log('   1. Travel has no packages yet')
        console.log('   2. Username is incorrect')
        console.log('   3. Database issue')
      } else {
        console.log('\n📋 Package List:')
        data.data.forEach((pkg, index) => {
          console.log(`\n${index + 1}. ${pkg.name}`)
          console.log(`   Travel: ${pkg.travel.name} (${pkg.travel.username})`)
          console.log(`   Status: ${pkg.isActive ? 'Active' : 'Inactive'}`)
          console.log(`   Price: Rp ${pkg.price.toLocaleString('id-ID')}`)
          console.log(`   Views: ${pkg.views} | Favorites: ${pkg.favoriteCount} | Bookings: ${pkg.bookingClicks}`)
          
          // Check ownership
          if (pkg.travel.username !== username) {
            console.log(`   ❌ ERROR: This package belongs to ${pkg.travel.username}, not ${username}!`)
          } else {
            console.log(`   ✅ Ownership verified`)
          }
        })
        
        // Summary
        const wrongOwnership = data.data.filter(pkg => pkg.travel.username !== username)
        console.log('\n' + '='.repeat(60))
        if (wrongOwnership.length > 0) {
          console.log(`❌ PROBLEM DETECTED: ${wrongOwnership.length} package(s) with wrong ownership!`)
          console.log('   These packages should NOT be visible to this travel admin:')
          wrongOwnership.forEach(pkg => {
            console.log(`   - ${pkg.name} (belongs to ${pkg.travel.username})`)
          })
        } else {
          console.log('✅ All packages have correct ownership')
        }
      }
    } else {
      console.log('\n❌ API Error:', data.error || 'Unknown error')
    }
    
  } catch (error) {
    console.error('\n❌ Fetch Error:', error.message)
  }
  
  console.log('\n' + '='.repeat(60))
}

// Get username from command line argument or use default
const username = process.argv[2] || 'barokahmadinahtour'

console.log('\n🚀 Starting Debug...')
debugPackageFetch(username)
