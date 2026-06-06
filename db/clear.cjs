const mysql = require('mysql2/promise');

async function clear() {
  const conn = await mysql.createConnection(
    process.env.DATABASE_URL || {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'app_db'
    }
  );
  
  console.log("Dropping all tables...");
  await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
  await conn.execute("DROP TABLE IF EXISTS artist_schedules, readings, payments, artists, users");
  await conn.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("All tables dropped!");
  await conn.end();
}

clear().catch(e => { console.error(e); process.exit(1); });
