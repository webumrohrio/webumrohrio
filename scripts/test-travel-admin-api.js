/**
 * Test script for Travel Admin Management API
 * 
 * Usage:
 * node scripts/test-travel-admin-api.js
 */

const BASE_URL = 'http://localhost:3000'

async function testGetTravelAdmins() {
  console.log('\n🧪 Testing GET /api/admintrip/travel-admins...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admintrip/travel-admins`)
    const data = await response.json()
    
    console.log('✅ Response:', JSON.stringify(data, null, 2))
    
    if (data.success && data.data.length > 0) {
      console.log(`\n📊 Found ${data.data.length} travel admin(s)`)
      data.data.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.name}`)
        console.log(`   Email: ${admin.email}`)
        console.log(`   Username: ${admin.username}`)
        console.log(`   Password: ${admin.password}`)
        console.log(`   Is Hashed: ${admin.isPasswordHashed}`)
        console.log(`   Created: ${new Date(admin.createdAt).toLocaleString('id-ID')}`)
        console.log(`   Last Login: ${admin.lastLogin ? new Date(admin.lastLogin).toLocaleString('id-ID') : 'Never'}`)
      })
    } else {
      console.log('⚠️  No travel admins found')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testResetPassword(travelId, newPassword) {
  console.log(`\n🧪 Testing PATCH /api/admintrip/travel-admins/${travelId}/password...`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/admintrip/travel-admins/${travelId}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Password reset successful!')
      console.log('Response:', JSON.stringify(data, null, 2))
    } else {
      console.log('❌ Password reset failed:', data.error)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function main() {
  console.log('🚀 Starting Travel Admin API Tests...')
  console.log('=' .repeat(50))
  
  // Test 1: Get all travel admins
  await testGetTravelAdmins()
  
  // Test 2: Reset password (uncomment and provide travel ID to test)
  // const travelId = 'your-travel-id-here'
  // const newPassword = 'newpassword123'
  // await testResetPassword(travelId, newPassword)
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ All tests completed!')
}

main()
