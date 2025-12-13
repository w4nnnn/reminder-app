import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_URL;
console.log('Using database:', dbPath);

const db = new Database(dbPath);

try {
    db.exec("ALTER TABLE user ADD role text DEFAULT 'user' NOT NULL");
    console.log('Added role column successfully');
} catch (error: any) {
    if (error.message.includes('duplicate column')) {
        console.log('Column role already exists, skipping');
    } else {
        throw error;
    }
}

db.close();
console.log('Migration complete!');
