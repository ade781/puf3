# Romantic Quiz Frontend

Aplikasi web untuk pengalaman Romantic Quiz. Dibangun dengan React, Vite, dan Tailwind CSS.

## Teknologi
- React 18
- Vite 5
- Tailwind CSS 3
- React Router 6
- Axios

## Kebutuhan
- Node.js >= 18

## Cara menjalankan
1) Install dependency

```bash
npm install
```

2) Buat `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

3) Jalankan dev server

```bash
npm run dev
```

Default Vite berjalan di `http://localhost:5173`. Jika backend CORS menggunakan `http://localhost:3000`, jalankan:

```bash
npm run dev -- --port 3000
```

## Build produksi
```bash
npm run build
npm run preview
```

## Struktur proyek
- `src/App.jsx` - Route utama
- `src/api.js` - Axios instance dan header auth
- `src/context/AuthContext.jsx` - State auth (login/register)
- `src/components/` - Halaman dan UI
- `src/data/questions.json` - 100 pertanyaan pilihan (random)
- `src/index.css` - Tailwind layers + tema global

## Fitur
- Login dan register
- Buat atau gabung room
- Tanya-jawab (tanpa sistem benar/salah)
- Pilih pertanyaan acak saat membuat pertanyaan
- Mode Tebak Lagu (2 pemain, lagu acak dari Deezer preview)

## Environment variables
- `VITE_API_URL` - Base URL backend API, harus mengandung `/api`

## Catatan
- Aplikasi menyimpan `userId` dan `user` di `localStorage` dan mengirim `X-User-Id` di tiap request.
- Kalau base URL backend berubah, update `VITE_API_URL` dan restart dev server.
