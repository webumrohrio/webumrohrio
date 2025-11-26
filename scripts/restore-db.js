const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paths
const dbPath = path.join(__dirname, '..', 'prisma', 'db', 'custom.db');
const backupDir = path.join(__dirname, '..', 'prisma', 'backups');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    // Check if backup directory exists
    if (!fs.existsSync(backupDir)) {
      console.error('❌ No backups found. Backup directory does not exist.');
      process.exit(1);
    }

    // List all backups
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('custom.db.backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.error('❌ No backup files found.');
      process.exit(1);
    }

    console.log('📋 Available backups:\n');
    backups.forEach((backup, index) => {
      const backupStats = fs.statSync(path.join(backupDir, backup));
      const size = (backupStats.size / 1024).toFixed(2);
      const date = backup.replace('custom.db.backup-', '').replace(/-/g, ':');
      console.log(`   ${index + 1}. ${backup}`);
      console.log(`      Size: ${size} KB | Date: ${date}\n`);
    });

    // Ask user which backup to restore
    rl.question('Enter backup number to restore (or "q" to quit): ', (answer) => {
      if (answer.toLowerCase() === 'q') {
        console.log('Restore cancelled.');
        rl.close();
        return;
      }

      const backupIndex = parseInt(answer) - 1;
      
      if (isNaN(backupIndex) || backupIndex < 0 || backupIndex >= backups.length) {
        console.error('❌ Invalid backup number.');
        rl.close();
        process.exit(1);
      }

      const selectedBackup = backups[backupIndex];
      const backupPath = path.join(backupDir, selectedBackup);

      // Confirm restore
      rl.question(`\n⚠️  This will replace your current database. Continue? (yes/no): `, (confirm) => {
        if (confirm.toLowerCase() !== 'yes') {
          console.log('Restore cancelled.');
          rl.close();
          return;
        }

        try {
          // Backup current database before restore
          if (fs.existsSync(dbPath)) {
            const preRestoreBackup = path.join(backupDir, `custom.db.pre-restore-${Date.now()}`);
            fs.copyFileSync(dbPath, preRestoreBackup);
            console.log('✅ Current database backed up before restore');
          }

          // Restore backup
          fs.copyFileSync(backupPath, dbPath);
          
          console.log('\n✅ Database restored successfully!');
          console.log('📁 Restored from:', selectedBackup);
          console.log('🕐 Timestamp:', new Date().toLocaleString('id-ID'));
          
        } catch (error) {
          console.error('❌ Restore failed:', error.message);
          process.exit(1);
        }

        rl.close();
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
