# 🔔 WA Reminder App

Aplikasi web full-stack untuk menjadwalkan dan mengirimkan pesan pengingat otomatis melalui WhatsApp. Dibangun menggunakan Next.js, Drizzle ORM, SQLite, dan `whatsapp-web.js`.

## ✨ Fitur Utama

- **⏰ Penjadwalan Fleksibel:** Jadwalkan pesan pengingat untuk menit, jam, atau hari ke depan.
- **🤖 Worker Otomatis:** Proses background yang secara otomatis mengecek dan mengirim pesan tepat waktu.
- **🛡️ Autentikasi Aman:** Sistem login dan registrasi menggunakan Better Auth.
- **📱 Humanize Bot:** Bot menyimulasikan status "mengetik" (typing) sebelum mengirim pesan untuk meminimalisir risiko blokir dari WhatsApp.
- **🎨 UI Modern & Responsif:** Dibangun dengan Tailwind CSS v4 dan komponen Radix UI.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React
- **Backend & Worker:** Node.js, `whatsapp-web.js`, TypeScript
- **Database & ORM:** SQLite (`better-sqlite3`), Drizzle ORM
- **Authentication:** Better Auth
- **Process Management:** PM2

## 📂 Struktur Proyek Terpenting

```text
├── app/                  # Route & halaman Next.js (Dashboard, Landing Page)
├── components/           # Komponen UI Reusable (Radix UI / Shadcn)
├── drizzle/              # File migrasi database
├── lib/                  # Konfigurasi Database (db.ts) & Skema Drizzle (schema.ts)
├── scripts/              # Script background worker
│   └── whatsapp.ts       # Logika bot WhatsApp & antrean pesan
├── wa_session/           # Folder (auto-generated) untuk menyimpan sesi login WA
└── ecosystem.config.js   # Konfigurasi PM2 untuk production
```

## 🚀 Cara Menjalankan di Lokal (Development)

### 1. Prasyarat
- Node.js (v18 atau lebih baru) disarankan
- Aplikasi WhatsApp di smartphone untuk memindai QR Code

### 2. Instalasi
Clone repositori ini, kemudian install semua dependensi:

```bash
npm install
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:

```bash
cp .env.example .env
```
Pastikan `DATABASE_URL` sudah diarahkan dengan benar ke file SQLite Anda (contoh: `DATABASE_URL="sqlite.db"`).

### 4. Setup Database
Jalankan perintah Drizzle untuk melakukan push skema ke database SQLite:

```bash
npx drizzle-kit push
```

### 5. Membuat User
Anda dapat membuat user secara manual dari terminal (berguna untuk membuat akun pertama atau admin):

```bash
npm run create-user "<Nama>" <email> <password> <role>
```
*Contoh:*
```bash
npm run create-user "Admin Utama" admin@admin.com password123 admin
```
*(Role yang tersedia: `admin` atau `user`)*

### 6. Menjalankan Aplikasi
Aplikasi ini membutuhkan 2 terminal yang berjalan secara bersamaan:

**Terminal 1: Web Frontend**
```bash
npm run dev
```
*(Aplikasi web akan berjalan di port yang sudah diset di package.json / Next.js default)*

**Terminal 2: WhatsApp Worker**
```bash
npm run worker
```
*(Tunggu beberapa saat, sistem akan memunculkan QR Code di terminal. Scan menggunakan aplikasi WhatsApp Anda. Biarkan terminal ini tetap terbuka).*

---

## 🌍 Deployment (Production)

Proyek ini sudah dilengkapi dengan `ecosystem.config.js` untuk dijalankan menggunakan **PM2**.

1. Build aplikasi Next.js:
   ```bash
   npm run build
   ```
2. Jalankan PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```
Perintah ini akan secara otomatis menjalankan dua service: `wa-reminder-frontend` dan `wa-reminder-worker`.

## 📝 Catatan Penting
- **Keamanan Akun WA:** Gunakan nomor WhatsApp sekunder/khusus bot untuk menjalankan worker demi menghindari pemblokiran pada nomor utama Anda.
- **Sesi WhatsApp:** Sesi login disimpan di folder `wa_session`. Jika Anda ingin mengganti nomor pengirim, hapus folder tersebut dan restart worker untuk memunculkan QR Code baru.

## 📄 Lisensi
Private / Hak Cipta Dilindungi.