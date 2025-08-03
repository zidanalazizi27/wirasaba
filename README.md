README PROYEK WIRASABA
======================

Deskripsi Umum:
---------------
Proyek ini adalah aplikasi web berbasis Next.js yang digunakan untuk Sistem Informasi Geografis (SIG) direktori perusahaan IBS dan Sistem Informasi Manajemen (SIM) survei terkait IBS di Kabupaten Sidoarjo. Proyek ini menggunakan berbagai library modern seperti React, Next.js, TailwindCSS, MUI, Leaflet, dan lain-lain.

Struktur Direktori & Penjelasan File:
-------------------------------------

1. File Konfigurasi & Root
--------------------------
- `package.json`         : Daftar dependensi, script npm, metadata proyek.
- `tsconfig.json`        : Konfigurasi TypeScript.
- `next.config.js`       : Konfigurasi Next.js.
- `eslint.config.mjs`    : Konfigurasi ESLint untuk linting kode.
- `postcss.config.mjs`   : Konfigurasi PostCSS.
- `tailwind.config.ts`   : Konfigurasi TailwindCSS.
- `server.js`            : Custom server untuk menjalankan Next.js menggunakan Node.js HTTP server.
- `.env.local`           : File environment variable (tidak dibagikan ke publik).
- `README.md`            : Dokumentasi struktur & fungsi file proyek.
- 
2. Direktori Publik
-------------------
- `public/`              : Berisi aset statis (gambar, svg, geojson, dsb).
  - `data/`              : Data geojson wilayah (misal: polygon_wilayah.geojson).
  - `image/`             : Gambar, ikon, logo, dan aset visual lain.

3. Source Code Utama (`src/`)

