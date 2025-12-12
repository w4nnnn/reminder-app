import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const dbPath = process.env.DATABASE_URL;
console.log('Using database:', dbPath);

const db = new Database(dbPath);

// Read and execute the migration SQL
const migrationPath = path.join(__dirname, '../drizzle/0000_chilly_tony_stark.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

// Split by statement breakpoint and execute each statement
const statements = sql.split('-->');

for (const statement of statements) {
    const cleaned = statement.replace(/statement-breakpoint/g, '').trim();
    if (cleaned) {
        try {
            db.exec(cleaned);
            console.log('Executed statement successfully');
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                console.log('Table already exists, skipping');
            } else {
                console.error('Error executing statement:', error.message);
            }
        }
    }
}

// Check tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:', tables);

db.close();
console.log('Migration complete!');
