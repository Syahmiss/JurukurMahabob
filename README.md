# JMC Operations Hub — Jurukur Mahabob & Co. Sdn. Bhd.

JMC Operations Hub ialah portal dashboard dalaman bagi pengurusan operasi Jurukur Mahabob & Co. Sdn. Bhd. Portal ini menghimpunkan aplikasi setiap jabatan (HOD) — kerja tapak, pelan, BIM dan inventori peralatan — dalam satu antara muka, di samping Dashboard Utama yang memaparkan ringkasan status operasi syarikat.

Kesemua aplikasi dibangunkan sebagai fail HTML statik tanpa proses *build*. Data diperoleh daripada Google Sheets (CSV yang diterbitkan) dan Google Apps Script Web App, atau disimpan secara setempat dalam pelayar (localStorage).

---

## Kandungan

- [Senarai Modul](#senarai-modul)
- [Struktur Direktori](#struktur-direktori)
- [Seni Bina Sistem](#seni-bina-sistem)
- [Pemasangan dan Konfigurasi](#pemasangan-dan-konfigurasi)
- [Konfigurasi Sumber Data](#konfigurasi-sumber-data)
- [Sandaran dan Pemulihan Data](#sandaran-dan-pemulihan-data)
- [Keselamatan dan Had Sistem](#keselamatan-dan-had-sistem)
- [Teknologi](#teknologi)

---

## Senarai Modul

| Modul | Direktori | Fungsi | Sumber Data |
|---|---|---|---|
| **Dashboard Utama** | `index.html` | Hub utama dan ringkasan operasi semua jabatan | Data daripada semua modul |
| **Laporan Harian Tapak** | `HOD Site/Laporan Harian/` | Merekod dan menganalisis laporan harian kerja lapangan, termasuk KPI kemajuan dan jam kerja krew | Apps Script Web App, Google Sheets |
| **Laporan Kenderaan** | `HOD Site/Laporan Kenderaan/` | Semakan harian kenderaan syarikat (air, minyak hitam, tayar, lampu, roadtax, odometer) dengan borang hantar & edit | Apps Script Web App, Google Sheets |
| **Status Site** | `HOD Site/Status Site/` | Memantau kemajuan kerja ukur mengikut nombor fail serta merekod kerja lapangan baharu | Google Sheets (CSV), Apps Script |
| **Status Pelan** | `HOD Pelan/Status Pelan/` | Pengurusan pelan dan lukisan, prestasi pelukis pelan, isu tapak dan arkib projek | Apps Script Web App, localStorage |
| **Kualiti Pelan (QC)** | `HOD Pelan/Kualiti Pelan/` | Semakan data kawalan kualiti mengikut bidang beserta paparan carta | Google Sheets (CSV) |
| **Checklist Plan** | `HOD Pelan/Checklist Plan/` | Senarai semak digital bagi kawalan kualiti pelan (Mahabob Digital Plan QC) | Apps Script Web App, Google Sheets |
| **GEO-BIM Tracker** | `HOD BIM/` | Penjejakan aliran kerja fail Scan to BIM dari peringkat awal hingga selesai | localStorage |
| **Inventori Peralatan** | `Inventori Peralatan/` | Pendaftaran peralatan ukur mengikut pemegang dan kategori, serta pemantauan status kalibrasi | Apps Script Web App, Google Sheets |
| **Fail Tracking** | `Fail Tracking/` | Penjejakan fail dari peringkat pengumpulan data hingga pengesahan Juruukur Tanah Berlesen dan invois | localStorage |
| **Penjana Sebut Harga** | `Penjana Sebut Harga/` | Penyediaan sebut harga rasmi berkepala surat syarikat, boleh dicetak atau dieksport ke PDF | localStorage |
| **Perancangan & Ramalan** | `Perancangan & Ramalan/` | Anggaran tempoh kerja, keperluan krew dan kos berdasarkan tarikh akhir serta kadar produktiviti | localStorage |

---

## Struktur Direktori

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
│   ├── Laporan Kenderaan/index.html
│   └── Status Site/index.html
└── HOD Pelan/
    ├── Status Pelan/index.html
    ├── Kualiti Pelan/index.html
    └── Checklist Plan/index.html
```

> **Perhatian:** Nama fail adalah sensitif kepada huruf besar dan kecil (`Index.html` berbeza daripada `index.html`) apabila dihoskan di GitHub Pages. Sebarang perubahan nama fail perlu diikuti dengan kemas kini rujukan dalam `index.html`, iaitu pada objek `MODULES` dan `APPS`.

---

## Seni Bina Sistem

1. **Pemuatan modul melalui iframe.** Setiap modul dimuatkan terus dari direktori masing-masing. Oleh itu, sebarang kemas kini pada fail modul akan dipaparkan dalam hub secara automatik. Modul juga boleh dibuka dalam tab baharu melalui butang "Buka".
2. **Pengumpulan data oleh Dashboard Utama.** Memandangkan semua modul berada dalam *origin* yang sama, hub dapat membaca data localStorage setiap modul dan menerima ringkasan melalui `postMessage` (contohnya, ringkasan kemajuan fail daripada modul Status Site).
3. **Pembacaan data daripada Google Sheets.** Modul seperti Kualiti Pelan dan Status Site membaca data daripada Google Sheets yang diterbitkan dalam format CSV, menggunakan pustaka PapaParse.
4. **Penulisan data melalui Apps Script.** Modul yang menyimpan data ke Google Sheets (Laporan Harian, Checklist Plan, Status Pelan dan Inventori Peralatan) berkomunikasi dengan Google Apps Script Web App melalui `fetch` (`doGet` / `doPost`).
5. **Pencegahan hub bersarang.** Sekiranya hub dibuka di dalam iframe sesebuah modul (contohnya melalui pautan "Portal Utama" dalam HOD Site), hub tidak akan dipaparkan bagi mengelakkan paparan berganda.

---

## Pemasangan dan Konfigurasi

### 1. Pengehosan (GitHub Pages)

1. Muat naik repositori ini ke GitHub.
2. Pergi ke **Settings → Pages**, kemudian pilih cawangan `main` dan direktori `/ (root)`.
3. Akses `https://<username>.github.io/<repo>/` untuk membuka Dashboard Utama.

Bagi pengujian secara setempat, gunakan pelayan web ringkas. Fail tidak boleh dibuka terus melalui `file://` kerana pelayar akan menyekat iframe dan permintaan `fetch`.

```bash
python3 -m http.server 8000
# Akses http://localhost:8000
```

### 2. Google Sheets (CSV)

Bagi setiap Google Sheet yang dibaca dalam format CSV:

1. Buka Google Sheet, kemudian pilih **File → Share → Publish to web**.
2. Pilih tab yang berkaitan dan format **Comma-separated values (.csv)**.
3. Salin URL `.../pub?gid=...&single=true&output=csv` dan masukkan ke dalam konfigurasi modul yang berkenaan.

### 3. Google Apps Script Web App

Bagi modul yang menulis data ke Google Sheets:

1. Daripada Google Sheet, pilih **Extensions → Apps Script**.
2. Masukkan kod `Code.gs`. Bagi modul Laporan Harian, kod lengkap disediakan dalam aplikasi itu sendiri di bawah tab **Kod Apps Script**.
3. Skrip akan mencipta tab dan pengepala lajur secara automatik sekiranya belum wujud.
4. Pilih **Deploy → New deployment → Web app** dengan tetapan berikut:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin URL `/exec` dan masukkan ke dalam konfigurasi modul.

> **Nota:** Setiap kali kod Apps Script dikemas kini, pilih **Deploy → Manage deployments → Edit → New version**. Tanpa langkah ini, Web App akan terus menjalankan versi terdahulu.

---

## Konfigurasi Sumber Data

URL Google Sheets dan Web App ditetapkan secara terus dalam setiap fail HTML melalui pemalar berikut:

| Fail | Pemalar |
|---|---|
| `index.html` | Objek sumber data (`inv`, `qc`, `lh` dan lain-lain) bagi Dashboard Utama |
| `HOD Site/Status Site/index.html` | `CSV_REKOD_URL`, `CSV_LAPORAN_URL`, `APPS_SCRIPT_URL` |
| `HOD Site/Laporan Harian/index.html` | `MACRO_URL` |
| `HOD Site/Laporan Kenderaan/index.html` | `MACRO_URL`, `CSV_URL` |
| `HOD Pelan/Checklist Plan/index.html` | `PUBLISHED_BASE_URL`, `GAS_API_URL` |
| `HOD Pelan/Status Pelan/index.html` | `CFG.API_URL` |
| `Inventori Peralatan/index.html` | URL Web App dalam bahagian konfigurasi |

Sekiranya Google Sheet ditukar atau Web App dideploy semula dengan URL baharu, kemas kini perlu dibuat pada fail modul **dan** `index.html`, kerana Dashboard Utama membaca sumber data yang sama.

---

## Sandaran dan Pemulihan Data

Modul yang menggunakan localStorage (Fail Tracking, Penjana Sebut Harga, Perancangan & Ramalan, GEO-BIM Tracker dan Status Pelan) menyimpan data **dalam pelayar yang digunakan sahaja**.

- Fungsi **Backup** dalam hub menjana satu fail JSON yang mengandungi semua data localStorage bagi setiap modul, termasuk data BIM (`stb_*`).
- Fungsi **Restore** akan menggantikan data sedia ada dalam pelayar dengan kandungan fail sandaran.
- Sandaran perlu dibuat secara berkala. Data akan hilang sekiranya data pelayar dipadam, komputer ditukar atau mod inkognito digunakan.

Kunci localStorage yang digunakan:

```
mjt_ops_db, survey_tracker_v1, jmc_instrument_inventory_v1, jmc_quotation_v1,
jmc_quotation_lib_v1, jm_planner_v1, mjt_ops_sync, mjt_ops_lang,
drafter_projects_data, drafter_drawings_data, geo_local_reports,
stb_projects, stb_staff, stb_reports, jm_status_site_v1, mahabob_active_user_id
```

---

## Keselamatan dan Had Sistem

Perkara berikut perlu diambil kira sebelum sistem digunakan untuk data sebenar:

- **Data CSV yang diterbitkan boleh diakses secara awam.** Sesiapa yang mempunyai URL boleh membaca data tersebut. Hanya terbitkan tab yang diperlukan oleh dashboard dan elakkan menerbitkan maklumat sensitif.
- **Web App dengan akses "Anyone" tidak memerlukan log masuk.** Sesiapa yang mengetahui URL `/exec` boleh menghantar data. Bagi penggunaan yang lebih selamat, tambahkan pengesahan token dalam `doPost` atau hadkan akses kepada akaun Google Workspace syarikat.
- **URL terdedah dalam repositori awam.** Sekiranya repositori ini bersifat awam, semua URL Google Sheets dan Web App dalam kod boleh dilihat. Pertimbangkan untuk menjadikan repositori ini persendirian (GitHub Pages bagi repositori persendirian memerlukan pelan berbayar) atau memindahkan URL ke fail konfigurasi yang tidak dimasukkan ke dalam repositori.
- **localStorage bukan pangkalan data berpusat.** Tiada penyelarasan data antara pengguna atau peranti. Data yang direkod oleh seorang pengguna tidak akan dipaparkan pada komputer pengguna lain.
- **Modul `ops` (`modules/ops.html`)** dirujuk dalam `index.html` tetapi fail tersebut belum terdapat dalam repositori. Selagi fail ini tiada, menu HOD HR dan Data & Sync disorok secara automatik; ia akan muncul semula sebaik sahaja fail ditambah.
- Sistem bergantung kepada CDN luaran (Tailwind CSS, Chart.js, PapaParse, Lucide, Bootstrap dan Font Awesome) dan memerlukan sambungan internet untuk berfungsi.

---

## Teknologi

- HTML, CSS dan JavaScript (*vanilla*) — tanpa *framework* dan proses *build*
- [Tailwind CSS](https://tailwindcss.com/) dan Bootstrap 5 — reka bentuk antara muka
- [Chart.js](https://www.chartjs.org/) — paparan carta
- [PapaParse](https://www.papaparse.com/) — penghuraian data CSV daripada Google Sheets
- [Lucide](https://lucide.dev/) dan Font Awesome — ikon
- Google Sheets dan Google Apps Script — penyimpanan dan pemprosesan data
- GitHub Pages — pengehosan

---

© Jurukur Mahabob & Co. Sdn. Bhd. Untuk kegunaan dalaman sahaja.
