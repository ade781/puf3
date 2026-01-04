# Romantic Quiz Backend

API untuk game Romantic Quiz, dibuat dengan Express + Sequelize.

## Teknologi
- Node.js + Express
- Sequelize + MySQL
- dotenv
- CORS

## Kebutuhan
- Node.js >= 18
- Database MySQL

## Cara menjalankan
1) Install dependency

```bash
npm install
```

2) Buat `backend/.env`

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=romantic_quiz
FRONTEND_URL=http://localhost:3000
```

3) Jalankan server

```bash
npm run dev
```

API akan aktif di `http://localhost:5000` dan semua route berada di `/api`.

## Database
- Sequelize menjalankan `sync({ alter: true })` saat startup.
- Pastikan user DB punya izin create/alter tabel.

## Model auth (sederhana)
- Tidak memakai JWT.
- Frontend mengirim `X-User-Id` lewat header.
- Password disimpan plain text (tidak aman untuk produksi).
  - Untuk produksi, gunakan hashing (bcrypt) + token auth.

## Daftar route
Base path: `/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (butuh `X-User-Id`)

### Rooms
- `POST /rooms/create` (butuh `X-User-Id`)
- `POST /rooms/join` (butuh `X-User-Id`)
- `GET /rooms/:code` (butuh `X-User-Id`)
- `POST /rooms/:code/leave` (butuh `X-User-Id`)

### Game
- `POST /game/question` (butuh `X-User-Id`)
- `POST /game/options` (butuh `X-User-Id`)
- `POST /game/selection` (butuh `X-User-Id`)
- `GET /game/:roomCode/current` (butuh `X-User-Id`)
- `GET /game/:roomCode/history` (butuh `X-User-Id`)
- `POST /game/:roomCode/next` (butuh `X-User-Id`)

### Musik (Tebak Lagu)
- `POST /music/random` (butuh `X-User-Id`)
- `POST /music/guess` (butuh `X-User-Id`)
- `POST /music/surrender` (butuh `X-User-Id`)
- `GET /music/:roomCode/current` (butuh `X-User-Id`)
- `GET /music/:roomCode/history` (butuh `X-User-Id`)

## Contoh request
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"fika","password":"123","displayName":"Fika"}'
```

## CORS
- Origin yang diizinkan diatur lewat `FRONTEND_URL` pada `.env`.
- Jangan pakai trailing slash di `FRONTEND_URL`.
