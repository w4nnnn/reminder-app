import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2]; // Ambil email dari argumen pertama

if (!email) {
    console.error('❌ Mohon sertakan email yang ingin dijadikan admin.');
    console.error('Usage: npx tsx scripts/add-admin.ts <email>');
    process.exit(1);
}

const dbPath = process.env.DATABASE_URL || 'jembskuy.db';
const db = new Database(dbPath);

try {
    console.log(`Mengupdate role untuk: ${email}...`);
    const info = db.prepare("UPDATE user SET role = 'admin' WHERE email = ?").run(email);

    if (info.changes > 0) {
        console.log(`✅ Sukses! ${email} sekarang memiliki akses ADMIN.`);
    } else {
        console.log(`⚠️ Email ${email} tidak ditemukan di database.`);
        console.log('Pastikan user sudah register / sign-up terlebih dahulu.');
    }
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}