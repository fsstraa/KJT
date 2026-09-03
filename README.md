# Sinkronisasi Data di Semua Perangkat (Supabase)

Sekarang data tersimpan di **cloud Supabase**, sehingga:
- Edit di **laptop** → langsung muncul di **HP** (dan browser lain)
- Edit di **HP** → langsung muncul di **laptop**
- Data aman tersimpan di cloud (tidak hilang walau ganti perangkat)

## Cara Setup (sekali saja, ±5 menit)

### 1. Buat akun & project Supabase (gratis)
1. Buka https://supabase.com → **Start your project** → login.
2. Masuk dashboard → klik **New project**.
3. Isi:
   - **Name:** `kjt` (bebas)
   - **Database Password:** buat password (simpan)
   - Pilih region terdekat → **Create new project**
4. Tunggu beberapa menit hingga project jadi (status "Restoring" → lalu active).

### 2. Salin URL + anon key
Di dashboard project kamu:
- Klik menu kiri **Project Settings** (ikon gigi) → **API**
- Salin **Project URL** → contoh: `https://abcdefgh.supabase.co`
- Salin **anon public** key → string panjang `eyJ...`
- (Tombol **Copy** di tiap field untuk salin)

### 3. Isi kredensial ke file `js/supabase-config.js`
Buka file `js/supabase-config.js` dan isi 2 nilai:

```js
const SUPABASE_CONFIG = {
    url: "https://abcdefgh.supabase.co",   // ← Project URL kamu
    anonKey: "eyJhbGciOi..."               // ← anon public key kamu
};
```

### 4. Buat tabel di database
1. Di dashboard Supabase, klik menu **SQL Editor**.
2. Buka file `supabase-setup.sql` di project ini, salin isinya.
3. Tempel di SQL Editor → klik **Run**.
4. Konfirmasi muncul tabel **`kjt_app`**.

### 5. Push website
```bash
git add -A
git commit -m "feat: sync ke cloud via Supabase"
git push
```

## Selesai! ✅
- Buka website (https://fsstraa.github.io/KJT/ atau via `mulai.bat`).
- Badge header akan menunjukkan **"Database Cloud"** saat berhasil terhubung.
- Coba simpan penjualan di laptop, lalu buka di HP — datanya akan muncul otomatis (bahkan secara realtime bila kedua halaman terbuka).

> Catatan: `server.js` / `mulai.bat` & folder `server-data/` sudah TIDAK dipakai lagi untuk sinkronisasi. Kamu cukup pakai website yang jalan di manapun (karena datanya dari cloud). Bisa dihapus bila mau.