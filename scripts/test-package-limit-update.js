// Test Package Limit Update
async function testPackageLimitUpdate() {
  console.log('🧪 Testing Package Limit Update...\n')

  const travelId = 'cmic0nr700000v6bom058jusu' // Barokah Madinah Tour

  try {
    // 1. Get current data
    console.log('📥 Fetching current data...')
    const getResponse = await fetch(`http://localhost:3000/api/travels/id/${travelId}`)
    const getResult = await getResponse.json()
    
    if (!getResult.success) {
      console.log('❌ Failed to fetch travel')
      return
    }

    const travel = getResult.data
    console.log(`   Name: ${travel.name}`)
    console.log(`   Current packageLimit: ${travel.packageLimit}`)
    console.log(`   Current packageUsed: ${travel.packageUsed}\n`)

    // 2. Update packageLimit to 2
    console.log('📤 Updating packageLimit to 2...')
    const updateResponse = await fetch(`http://localhost:3000/api/travels/id/${travelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: travel.name,
        description: travel.description,
        logo: travel.logo,
        coverImage: travel.coverImage,
        address: travel.address,
        city: travel.city,
        phone: travel.phone,
        email: travel.email,
        website: travel.website,
        rating: travel.rating,
        totalReviews: travel.totalReviews,
        totalJamaah: travel.totalJamaah,
        yearEstablished: travel.yearEstablished,
        packageLimit: 2, // Set to 2
        isActive: travel.isActive,
        isVerified: travel.isVerified,
        licenses: JSON.parse(travel.licenses || '[]'),
        facilities: JSON.parse(travel.facilities || '[]'),
        services: JSON.parse(travel.services || '[]'),
        gallery: JSON.parse(travel.gallery || '[]'),
        legalDocs: JSON.parse(travel.legalDocs || '[]')
      })
    })

    const updateResult = await updateResponse.json()
    console.log('Response:', updateResult.success ? '✅ Success' : '❌ Failed')
    
    if (!updateResult.success) {
      console.log('Error:', updateResult.error)
      return
    }

    // 3. Verify the change
    console.log('\n🔍 Verifying change...')
    const verifyResponse = await fetch(`http://localhost:3000/api/travels/id/${travelId}`)
    const verifyResult = await verifyResponse.json()
    
    console.log(`   packageLimit after update: ${verifyResult.data.packageLimit}`)
    
    if (verifyResult.data.packageLimit === 2) {
      console.log('✅ Verification PASSED!\n')
    } else {
      console.log(`❌ Verification FAILED! Expected 2, got ${verifyResult.data.packageLimit}\n`)
    }

    // 4. Restore original value
    console.log('🔄 Restoring original value...')
    await fetch(`http://localhost:3000/api/travels/id/${travelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...travel,
        packageLimit: travel.packageLimit,
        licenses: JSON.parse(travel.licenses || '[]'),
        facilities: JSON.parse(travel.facilities || '[]'),
        services: JSON.parse(travel.services || '[]'),
        gallery: JSON.parse(travel.gallery || '[]'),
        legalDocs: JSON.parse(travel.legalDocs || '[]')
      })
    })
    console.log(`✅ Restored to: ${travel.packageLimit}\n`)

    console.log('============================================================')
    console.log('✅ Test COMPLETE!')
    console.log('============================================================')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testPackageLimitUpdate()
