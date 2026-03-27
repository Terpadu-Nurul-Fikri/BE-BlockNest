# Setup Guide Menjalankan BlockNest (BE + FE)

Panduan ini dibuat berdasarkan kondisi project terbaru di workspace kamu, jadi command, endpoint, dan env variable sudah disesuaikan.

## 1. Prasyarat

- Node.js 20+ (disarankan LTS)
- npm 10+
- PostgreSQL 14+ (lokal) atau Docker Desktop

Cek versi:

```bash
node -v
npm -v
```

## 2. Struktur Project yang Dijalankan

- Backend: `BE-BlockNest`
- Frontend: `FE-BlockNest`

Arsitektur runtime:

- FE (Vite React): `http://localhost:5173`
- BE (Express): `http://localhost:3000`
- DB (PostgreSQL): `localhost:5432`

## 3. Setup Backend (BE-BlockNest)

Masuk folder backend:

```bash
cd BE-BlockNest
```

### 3.1 Install dependencies

```bash
npm install
```

### 3.2 Setup database PostgreSQL

### Opsi A: PostgreSQL lokal

1. Buat database:

```sql
CREATE DATABASE blocknest_db;
```

2. Pastikan user/password PostgreSQL kamu valid.

### Opsi B: Docker

Buat file `docker-compose.yml` (opsional, di folder `BE-BlockNest`):

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: blocknest_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: blocknest_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Jalankan:

```bash
docker compose up -d
```

### 3.3 Setup environment backend

Di Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Di Git Bash:

```bash
cp .env.example .env
```

Edit `.env` dan pastikan minimal seperti ini:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/blocknest_db?schema=public"
JWT_SECRET="ganti-dengan-secret-yang-kuat"
JWT_EXPIRE="7d"
FRONTEND_URL="http://localhost:5173"
```

Catatan penting:

- Di kode backend saat ini, auth membaca `JWT_EXPIRE` (bukan `JWT_EXPIRES_IN`).
- Jika pakai `.env.example` lama, tambahkan manual baris `JWT_EXPIRE="7d"`.

### 3.4 Jalankan migrasi dan seed

```bash
npm run db:migrate
npm run db:seed
```

Yang akan terisi dari seed:

- Category: `living-room`, `bedroom`, `dining`
- Product sample sesuai category

### 3.5 Jalankan backend

```bash
npm run dev
```

Backend aktif di `http://localhost:3000`.

## 4. Setup Frontend (FE-BlockNest)

Buka terminal baru, lalu masuk folder frontend:

```bash
cd FE-BlockNest
```

Install dependencies:

```bash
npm install
```

Jalankan frontend:

```bash
npm run dev
```

Frontend aktif di `http://localhost:5173`.

## 5. Validasi Integrasi FE ↔ BE

Setelah BE dan FE aktif bersamaan, test alur berikut:

1. Buka `http://localhost:5173/register`
2. Register user baru
3. Login di `http://localhost:5173/login`
4. Buka `http://localhost:5173/profile`
5. Pastikan profile tampil dan logout berfungsi

## 6. Test API Manual (opsional)

### 6.1 Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123","firstName":"Budi","lastName":"Setiawan","phone":"081234567899"}'
```

### 6.2 Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123"}'
```

Response login akan mengembalikan `token`.

### 6.3 Profile (butuh token)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <TOKEN_LOGIN>"
```

### 6.4 Product list

```bash
curl http://localhost:3000/product
```

## 7. Command Harian yang Sering Dipakai

Backend:

```bash
npm run dev
npm run db:migrate
npm run db:deploy
npm run db:seed
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
```

## 8. Troubleshooting

### 8.1 Port backend bentrok

Default backend: `3000`

Windows:

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Alternatif: ganti `PORT` di `.env`.

### 8.2 Port frontend bentrok

Default frontend: `5173`

Windows:

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### 8.3 Gagal konek database

Checklist:

- PostgreSQL running
- `DATABASE_URL` benar (user/password/port/db)
- Database `blocknest_db` sudah dibuat

Tes cepat:

```bash
psql -U postgres -d blocknest_db
```

### 8.4 Error JWT saat login/profile

Pastikan di `.env` ada:

```env
JWT_SECRET="secret-kamu"
JWT_EXPIRE="7d"
```

Lalu restart backend.

### 8.5 Error setelah pull terbaru

Jalankan ulang:

```bash
npm install
npm run db:migrate
```

Jika perlu seed ulang:

```bash
npm run db:seed
```

## 9. Checklist Selesai Setup

- [ ] `npm install` sukses di BE
- [ ] `.env` backend sudah benar
- [ ] `db:migrate` sukses
- [ ] `db:seed` sukses
- [ ] BE jalan di `http://localhost:3000`
- [ ] `npm install` sukses di FE
- [ ] FE jalan di `http://localhost:5173`
- [ ] Register/Login/Profile sukses dari FE

Kalau semua checklist centang, project sudah siap dipakai development harian.
