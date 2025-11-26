// Test Reset Quota API Endpoint
async function testResetQuotaAPI() {
  console.log('🧪 Testing Reset Quota API...\n')

  try {
    // Get a travel with packageUsed > 0
    const travelsResponse = await fetch('http://localhost:3000/api/travels')
    const travelsResult = await travelsResponse.json()
    
    if (!travelsResult.success) {
      console.log('❌ Failed to fetch travels')
      return
    }

    const travel = travelsResult.data.find(t => t.packageUsed > 0)
    
    if (!travel) {
      console.log('❌ No travel found with packageUsed > 0')
      return
    }

    console.log('📦 Selected Travel:')
    console.log(`   ID: ${travel.id}`)
    console.log(`   Name: ${travel.name}`)
    console.log(`   Package Used (before): ${travel.packageUsed}`)
    console.log(`   Package Limit: ${travel.packageLimit}\n`)

    // Test reset quota
    console.log('🔄 Testing PATCH /api/travels/id/[id] with packageUsed: 0...')
    const resetResponse = await fetch(`http://localhost:3000/api/travels/id/${travel.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageUsed: 0 })
    })

    const resetResult = await resetResponse.json()
    console.log('Response:', resetResult)

    if (resetResult.success) {
      console.log('✅ Reset successful!\n')

      // Verify the change
      console.log('🔍 Verifying change...')
      const verifyResponse = await fetch(`http://localhost:3000/api/travels/id/${travel.id}`)
      const verifyResult = await verifyResponse.json()
      
      console.log(`   Package Used (after): ${verifyResult.data.packageUsed}`)
      
      if (verifyResult.data.packageUsed === 0) {
        console.log('✅ Verification PASSED!\n')
      } else {
        console.log('❌ Verification FAILED!\n')
      }

      // Restore original value
      console.log('🔄 Restoring original value...')
      await fetch(`http://localhost:3000/api/travels/id/${travel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageUsed: travel.packageUsed })
      })
      console.log(`✅ Restored to: ${travel.packageUsed}\n`)

    } else {
      console.log('❌ Reset failed:', resetResult.error)
    }

    console.log('============================================================')
    console.log('✅ API Test COMPLETE!')
    console.log('============================================================')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testResetQuotaAPI()
