# JMC Operations Hub — Jurukur Mahabob & Co. Sdn. Bhd.

Portal dashboard dalaman untuk operasi Jurukur Mahabob. Satu hub (`index.html`) yang kumpulkan semua aplikasi HOD — tapak, pelan, BIM, inventori — dalam satu tempat, dengan Dashboard Utama yang ringkaskan status operasi syarikat.

Semua aplikasi ialah fail HTML statik (tiada build step). Data datang dari Google Sheets (CSV yang di-publish) dan Google Apps Script Web App, atau disimpan terus dalam browser (localStorage).

---

## Kandungan

- [Modul](#modul)
- [Struktur folder](#struktur-folder)
- [Cara ia berfungsi](#cara-ia-berfungsi)
- [Setup](#setup)
- [Konfigurasi sumber data](#konfigurasi-sumber-data)
- [Backup & restore](#backup--restore)
- [Keselamatan & had](#keselamatan--had)
- [Teknologi](#teknologi)

---

## Modul

| Modul | Folder | Fungsi | Sumber data |
|---|---|---|---|
| **Dashboard Utama** | `index.html` | Hub + ringkasan operasi semua jabatan | Baca data dari semua modul |
| **Laporan Harian Tapak** | `HOD Site/Laporan Harian/` | Paste laporan harian kerja lapangan, auto-parse, KPI progres & jam krew | Apps Script Web App + Google Sheets |
| **Status Site** | `HOD Site/Status Site/` | Progres kerja ukur ikut no. fail, borang tambah kerja lapangan | Google Sheets (CSV) + Apps Script |
| **Status Pelan** | `HOD Pelan/Status Pelan/` | Pengurusan pelan & lukisan, prestasi pelukis pelan, isu tapak, arkib projek | Apps Script Web App + localStorage |
| **Kualiti Pelan (QC)** | `HOD Pelan/Kualiti Pelan/` | Semakan data QC ikut bidang, carta | Google Sheets (CSV) |
| **Checklist Plan** | `HOD Pelan/Checklist Plan/` | Senarai semak digital pelan (MAHABOB DIGITAL PLAN QC) | Apps Script Web App (`doPost`) + Google Sheets |
| **GEO-BIM Tracker** | `HOD BIM/` | Jejak perjalanan fail Scan to BIM (Belum Mula → Siap) | localStorage |
| **Inventori Peralatan** | `Inventori Peralatan/` | Daftar peralatan ukur, ikut pemegang & kategori, status kalibrasi | Apps Script Web App + Google Sheets |
| **Fail Tracking** | `Fail Tracking/` | Jejak fail dari Data Collection hingga Signed by LS & invois | localStorage |
| **Penjana Sebut Harga** | `Penjana Sebut Harga/` | Jana sebut harga rasmi atas kepala surat, print/PDF | localStorage |
| **Perancangan & Ramalan** | `Perancangan & Ramalan/` | Ramal tempoh, bilangan krew & kos ikut tarikh akhir dan kadar produktiviti | localStorage |

---

## Struktur folder

```
JurukurMahabob/
├── index.html                      # Hub utama (JMC Operations Hub)
├── Fail Tracking/Index.html
├── Penjana Sebut Harga/Index.html
├── Perancangan & Ramalan/Index.html
├── Inventori Peralatan/index.html
├── HOD BIM/index.html
├── HOD Site/
│   ├── Laporan Harian/index.html
│   └── Status Site/index.html
└── HOD Pelan/
    ├── Status Pelan/index.html
    ├── Kualiti Pelan/index.html
    └── Checklist Plan/index.html
```

> **Penting:** Nama fail ikut huruf sebenar (`Index.html` vs `index.html`). GitHub Pages sensitif huruf besar/kecil, jadi jangan tukar nama tanpa kemas kini rujukan dalam `index.html` (`MODULES` dan `APPS`).

---

## Cara ia berfungsi

1. **Hub muat aplikasi dalam iframe.** Setiap modul dibuka dari folder repo masing-masing, jadi bila kau update fail dalam folder, terus nampak dalam hub. Butang "Buka" juga boleh buka modul dalam tab baru.
2. **Dashboard Utama baca data modul.** Sebab semua modul duduk dalam origin yang sama (GitHub Pages), hub boleh baca localStorage modul lain dan terima ringkasan melalui `postMessage` (contoh: Status Site hantar ringkasan progres fail).
3. **Data luar dari Google Sheets.** Modul seperti Kualiti Pelan dan Status Site ambil data dari Google Sheets yang di-publish sebagai CSV (dibaca guna PapaParse).
4. **Tulis data melalui Apps Script.** Modul yang perlu simpan data ke Sheets (Laporan Harian, Checklist Plan, Status Pelan, Inventori) panggil Web App Apps Script melalui `fetch` (`doGet` / `doPost`).
5. **Hub tak bersarang.** Kalau hub dibuka dalam iframe aplikasi (contoh klik "Portal Utama" dari HOD Site), ia kosongkan diri supaya tak jadi hub dalam hub.

---

## Setup

### 1. Hosting (GitHub Pages)

1. Push repo ke GitHub.
2. Pergi **Settings → Pages**, pilih branch `main` dan folder `/ (root)`.
3. Buka `https://<username>.github.io/<repo>/` — itu Dashboard Utama.

Untuk test secara lokal, guna server ringkas (jangan buka terus guna `file://`, sebab iframe & fetch akan disekat):

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

### 2. Google Sheets (CSV)

Untuk setiap Sheet yang dibaca sebagai CSV:

1. Buka Google Sheet → **File → Share → Publish to web**.
2. Pilih tab yang betul, format **Comma-separated values (.csv)**.
3. Salin URL `.../pub?gid=...&single=true&output=csv` dan tampal dalam config modul berkenaan.

### 3. Google Apps Script Web App

Untuk modul yang tulis data:

1. Dari Google Sheet, buka **Extensions → Apps Script**.
2. Tampal kod `Code.gs` (untuk Laporan Harian, kod penuh dah disediakan dalam aplikasi itu sendiri — buka tab **Kod Apps Script**).
3. Skrip akan bina tab & header sendiri kalau belum wujud.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin URL `/exec` dan tampal dalam config modul.

> Setiap kali ubah kod Apps Script, buat **Deploy → Manage deployments → Edit → New version**. Kalau tak, Web App masih jalan versi lama.

---

## Konfigurasi sumber data

URL Sheets dan Web App ditetapkan terus dalam setiap fail HTML. Cari pemalar berikut:

| Fail | Pemalar |
|---|---|
| `index.html` | Objek sumber data (`inv`, `qc`, `lh`, dll.) untuk Dashboard Utama |
| `HOD Site/Status Site/index.html` | `CSV_REKOD_URL`, `CSV_LAPORAN_URL`, `APPS_SCRIPT_URL` |
| `HOD Site/Laporan Harian/index.html` | `MACRO_URL` |
| `HOD Pelan/Checklist Plan/index.html` | `PUBLISHED_BASE_URL`, `GAS_API_URL` |
| `HOD Pelan/Status Pelan/index.html` | `CFG.API_URL` |
| `Inventori Peralatan/index.html` | URL Web App dalam config |

Kalau tukar Sheet atau deploy semula Web App dengan URL baru, kemas kini kedua-dua fail modul **dan** `index.html` (sebab Dashboard Utama baca sumber yang sama).

---

## Backup & restore

Modul yang guna localStorage (Fail Tracking, Penjana Sebut Harga, Perancangan & Ramalan, GEO-BIM Tracker, Status Pelan) simpan data **dalam browser itu sahaja**.

- Hub ada fungsi **Backup** — muat turun satu fail JSON yang kumpul semua key localStorage modul (termasuk `stb_*` untuk BIM).
- **Restore** akan ganti data sedia ada dalam browser dengan isi fail backup.
- Buat backup berkala. Clear browser data, tukar komputer atau guna incognito = data hilang.

Key localStorage yang digunakan:

```
mjt_ops_db, survey_tracker_v1, jmc_instrument_inventory_v1, jmc_quotation_v1,
jmc_quotation_lib_v1, jm_planner_v1, mjt_ops_sync, mjt_ops_lang,
drafter_projects_data, drafter_drawings_data, geo_local_reports,
stb_projects, stb_staff, stb_reports, jm_status_site_v1, mahabob_active_user_id
```

---

## Keselamatan & had

Benda ni perlu tahu sebelum guna untuk data sebenar:

- **CSV yang di-publish adalah awam.** Sesiapa yang ada URL boleh baca data. Jangan publish tab yang ada maklumat sensitif yang tak perlu untuk dashboard.
- **Web App "Anyone" tiada login.** Sesiapa yang tahu URL `/exec` boleh hantar data. Untuk kegunaan lebih serius, tambah semakan token/kunci dalam `doPost`, atau hadkan akses kepada akaun Google Workspace syarikat.
- **Repo awam = URL terdedah.** Kalau repo ini public, semua URL Sheets & Web App dalam kod boleh dilihat. Pertimbang jadikan repo private (GitHub Pages untuk repo private perlukan plan berbayar) atau pindahkan URL ke satu fail config yang tak di-commit.
- **localStorage bukan pangkalan data.** Tiada sync antara pengguna atau peranti. Data satu orang tak nampak pada komputer orang lain.
- **Modul `ops` (`modules/ops.html`)** dirujuk dalam `index.html` tetapi fail itu tiada dalam repo sekarang. Bahagian Operasi HOD dalam hub tak akan dimuat sehingga fail itu ditambah.
- Bergantung pada CDN luar (Tailwind CDN, Chart.js, PapaParse, Lucide, Bootstrap, Font Awesome). Perlu internet untuk berfungsi.

---

## Teknologi

- HTML, CSS, JavaScript (vanilla) — tiada framework, tiada build step
- [Tailwind CSS (CDN)](https://tailwindcss.com/) / Bootstrap 5
- [Chart.js](https://www.chartjs.org/) — carta
- [PapaParse](https://www.papaparse.com/) — parse CSV dari Google Sheets
- [Lucide](https://lucide.dev/) & Font Awesome — ikon
- Google Sheets + Google Apps Script — backend data
- GitHub Pages — hosting

---

© Jurukur Mahabob & Co. Sdn. Bhd. Kegunaan dalaman.
