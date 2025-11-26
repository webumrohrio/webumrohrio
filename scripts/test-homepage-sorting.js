// Test Homepage Sorting
async function testHomepageSorting() {
  console.log('🧪 Testing Homepage Sorting...\n')

  try {
    const response = await fetch('http://localhost:3000/api/packages?page=1&pageSize=5')
    const result = await response.json()

    if (!result.success) {
      console.log('❌ API Error:', result.error)
      return
    }

    console.log(`Total Packages: ${result.data.length}\n`)
    console.log('📋 First 5 Packages (should show pinned first):\n')

    result.data.forEach((pkg, index) => {
      const pinIcon = pkg.isPinned ? '📌 PINNED' : '  '
      const verifiedIcon = pkg.travel.isVerified ? '✓' : ' '
      
      console.log(`${index + 1}. ${pinIcon} ${pkg.name}`)
      console.log(`   Travel: ${pkg.travel.name} ${verifiedIcon}`)
      console.log(`   Views: ${pkg.views}, Favorites: ${pkg.favoriteCount}`)
      console.log(`   Created: ${new Date(pkg.createdAt).toLocaleDateString()}`)
      console.log()
    })

    // Check if pinned package is first
    const firstPackage = result.data[0]
    if (firstPackage.isPinned) {
      console.log('✅ SUCCESS: Pinned package is at the top!')
    } else {
      console.log('❌ FAIL: Pinned package is NOT at the top!')
      console.log('   First package is:', firstPackage.name)
      console.log('   isPinned:', firstPackage.isPinned)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testHomepageSorting()
