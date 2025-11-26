const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkArticles() {
  try {
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        slug: true,
        title: true
      },
      take: 5
    })
    
    console.log('Articles in database:')
    console.log(JSON.stringify(articles, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArticles()
