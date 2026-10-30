# Patungan Yuu

Aplikasi web untuk bagi-bagi bill tanpa drama. Buat sesi, bagikan link, setiap peserta mengklaim item yang mereka ambil, lalu total tiap orang dihitung otomatis. Dibangun dengan React 19 + TypeScript dan AlignUI-style design system. Data memakai Supabase untuk production, dengan mode lokal berbasis localStorage untuk development. Hosting statis di Netlify.

## Fitur

- Mode lokal untuk development: semua fitur berjalan tanpa Supabase, data tersimpan di browser.
- Buat sesi patungan dan bagikan satu link ke semua peserta. Tanpa login.
- Setiap peserta membuka link, mengisi nama, dan mengklaim item dari HP masing-masing.
- Sinkronisasi realtime: perubahan peserta, item, dan klaim langsung terlihat di perangkat lain.
- Harga per item, jumlah, diskon per item (persen atau nominal).
- Diskon total bill yang bisa dibagi proporsional atau rata.
- Ongkir tambahan yang dibagi rata ke peserta yang punya item.
- Opsi diskon bill: per item (ongkir tidak ikut diskon) atau total akhir (ongkir ikut diskon).
- Service charge dan pajak/PB1 terpisah, pilihan dasar pajak sebelum/sesudah diskon, dan tip opsional.
- Pengecekan total struk: tampilkan selisih antara total aplikasi dan struk.
- Item bersama dibagi sesuai bobot porsi tiap pengklaim.
- Pembulatan rupiah yang selalu pas: jumlah total semua orang sama persis dengan grand total.
- Penerima transfer (yang menalangi bill), status lunas per peserta, dan instruksi transfer.
- Pembulatan nominal transfer ke Rp500/Rp1.000 tanpa mengubah total bill.
- QR code untuk berbagi link, rename peserta tanpa kehilangan klaim, dan duplikat item.
- Aksi cepat untuk item belum diklaim: bagi rata ke semua peserta atau bebankan ke penerima.
- Ringkasan per orang + tombol bagikan ke WhatsApp atau clipboard.
- Item yang belum diklaim ditandai dan tidak dibebankan ke siapa pun.
- Antarmuka dua bahasa: Indonesia dan English, dengan switch di header.
- Tema terang/gelap dengan switch; pilihan bahasa dan tema tersimpan di perangkat.
- Mobile-first, fokus keyboard, dan menghormati `prefers-reduced-motion`.

## Stack

- React 19 + TypeScript + Vite
- React Router
- Zustand untuk state sesi dan toast
- Tailwind CSS v4
- AlignUI-style design tokens dan primitives (lihat catatan AlignUI di bawah)
- Supabase (Postgres, RLS, Realtime)
- Vitest untuk unit test logika perhitungan

## Menjalankan lokal

### Mode lokal (tanpa Supabase)

Cocok untuk development dan mencoba semua fitur:

```bash
npm install --include=dev
npm run dev
```

Buka `http://localhost:5173`. Saat development tanpa kredensial Supabase, aplikasi otomatis memakai localStorage dengan key `patungan:local:sessions:v1`. Data tetap ada setelah reload, tetapi link sesi hanya bisa dibuka di browser yang sama.

Form awal hanya meminta nama sesi. Diskon bill, ongkir, service, pajak, tip, pembulatan, dan total struk diatur di halaman sesi lewat tombol **Atur bill & pembayaran**.

### Mode Supabase (production / lintas perangkat)

