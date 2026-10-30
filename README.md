# Patungan Yuu

Aplikasi web untuk bagi-bagi bill tanpa drama. Buat sesi, bagikan link, setiap peserta mengklaim item yang mereka ambil, lalu total tiap orang dihitung otomatis. Dibangun dengan Vue 3 + TypeScript, data di Supabase, hosting statis di Netlify.

## Fitur

- Buat sesi patungan dan bagikan satu link ke semua peserta. Tanpa login.
- Setiap peserta membuka link, mengisi nama, dan mengklaim item dari HP masing-masing.
- Sinkronisasi realtime: perubahan peserta, item, dan klaim langsung terlihat di perangkat lain.
- Harga per item, jumlah, diskon per item (persen atau nominal).
- Diskon total bill yang dibagi proporsional sesuai subtotal tiap orang.
- Pajak / service opsional, dihitung setelah diskon.
- Item bersama dibagi sesuai bobot porsi tiap pengklaim.
- Pembulatan rupiah yang selalu pas: jumlah total semua orang sama persis dengan grand total.
- Ringkasan per orang + tombol bagikan ke WhatsApp atau clipboard.
- Item yang belum diklaim ditandai dan tidak dibebankan ke siapa pun.
- Mobile-first, fokus keyboard, dan menghormati `prefers-reduced-motion`.

## Stack

- Vue 3 (Composition API, `<script setup>`) + Vite + TypeScript
- Pinia, Vue Router
- Tailwind CSS v4
- Supabase (Postgres, RLS, Realtime)
- Vitest untuk unit test logika perhitungan

## Setup lokal

### 1. Siapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com/dashboard).
2. Buka **SQL Editor**, salin seluruh isi [`supabase/schema.sql`](./supabase/schema.sql), lalu jalankan.
   File ini membuat tabel `sessions`, `participants`, `items`, dan `item_assignments`, mengaktifkan RLS, dan mendaftarkan tabel ke Realtime.
3. Buka **Project Settings → API**, salin **Project URL** dan **anon public key**.

### 2. Konfigurasi environment

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Jalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Jika env belum diisi, aplikasi menampilkan panduan setup dan tombol buat sesi dinonaktifkan.

## Cara perhitungan

Semua nominal dihitung sebagai rupiah bulat.

1. Harga kotor item = `harga satuan × qty`.
2. Diskon item (persen atau nominal) dikurangkan dari harga kotor item. Nominal diskon dibatasi agar tidak melebihi harga.
3. Harga bersih item dibagi ke pengklaim sesuai bobot porsi (`item_assignments.quantity`).
4. Diskon total bill dibagi proporsional berdasarkan subtotal tiap orang.
5. Pajak dihitung dari total setelah diskon bill, lalu dibagi proporsional.
6. Pembagian integer memakai metode largest remainder supaya jumlah bagian selalu sama dengan total yang dibagi.

Item tanpa klaim tidak masuk tagihan dan ditampilkan sebagai peringatan di ringkasan.

## Scripts

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Dev server Vite |
| `npm run build` | Typecheck + build produksi ke `dist/` |
| `npm run preview` | Preview hasil build |
| `npm run typecheck` | Cek tipe dengan `vue-tsc` |
| `npm run test` | Jalankan unit test sekali |
| `npm run test:watch` | Unit test mode watch |

## Struktur utama

```
src/
├─ lib/calculate.ts      # logika pembagian + pembulatan
├─ lib/supabase.ts       # klien Supabase + validasi env
├─ lib/identity.ts       # identitas peserta per sesi di localStorage
├─ lib/share.ts          # teks ringkasan, share, clipboard
├─ stores/session.ts     # state sesi, mutasi, realtime
├─ views/                # Home, Session, NotFound
└─ components/           # UI item, klaim, peserta, ringkasan, modal
supabase/schema.sql      # skema database + RLS + realtime
```

## Deploy ke Netlify

1. Push project ke GitHub/GitLab.
2. Di Netlify, pilih **Add new site → Import an existing project**, hubungkan repo.
3. Build command `npm run build`, publish directory `dist` (sudah diatur di [`netlify.toml`](./netlify.toml)).
4. Tambahkan environment variables di **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Redirect SPA `/* → /index.html` sudah disiapkan agar link `/s/:slug` bisa dibuka langsung.

Alternatif via CLI:

```bash
npm i -g netlify-cli
netlify deploy --build
netlify deploy --build --prod
```

Set env yang sama lewat dashboard Netlify atau `netlify env:set VITE_SUPABASE_URL ...`.

## Catatan keamanan

Aplikasi ini sengaja tanpa login. Kebijakan RLS di `schema.sql` memberi akses penuh ke role `anon`, sehingga siapa pun yang memiliki URL project Supabase dan anon key dapat membaca atau menulis semua sesi. Ini wajar untuk aplikasi patungan kasual, tetapi jangan menyimpan data sensitif di dalamnya.

Jika butuh isolasi lebih kuat, langkah lanjutan yang bisa diambil:

- Aktifkan Supabase Anonymous Auth dan ubah policy berbasis `auth.uid()`.
- Batasi operasi tulis lewat RPC yang memverifikasi secret per sesi.
- Tambahkan Edge Function untuk validasi dan rate limiting.

## Troubleshooting

- **`vite` atau `vitest` tidak ditemukan** saat `npm run dev`/`npm run test`: environment mungkin memasang `NODE_ENV=production`. Jalankan `npm install --include=dev`.
- **Status di header tetap "Menyambung"**: pastikan keempat tabel sudah masuk publication Realtime. `supabase/schema.sql` sudah melakukannya; cek juga Realtime aktif di dashboard Supabase.
- **Sesi tidak ditemukan padahal link benar**: pastikan `supabase/schema.sql` sudah dijalankan di project yang sama dengan URL di `.env.local`/Netlify.
- **Link share mengarah ke localhost**: buka aplikasi dari domain Netlify saat membagikan link; link dibentuk dari origin browser.

## Kustomisasi tampilan

Token warna, font, radius, dan style komponen ada di [`src/style.css`](./src/style.css) (blok `@theme` dan `@layer components`).
