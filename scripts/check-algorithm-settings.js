const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ['packageSortAlgorithm', 'verifiedPriority']
      }
    }
  })

  console.log('\n📊 CURRENT ALGORITHM SETTINGS:\n')
  console.log('═'.repeat(50))
  
  settings.forEach(s => {
    console.log(`${s.key}: ${s.value}`)
  })
  
  if (settings.length === 0) {
    console.log('⚠️  No settings found - using defaults')
    console.log('   Default algorithm: newest')
    console.log('   Default verifiedPriority: true')
  }
  
  console.log('═'.repeat(50))
}

main()
  .finally(() => prisma.$disconnect())
