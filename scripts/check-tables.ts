import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';

dotenv.config();

const db = new Database(process.env.DATABASE_URL || 'sqlite.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:');
tables.forEach((t: any) => console.log('  -', t.name));
db.close();
