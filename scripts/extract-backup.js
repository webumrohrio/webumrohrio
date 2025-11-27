const extract = require('extract-zip');
const path = require('path');
const fs = require('fs');

const zipPath = path.join(__dirname, '..', 'db', 'backup-full-2025-11-26_11-31-01.zip');
const extractPath = path.join(__dirname, '..', 'db', 'extracted-backup');

async function extractBackup() {
  console.log('📦 Extracting backup ZIP file...\n');
  
  try {
    // Check if ZIP exists
    if (!fs.existsSync(zipPath)) {
      console.error('❌ ZIP file not found:', zipPath);
      return;
    }

    // Create extract directory
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    fs.mkdirSync(extractPath, { recursive: true });

    // Extract ZIP
    await extract(zipPath, { dir: extractPath });
    
    console.log('✅ Extraction completed!\n');
    
    // List extracted files
    console.log('📂 Extracted contents:');
    
    function listFiles(dir, indent = '') {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          console.log(`${indent}📁 ${file}/`);
          listFiles(filePath, indent + '  ');
        } else {
          const size = (stats.size / 1024).toFixed(2);
          console.log(`${indent}📄 ${file} (${size} KB)`);
        }
      });
    }
    
    listFiles(extractPath);
    
    // Check for database file
    const dbPath = path.join(extractPath, 'database', 'custom.db');
    if (fs.existsSync(dbPath)) {
      console.log('\n✅ Database file found:', dbPath);
      console.log('   You can now run migrate-from-extracted.js to import data');
    }
    
  } catch (error) {
    console.error('❌ Error extracting backup:', error);
  }
}

extractBackup();