- `theme.ts`             : Konfigurasi tema Material UI (MUI) untuk styling global.
- `types/`               : Definisi tipe TypeScript, misal ekstensi leaflet-heat.
- `app/`                 : Folder utama aplikasi Next.js (App Router), berisi:
  - `globals.css`        : CSS global seluruh aplikasi.
  - `layout.tsx`         : Layout global (membungkus semua halaman).
  - `middleware.ts`      : Middleware untuk autentikasi dan proteksi route.
  - `page.tsx`           : Halaman utama/beranda aplikasi.
  - `favicon.ico`        : Ikon aplikasi.
  - `admin/`             : Halaman dan fitur admin:
    - `page.tsx`         : Halaman landing admin.
    - `direktori/`       : Manajemen direktori perusahaan IBS:
      - `page.tsx`       : Tabel daftar direktori perusahaan.
      - `tambah/page.tsx`: Form tambah data perusahaan.
      - `[id_perusahaan]/page.tsx` : Detail perusahaan.
      - `[id_perusahaan]/edit/page.tsx` : Edit data perusahaan.
    - `pcl/`             : Manajemen petugas survei (PCL):
      - `page.tsx`       : Tabel daftar PCL.
    - `profil/`          : Profil admin:
      - `page.tsx`       : Form profil & ganti password.
    - `riwayat_survei/`  : Riwayat survei perusahaan:
      - `page.tsx`       : Tabel riwayat survei.
    - `survei/`          : Manajemen survei:
      - `page.tsx`       : Tabel survei.
  - `api/`               : API route Next.js (REST endpoint untuk auth, perusahaan, direktori, dsb):
    - Setiap subfolder mewakili resource/entitas dan berisi file `route.ts` sebagai handler API (CRUD, filter, integrasi database MySQL). Berikut detailnya:
      - `auth/login/route.ts`         : Endpoint login user (POST, validasi username/password, JWT).
      - `badan-usaha/route.ts`        : Endpoint data badan usaha (GET daftar badan usaha).
      - `desa/route.ts`               : Endpoint data desa (GET daftar desa, filter by kecamatan).
      - `direktori/route.ts`          : Endpoint data direktori perusahaan (GET semua/tampil per tahun/perusahaan).
      - `investasi/route.ts`          : Endpoint data kategori investasi (GET daftar investasi).
      - `kecamatan/route.ts`          : Endpoint data kecamatan (GET daftar kecamatan).
      - `lokasi-perusahaan/route.ts`  : Endpoint data lokasi perusahaan (GET daftar lokasi).
      - `omset/route.ts`              : Endpoint data kategori omset (GET daftar omset).
      - `pcl/route.ts`                : Endpoint data PCL (GET, filter, dropdown, pagination, dsb).
      - `perusahaan/route.ts`         : Endpoint utama data perusahaan (GET, filter, search, sort, pagination, dsb).
        - `perusahaan/peta/route.ts`  : Endpoint khusus data perusahaan untuk peta (koordinat, dsb).
        - `perusahaan/export/`        : Endpoint ekspor data perusahaan.
        - `perusahaan/import/`        : Endpoint impor data perusahaan.
        - `perusahaan/check-duplicate/` : Endpoint pengecekan duplikasi data perusahaan.
        - `perusahaan/dropdown/`      : Endpoint dropdown perusahaan untuk form.
        - `perusahaan/pcl_utama/`     : Endpoint PCL utama perusahaan.
        - `perusahaan/template/`      : Endpoint template impor perusahaan.
        - `perusahaan/[id]/`          : Endpoint detail perusahaan by id.
      - `profile/route.ts`            : Endpoint profil user (GET/PUT profil, ganti password, verifikasi token).
      - `riwayat-survei/route.ts`     : Endpoint riwayat survei (GET, filter, ekspor, impor, template, dsb).
        - `riwayat-survei/by-kip/`    : Endpoint riwayat survei berdasarkan KIP perusahaan.
        - `riwayat-survei/export/`    : Endpoint ekspor riwayat survei.
        - `riwayat-survei/import/`    : Endpoint impor riwayat survei.
        - `riwayat-survei/filters/`   : Endpoint filter riwayat survei.
        - `riwayat-survei/template/`  : Endpoint template impor riwayat survei.
        - `riwayat-survei/[id]/`      : Endpoint detail riwayat survei by id.
      - `stats/route.ts`              : Endpoint statistik ringkasan (jumlah perusahaan berdasarkan KIP, pcl, survei).
      - `survei/route.ts`             : Endpoint data survei (GET, filter, ekspor, impor, template, dsb).
        - `survei/export/`            : Endpoint ekspor survei.
        - `survei/import/`            : Endpoint impor survei.
        - `survei/filters/`           : Endpoint filter survei.
        - `survei/template/`          : Endpoint template impor survei.
        - `survei/[id]/`              : Endpoint detail survei by id.
      - `tenaga-kerja/route.ts`       : Endpoint data kategori tenaga kerja (GET daftar tenaga kerja).
    - Setiap endpoint umumnya mendukung method GET (ambil data), POST (tambah data), PUT/PATCH (update data), DELETE (hapus data), serta filtering, search, dan integrasi ke database MySQL.
  - `components/`        : Komponen UI reusable:
    - `navbar.tsx`       : Navigasi utama aplikasi (menu, login/logout, responsif, highlight halaman aktif).
    - `footer.tsx`       : Footer aplikasi (kontak, sosial media, alamat, email, dsb).
    - `hero.tsx`         : Hero section di beranda (animasi judul, background dinamis).
    - `beranda_card.tsx` : Statistik ringkasan (jumlah perusahaan, PCL, survei) di beranda.
    - `map.tsx`          : Peta interaktif (Leaflet, marker perusahaan, heatmap, choropleth, filter, ekspor Excel, statistik visual, popup detail, dsb).
    - `login.tsx`        : Form login pengguna (input username/password, validasi, toggle password).
    - `kbli.tsx`         : Tabel & info KBLI (accordion, deskripsi, ikon, animasi countup).
    - `tentang.tsx`      : Penjelasan survei, aplikasi, dan FAQ (accordion, animasi, dsb).
    - `sda.tsx`          : Komponen informasi Kabupaten Sidoarjo (animasi, info beranda).
    - `im.tsx`           : Komponen Industri Manufaktur (animasi, info beranda).
    - `ki.tsx`           : Komponen Klasifikasi Industri (mikro, kecil, sedang, besar).
    - `kind.tsx`         : Komponen Kawasan Industri (daftar kawasan, gambar, link peta).
    - `pd.tsx`           : Komponen Produk Domestik (cover, info, animasi).
    - `admin/`           : Komponen khusus admin (sidebar, tabel, form, dsb):
      - `sidebar_layout.tsx` : Layout admin dengan sidebar dan konten utama.
      - `sidebar_adm.tsx`    : Sidebar navigasi admin (menu, submenu, ikon, responsive).
      - `tabel_direktori.tsx`: Tabel data direktori perusahaan (filter, search, ekspor, aksi CRUD).
      - `detail_direktori.tsx`: Form/detail perusahaan (view, edit, validasi, peta lokasi, dsb).
      - `tabel_pcl.tsx`      : Tabel data PCL (filter, search, aksi CRUD).
      - `pcl_form.tsx`       : Form tambah/edit PCL.
      - `tabel_riwayat_survei.tsx`: Tabel data riwayat survei (filter, search, ekspor, aksi CRUD).
      - `riwayat_survei_form.tsx`  : Form tambah/edit riwayat survei.
      - `tabel_survei.tsx`   : Tabel data survei (filter, search, ekspor, aksi CRUD).
      - `survei_form.tsx`    : Form tambah/edit survei.
      - `breadcrumb.tsx`     : Breadcrumb navigasi admin (otomatis/manual).
      - `riwayat_survei_perusahaaan.tsx` : Riwayat survei per perusahaan (tabel, summary).
    - `AuthLoading.tsx`      : Komponen loading autentikasi (spinner, overlay).
    - Komponen lain (modal, alert, dsb) dapat ditambahkan sesuai kebutuhan.
  - `context/`           : Context React (misal: AuthContext untuk autentikasi).
    - `AuthContext.tsx`  : Context autentikasi user (login/logout, state user).
  - `HOC/`               : Higher Order Component (misal: withAuth untuk proteksi route).
    - `withAuth.tsx`     : Wrapper proteksi route (hanya user login yang bisa akses).
  - `utils/`             : Utility/helper functions (cookie, alert, dsb).
    - `cookieUtils.ts`   : Helper manajemen cookie.
    - `surveyStatusUtils.ts` : Helper status survei.
    - `sweetAlert.ts`    : Helper custom alert (SweetAlert2).
  - `login/`             : Halaman login aplikasi.
    - `page.tsx`         : Halaman login.
  - `kbli/`              : Halaman KBLI (klasifikasi baku lapangan usaha).
    - `page.tsx`         : Halaman KBLI.
  - `peta_tematik/`      : Halaman peta tematik.
    - `page.tsx`         : Halaman peta tematik.
  - `tentang/`           : Halaman tentang aplikasi.
    - `page.tsx`         : Halaman tentang aplikasi.

4. Fungsi Utama dalam Beberapa File Penting
-------------------------------------------
- `navbar.tsx`           :
  - Navigasi menu utama (beranda, peta tematik, KBLI, tentang, admin).
  - Login/logout (menggunakan context autentikasi).
  - Responsif (mobile & desktop).
- `map.tsx`              :
  - Menampilkan peta Leaflet dengan marker perusahaan, heatmap, choropleth.
  - Filter data (tahun, kecamatan, KBLI, badan usaha, lokasi).
  - Ekspor data ke Excel.
  - Statistik visual (pie chart, bar chart).
  - Interaksi marker & popup detail perusahaan.
- `server.js`            :
  - Menjalankan custom HTTP server untuk Next.js.

5. Lain-lain
------------
- `node_modules/`, `.next/` : Folder internal (otomatis, jangan diubah manual).
- `.git/`                   : Folder git version control.

6. Catatan:
--------
- Untuk detail fungsi setiap file, lihat komentar di dalam kode masing-masing file.
- Struktur folder dapat berubah sesuai pengembangan.
- Dokumentasi ini hanya ringkasan, untuk detail lebih lanjut cek file README.md dan komentar kode.

---
