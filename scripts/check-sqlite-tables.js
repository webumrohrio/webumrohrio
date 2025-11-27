const Database = require('better-sqlite3');
const path = require('path');

const sqlitePath = path.join(__dirname, '..', 'db', 'custom.db');

try {
  const sqlite = new Database(sqlitePath, { readonly: true });
  
  console.log('📊 Tables in SQLite database:\n');
  
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  
  tables.forEach(table => {
    const count = sqlite.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`   ${table.name}: ${count.count} records`);
  });
  
  sqlite.close();
} catch (error) {
  console.error('Error:', error.message);
}
