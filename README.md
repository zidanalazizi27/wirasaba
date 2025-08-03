README PROYEK KAHURIPAN
======================

## Deskripsi Umum
Proyek ini adalah aplikasi web berbasis Next.js yang digunakan untuk Sistem Informasi Geografis (SIG) direktori perusahaan IBS dan Sistem Informasi Manajemen (SIM) survei terkait IBS. Proyek ini menggunakan berbagai library modern seperti React, Next.js, TailwindCSS, MUI, Leaflet, dan lain-lain.

## Struktur Direktori & Penjelasan File

### 1. File Konfigurasi & Root

### 2. Direktori Publik

### 3. Source Code Utama (`src/`)
- `theme.ts`             : Konfigurasi tema Material UI (MUI) untuk styling global.
- `types/`               : Definisi tipe TypeScript, misal ekstensi leaflet-heat.
- `app/`                 : Folder utama aplikasi Next.js (App Router), berisi:
  - `globals.css`        : CSS global seluruh aplikasi.
  - `layout.tsx`         : Layout global (membungkus semua halaman).
  - `middleware.ts`      : Middleware untuk autentikasi dan proteksi route.
  - `page.tsx`           : Halaman utama/beranda aplikasi.
  - `favicon.ico`        : Ikon aplikasi.
  - `not-found.tsx`      : Halaman error 404 jika route tidak ditemukan.
  - `loading.tsx`        : Komponen loading global (skeleton/loading state).
  - `error.tsx`          : Komponen error global (menampilkan error aplikasi).
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

### 4. Fungsi Utama dalam Beberapa File Penting
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

### 5. Lain-lain
- `node_modules/`, `.next/` : Folder internal (otomatis, jangan diubah manual).
- `.git/`                   : Folder git version control.
3. Source Code Utama (`src/`)
## Catatan
- Untuk detail fungsi setiap file, lihat komentar di dalam kode masing-masing file.
- Struktur folder dapat berubah sesuai pengembangan.
- Dokumentasi ini hanya ringkasan, untuk detail lebih lanjut cek file README.md dan komentar kode.

- `theme.ts`             : Konfigurasi tema Material UI (MUI) untuk styling global.
- `types/`               : Definisi tipe TypeScript, misal ekstensi leaflet-heat.
- `app/`                 : Folder utama aplikasi Next.js (App Router), berisi:
  - `globals.css`        : CSS global seluruh aplikasi.
  - `layout.tsx`         : Layout global (membungkus semua halaman).
  - `middleware.ts`      : Middleware untuk autentikasi dan proteksi route.
  - `page.tsx`           : Halaman utama/beranda aplikasi.
  - `favicon.ico`        : Ikon aplikasi.
  - `not-found.tsx`      : Halaman error 404 jika route tidak ditemukan.
  - `loading.tsx`        : Komponen loading global (skeleton/loading state).
  - `error.tsx`          : Komponen error global (menampilkan error aplikasi).
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
    - Setiap subfolder (misal: `badan-usaha/`, `direktori/`, `perusahaan/`, `pcl/`, `riwayat-survei/`, `survei/`, dll) berisi file `route.ts` sebagai handler API (CRUD, filter, integrasi database).
    - Subfolder lain seperti `perusahaan/peta/`, `perusahaan/export/`, dsb, untuk endpoint khusus.
  - `components/`        : Komponen UI reusable:
    - `navbar.tsx`       : Navigasi utama aplikasi (menu, login/logout, responsif).
    - `footer.tsx`       : Footer aplikasi (kontak, sosial media, dsb).
    - `hero.tsx`         : Hero section di beranda.
    - `beranda_card.tsx` : Statistik ringkasan di beranda.
    - `map.tsx`          : Peta interaktif (Leaflet, heatmap, choropleth, filter, ekspor Excel, dsb).
    - `login.tsx`        : Form login pengguna.
    - `kbli.tsx`         : Tabel & info KBLI.
    - `tentang.tsx`      : Penjelasan survei & aplikasi.
    - `sda.tsx`, `im.tsx`, `ki.tsx`, `kind.tsx`, `pd.tsx` : Komponen pendukung beranda.
    - `admin/`           : Komponen khusus admin (sidebar, tabel, form, dsb):
      - `sidebar_layout.tsx`, `sidebar_adm.tsx` : Layout & sidebar admin.
      - `tabel_direktori.tsx`, `detail_direktori.tsx` : Tabel & detail direktori perusahaan.
      - `tabel_pcl.tsx`, `pcl_form.tsx` : Tabel & form PCL.
      - `tabel_riwayat_survei.tsx`, `riwayat_survei_form.tsx` : Tabel & form riwayat survei.
      - `tabel_survei.tsx`, `survei_form.tsx` : Tabel & form survei.
      - `breadcrumb.tsx` : Breadcrumb navigasi admin.
      - `riwayat_survei_perusahaaan.tsx` : Riwayat survei per perusahaan.
    - Komponen lain (modal, alert, dsb).
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

Catatan:
--------
- Untuk detail fungsi setiap file, lihat komentar di dalam kode masing-masing file.
- Struktur folder dapat berubah sesuai pengembangan.
- Dokumentasi ini hanya ringkasan, untuk detail lebih lanjut cek file README.md dan komentar kode.

---
