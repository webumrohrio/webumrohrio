// Test heartbeat API
const testHeartbeat = async () => {
  const email = 'fauzia@gmail.com' // Ganti dengan email user Fauzia
  
  console.log('Testing heartbeat API...')
  console.log('Email:', email)
  
  try {
    const response = await fetch('http://localhost:3000/api/user/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    const result = await response.json()
    console.log('Response:', result)
    
    if (result.success) {
      console.log('✅ Heartbeat berhasil! lastActive sudah diupdate')
    } else {
      console.log('❌ Heartbeat gagal:', result.message)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testHeartbeat()
