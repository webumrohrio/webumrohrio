// Test API pagination for tercepat sorting
async function testTercepatPages() {
  console.log('=== Testing Tercepat API Pagination ===\n')
  
  const baseUrl = 'http://localhost:3000/api/packages'
  
  // Page 1
  console.log('📄 Fetching Page 1...')
  const page1Response = await fetch(`${baseUrl}?sortBy=tercepat&page=1&pageSize=20`)
  const page1Data = await page1Response.json()
  
  console.log(`Page 1: ${page1Data.data.length} packages`)
  console.log('IDs:', page1Data.data.map(p => p.id).join(', '))
  console.log('Names:', page1Data.data.map(p => p.name.substring(0, 30)).join(', '))
  console.log('Pagination:', page1Data.pagination)
  console.log('')
  
  // Page 2
  console.log('📄 Fetching Page 2...')
  const page2Response = await fetch(`${baseUrl}?sortBy=tercepat&page=2&pageSize=20`)
  const page2Data = await page2Response.json()
  
  console.log(`Page 2: ${page2Data.data.length} packages`)
  console.log('IDs:', page2Data.data.map(p => p.id).join(', '))
  console.log('Names:', page2Data.data.map(p => p.name.substring(0, 30)).join(', '))
  console.log('Pagination:', page2Data.pagination)
  console.log('')
  
  // Check for duplicates
  const page1Ids = new Set(page1Data.data.map(p => p.id))
  const page2Ids = new Set(page2Data.data.map(p => p.id))
  
  const duplicates = [...page1Ids].filter(id => page2Ids.has(id))
  
  if (duplicates.length > 0) {
    console.log('❌ DUPLICATES FOUND between pages:')
    duplicates.forEach(id => {
      const pkg = page1Data.data.find(p => p.id === id) || page2Data.data.find(p => p.id === id)
      console.log(`  - ${id}: ${pkg.name}`)
    })
  } else {
    console.log('✅ No duplicates between pages')
  }
  
  console.log(`\nTotal unique packages: ${page1Ids.size + page2Ids.size - duplicates.length}`)
}

testTercepatPages().catch(console.error)
