import { Client } from 'pg';
import format from 'pg-format';

// Parse DATABASE_URL
function parseDatabaseUrl(url: string) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
  if (!match) throw new Error('Invalid DATABASE_URL');
  
  const [, user, password, hostWithPort, database] = match;
  const [host, port] = hostWithPort.split(':');
  
  return {
    user,
    password,
    host,
    port: port || '5432',
    database: database.split('?')[0],
    ssl: { rejectUnauthorized: false }
  };
}

// Export database to SQL string
export async function exportDatabase(): Promise<string> {
  const config = parseDatabaseUrl(process.env.DATABASE_URL!);
  const client = new Client(config);
  
  try {
    await client.connect();
    
    let sql = `-- Database Backup\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Database: ${config.database}\n\n`;
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(r => r.tablename);
    
    for (const table of tables) {
      sql += `\n-- Table: ${table}\n`;
      sql += `TRUNCATE TABLE "${table}" CASCADE;\n`;
      
      // Get data
      const dataResult = await client.query(`SELECT * FROM "${table}"`);
      
      if (dataResult.rows.length > 0) {
        // Get column names
        const columns = Object.keys(dataResult.rows[0]);
        
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            if (typeof val === 'number') return val.toString();
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          
          sql += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
      }
    }
    
    return sql;
  } finally {
    await client.end();
  }
}

// Import database from SQL string
export async function importDatabase(sql: string): Promise<void> {
  const config = parseDatabaseUrl(process.env.DATABASE_URL!);
  const client = new Client(config);
  
  try {
    await client.connect();
    
    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        await client.query(statement);
      }
    }
  } finally {
    await client.end();
  }
}

// Get database stats
export async function getDatabaseStats() {
  const config = parseDatabaseUrl(process.env.DATABASE_URL!);
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const tablesResult = await client.query(`
      SELECT 
        tablename,
        (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as count
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename
    `);
    
    const stats: Record<string, number> = {};
    
    for (const row of tablesResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM "${row.tablename}"`);
      stats[row.tablename] = parseInt(countResult.rows[0].count);
    }
    
    return stats;
  } finally {
    await client.end();
  }
}
