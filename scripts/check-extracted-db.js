const Database = require('better-sqlite3');
const path = require('path');

const sqlitePath = path.join(__dirname, '..', 'db', 'extracted-backup', 'database', 'custom.db');

try {
  const sqlite = new Database(sqlitePath, { readonly: true });
  
  console.log('📊 Data in extracted backup database:\n');
  
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  
  let totalRecords = 0;
  
  tables.forEach(table => {
    const count = sqlite.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`   ${table.name}: ${count.count} records`);
    totalRecords += count.count;
  });
  
  console.log(`\n   Total: ${totalRecords} records`);
  
  // Show sample data
  console.log('\n📋 Sample Data:\n');
  
  // Admins
  const admins = sqlite.prepare('SELECT username, name, role FROM Admin LIMIT 5').all();
  if (admins.length > 0) {
    console.log('👤 Admins:');
    admins.forEach(a => console.log(`   - ${a.username} (${a.name}) - ${a.role}`));
  }
  
  // Travels
  const travels = sqlite.prepare('SELECT username, name, city FROM Travel LIMIT 10').all();
  if (travels.length > 0) {
    console.log('\n🏢 Travels:');
    travels.forEach(t => console.log(`   - ${t.username} - ${t.name} (${t.city})`));
  }
  
  // Packages
  const packages = sqlite.prepare('SELECT name, price, departureCity FROM Package LIMIT 10').all();
  if (packages.length > 0) {
    console.log('\n📦 Packages (first 10):');
    packages.forEach(p => console.log(`   - ${p.name} - Rp ${p.price.toLocaleString()} (${p.departureCity})`));
  }
  
  sqlite.close();
} catch (error) {
  console.error('Error:', error.message);
}
