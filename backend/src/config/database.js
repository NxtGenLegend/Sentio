import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/sentio.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;
let SQL = null;

// Initialize database
export async function initDatabase() {
  if (db) return db;

  SQL = await initSqlJs();

  // Try to load existing database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('✅ Created new database');
  }

  return db;
}

// Save database to file
export function saveDatabase() {
  if (!db) return;

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Helper function to run SQL with error handling
export async function runSQL(sql, params = []) {
  if (!db) await initDatabase();

  try {
    db.run(sql, params);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
}

// Helper function to get one result
export async function getOne(sql, params = []) {
  if (!db) await initDatabase();

  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);

    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
}

// Helper function to get all results
export async function getAll(sql, params = []) {
  if (!db) await initDatabase();

  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
}

// Helper function to execute without params (for CREATE TABLE, etc.)
export async function exec(sql) {
  if (!db) await initDatabase();

  try {
    db.run(sql);
    saveDatabase();
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
}

export function getDatabase() {
  return db;
}

// Auto-save database every 30 seconds
setInterval(() => {
  if (db) {
    saveDatabase();
  }
}, 30000);

// Save on exit
process.on('exit', () => {
  if (db) {
    saveDatabase();
    console.log('💾 Database saved on exit');
  }
});

process.on('SIGINT', () => {
  if (db) {
    saveDatabase();
  }
  process.exit(0);
});

export default {
  initDatabase,
  saveDatabase,
  runSQL,
  getOne,
  getAll,
  exec,
  getDatabase
};
