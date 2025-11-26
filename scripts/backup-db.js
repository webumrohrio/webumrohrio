const fs = require('fs');
const path = require('path');

// Paths
const dbPath = path.join(__dirname, '..', 'prisma', 'db', 'custom.db');
const backupDir = path.join(__dirname, '..', 'prisma', 'backups');

// Create backup directory if not exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupPath = path.join(backupDir, `custom.db.backup-${timestamp}`);

try {
  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found:', dbPath);
    process.exit(1);
  }

  // Copy database file
  fs.copyFileSync(dbPath, backupPath);
  
  // Get file size
  const stats = fs.statSync(backupPath);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  
  console.log('✅ Database backup created successfully!');
  console.log('📁 Backup location:', backupPath);
  console.log('📊 File size:', fileSizeInKB, 'KB');
  console.log('🕐 Timestamp:', new Date().toLocaleString('id-ID'));
  
  // List all backups
  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('custom.db.backup-'))
    .sort()
    .reverse();
  
  console.log('\n📋 Available backups:');
  backups.slice(0, 5).forEach((backup, index) => {
    const backupStats = fs.statSync(path.join(backupDir, backup));
    const size = (backupStats.size / 1024).toFixed(2);
    console.log(`   ${index + 1}. ${backup} (${size} KB)`);
  });
  
  if (backups.length > 5) {
    console.log(`   ... and ${backups.length - 5} more`);
  }
  
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}