1. Buat project baru di [supabase.com](https://supabase.com/dashboard).
2. Buka **SQL Editor**, salin seluruh isi [`supabase/schema.sql`](./supabase/schema.sql), lalu jalankan.
   File ini membuat tabel `sessions`, `participants`, `items`, dan `item_assignments`, mengaktifkan RLS, dan mendaftarkan tabel ke Realtime. File ini aman dijalankan ulang; jalankan lagi setelah update untuk menambahkan kolom pembayaran, ongkir, scope diskon, service, tip, dan pembulatan.
3. Salin kredensial API:
   - Klik tombol **Connect** di kanan atas dashboard project. Di tab **App Frameworks**, salin **Project URL** dan **publishable key** (`sb_publishable_...`).
   - Key juga bisa diambil di **Settings → API Keys**. Key legacy `anon` (`eyJ...`) tetap berfungsi.
   - URL juga bisa disusun dari project ref di address bar: `https://<project-ref>.supabase.co`.
   - Jangan pernah memakai `secret` atau `service_role` key di aplikasi frontend.
4. Buat `.env.local` dari contoh, lalu hapus tanda `#` dan isi dua variabel Supabase:

   ```bash
   cp .env.example .env.local
   ```

   ```dotenv
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```

5. Jalankan `npm run dev`. Karena env terisi, aplikasi otomatis memakai Supabase.

### Memilih mode data

`VITE_DATA_MODE` opsional:

- `local` memaksa localStorage, meskipun env Supabase terisi.
- `supabase` memaksa Supabase.
- Kosong berarti otomatis: `local` saat dev server tanpa env, `supabase` saat production.

Production tanpa env Supabase akan menampilkan panduan setup dan menonaktifkan pembuatan sesi, supaya data tidak tersimpan lokal di browser pengunjung.

## Bahasa dan tema

Switch bahasa (ID/EN) dan tema (terang/gelap) ada di header Home dan halaman sesi. Preferensi disimpan di `localStorage` dengan key `patungan:preferences`, jadi tetap sama setelah reload.

- Bahasa juga mengubah `<html lang>`, judul dokumen, dan meta description.
- Tema mengikuti `prefers-color-scheme` saat belum ada pilihan, lalu menyimpan pilihan eksplisit.
- Inline script di [`index.html`](./index.html) menerapkan tema dan bahasa sebelum React mount supaya tidak ada flash warna.
- Token tema gelap ada di blok `.dark` pada [`src/styles.css`](./src/styles.css).

## Pembayaran

- Pilih siapa yang menalangi bill di panel **Pembayaran**. Panel ini menampilkan arah transfer dan total yang belum dibayar.
- Status lunas disimpan bersama nominal yang dibayar. Jika total berubah setelah ditandai lunas, status berubah menjadi **Perlu dicek**.
- Pembulatan Rp500/Rp1.000 hanya berlaku untuk nominal transfer ke penerima, bukan total bill.
- Penerima transfer tidak perlu transfer ke dirinya sendiri; bagiannya tetap tampil di ringkasan.

## Cara perhitungan

Semua nominal dihitung sebagai rupiah bulat.

1. Harga kotor item = `harga satuan × qty`.
2. Diskon item (persen atau nominal) dikurangkan dari harga kotor item. Nominal diskon dibatasi agar tidak melebihi harga.
3. Harga bersih item dibagi ke pengklaim sesuai bobot porsi (`item_assignments.quantity`).
4. Ongkir dibagi rata ke peserta yang punya item.
5. Diskon bill dihitung dari subtotal item saja (opsi **Per item**) atau dari subtotal item + ongkir (opsi **Total akhir**). Diskon dibagi proporsional sesuai dasar diskon, atau rata dengan batas maksimum per peserta.
6. Service charge dihitung dari total setelah ongkir dan diskon.
7. Pajak/PB1 dihitung dari dasar yang dipilih: sebelum atau sesudah diskon. Service charge ikut masuk dasar pajak.
8. Tip nominal dibagi proporsional sesuai subtotal item.
9. Pembagian integer memakai metode largest remainder supaya jumlah bagian selalu sama dengan total yang dibagi.

Item tanpa klaim tidak masuk tagihan dan ditampilkan sebagai peringatan di ringkasan. Aksi cepat bisa membagi rata item tersebut ke semua peserta atau membebankannya ke penerima transfer.

## Scripts

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Dev server Vite |
| `npm run build` | Typecheck + build produksi ke `dist/` |
| `npm run preview` | Preview hasil build |
| `npm run typecheck` | Cek tipe dengan `tsc --noEmit` |
| `npm run test` | Jalankan unit test sekali |
| `npm run test:watch` | Unit test mode watch |

## Struktur utama

```
src/
├─ main.tsx               # entry React
├─ App.tsx                # router dan toast host
├─ styles.css             # token AlignUI-style + Tailwind v4
├─ lib/calculate.ts       # logika pembagian + pembulatan
├─ lib/dataMode.ts        # pilih mode local atau supabase
├─ lib/repository/        # adapter data: localStorage dan Supabase
├─ lib/supabase.ts        # klien Supabase + validasi env
├─ lib/identity.ts        # identitas peserta per sesi di localStorage
├─ lib/share.ts           # teks ringkasan, share, clipboard
├─ store/session.ts       # state sesi, mutasi, sinkronisasi
├─ store/toast.ts         # notifikasi
├─ store/preferences.ts   # bahasa + tema, tersimpan di localStorage
├─ i18n/translations.ts   # kamus Indonesia/English
├─ views/                 # Home, Session, NotFound
├─ components/            # item, klaim, peserta, ringkasan, modal
└─ ui/                    # primitives bergaya AlignUI
supabase/schema.sql       # skema database + RLS + realtime
```

## Desain dan AlignUI

Aplikasi memakai bahasa visual AlignUI: token warna netral, aksen oranye, tipografi Ranade, radius, shadow, dan pola komponen AlignUI. Primitive React-nya ada di `src/ui/` dan dibangun sendiri dengan Tailwind, bukan salinan paket AlignUI PRO atau file Figma berbayar.

Kalau mau memakai base component resmi AlignUI yang gratis/open-source, primitive di `src/ui/` bisa diganti satu per satu tanpa mengubah halaman atau logika bisnis. Komponen PRO dan file Figma AlignUI tetap memerlukan lisensi terpisah.

## Deploy ke Netlify

1. Push project ke GitHub/GitLab.
2. Di Netlify, pilih **Add new site → Import an existing project**, hubungkan repo.
3. Build command `npm run build`, publish directory `dist` (sudah diatur di [`netlify.toml`](./netlify.toml)).
4. Tambahkan environment variables di **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Jangan mengisi `VITE_DATA_MODE=local` untuk production, karena data akan tersimpan di browser masing-masing pengunjung dan link tidak bisa dibagi.
5. Deploy. Redirect SPA `/* → /index.html` sudah disiapkan agar link `/s/:slug` bisa dibuka langsung.
6. Setelah mengubah environment variable, jalankan **Deploys → Trigger deploy → Clear cache and deploy site** karena Vite membaca env saat build.

Alternatif via CLI:

```bash
npm i -g netlify-cli
netlify deploy --build
netlify deploy --build --prod
```

Set env yang sama lewat dashboard Netlify atau `netlify env:set VITE_SUPABASE_URL ...`.

## Catatan keamanan

Aplikasi ini sengaja tanpa login. Kebijakan RLS di `schema.sql` memberi akses penuh ke role `anon`, sehingga siapa pun yang memiliki URL project Supabase dan anon key dapat membaca atau menulis semua sesi. Ini wajar untuk aplikasi patungan kasual, tetapi jangan menyimpan data sensitif di dalamnya.

Di mode lokal, data hanya tersimpan di `localStorage` browser dan tidak dikirim ke mana pun. Mode ini untuk development, bukan untuk data yang perlu dibagikan.

Jika butuh isolasi lebih kuat, langkah lanjutan yang bisa diambil:

- Aktifkan Supabase Anonymous Auth dan ubah policy berbasis `auth.uid()`.
- Batasi operasi tulis lewat RPC yang memverifikasi secret per sesi.
- Tambahkan Edge Function untuk validasi dan rate limiting.

## Troubleshooting

- **`ERR_UNSUPPORTED_ESM_URL_SCHEME` / protokol `node:`** saat `npm run dev`: Node terlalu lama. Vite 8 membutuhkan Node `^20.19.0` atau `>=22.12.0`. Jalankan `nvm use` (membaca `.nvmrc`) atau `nvm use 24`, lalu `npm run dev`.
- **`vite` atau `vitest` tidak ditemukan** saat `npm run dev`/`npm run test`: environment mungkin memasang `NODE_ENV=production`. Jalankan `npm install --include=dev`.
- **Dev server menampilkan "Supabase belum tersambung"**: pastikan tidak ada `VITE_DATA_MODE=supabase`, lalu restart. Mode lokal aktif otomatis saat dev server tanpa env Supabase.
- **Masih "Mode lokal" padahal env Supabase sudah diisi**: restart dev server, pastikan nama variabel benar, dan tidak ada `VITE_DATA_MODE=local`.
- **Sesi hilang saat dibuka di browser/perangkat lain**: itu perilaku mode lokal. Isi env Supabase atau paksa `VITE_DATA_MODE=supabase`.
- **Status di header tetap "Menyambung"**: pastikan keempat tabel sudah masuk publication Realtime. `supabase/schema.sql` sudah melakukannya; cek juga Realtime aktif di dashboard Supabase.
- **Sesi tidak ditemukan padahal link benar**: pastikan `supabase/schema.sql` sudah dijalankan di project yang sama dengan URL di `.env.local`/Netlify.
- **Link share mengarah ke localhost**: buka aplikasi dari domain Netlify saat membagikan link; link dibentuk dari origin browser.

## Kustomisasi tampilan

Token warna, font, radius, dan style komponen ada di [`src/styles.css`](./src/styles.css) (blok `@theme`, `.dark`, dan `@layer components`). Font Ranade dimuat dari Fontshare di [`index.html`](./index.html). Primitive UI ada di `src/ui/`. Untuk menambah bahasa, tambahkan key yang sama di kamus `id` dan `en` pada `src/i18n/translations.ts`.
