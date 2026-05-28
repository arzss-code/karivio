# Product Requirements Document (PRD)

**Proyek:** Careergen - AI-Powered Resume & Cover Letter Generator (Micro-SaaS)  
**Platform:** Web Application  
**Tipe Arsitektur:** Astro Islands (Astro SSR + React)  
**Deployment:** Vercel  

---

## 1. Latar Belakang & Tujuan

Proses membuat CV (Resume) dan Cover Letter (Surat Lamaran) yang disesuaikan (*tailored*) untuk setiap lowongan pekerjaan sering memakan waktu lama. Banyak pencari kerja kesulitan merangkai kata-kata profesional dan menyusun format yang ramah mesin pelacak pelamar (*ATS - Applicant Tracking System*).

**Tujuan Produk:** 
Menyediakan alat (tool) berbasis web yang sangat cepat untuk mengubah poin-poin kasar pengalaman kerja menjadi CV dan surat lamaran profesional dalam hitungan detik menggunakan bantuan AI. Produk ini juga dirancang sebagai mesin bisnis (SaaS) mandiri bagi kreatornya dengan sistem monetisasi berbasis kredit.

---

## 2. Target Pengguna

- **Mahasiswa Tingkat Akhir / Fresh Graduate:** Membutuhkan CV pertama untuk magang atau pekerjaan perdana tanpa pusing memikirkan tata letak.
- **Profesional Muda:** Ingin melamar posisi spesifik dan membutuhkan *Cover Letter* yang sangat disesuaikan dengan deskripsi pekerjaan (*Job Description*) dari lowongan tersebut.

---

## 3. Spesifikasi Teknis (Tech Stack Terkini)

- **Meta-Framework Utama:** Astro (Mode SSR).
- **UI Framework (Islands):** React & Preact (digunakan khusus untuk komponen super-interaktif seperti Multi-step Wizard Form).
- **State Management & Form:** `nanostores` (untuk *global state* lintas komponen), `react-hook-form`, dan `Zod` (untuk validasi data sisi klien).
- **Styling:** Tailwind CSS v4 (dilengkapi dengan *micro-interactions* dan animasi CSS khusus).
- **Backend / API Engine:** Astro Server Endpoints (`/api/...`).
- **AI Engine:** Google Gemini API.
- **Database, Auth & RPC:** Supabase (PostgreSQL + Google OAuth). Memanfaatkan fitur **RPC (Remote Procedure Call)** Postgres untuk menjamin keamanan transaksi pemotongan dan penambahan kredit (mencegah *race condition*).
- **Payment Gateway:** Midtrans (dengan validasi *webhook signature* ganda).
- **PDF Generation:** *Native Browser Print API* (`window.print()`) yang dikombinasikan dengan media query `@media print` CSS khusus untuk menjamin format murni ATS-Friendly (Tanpa bergantung pada *library* berat).

---

## 4. Fitur Utama (MVP)

### A. Autentikasi & Penyimpanan Progres
- Pengguna wajib login menggunakan **Google Account (OAuth)** untuk menggunakan layanan.
- Autentikasi dikelola oleh Supabase, dan data profil pengguna (termasuk saldo kredit) otomatis dibuat melalui *Database Trigger*.

### B. Form Wizard Interaktif (Input)
- Antarmuka *Step-by-step* (Langkah 1 sampai 4) berbasis React.
- Input data diri, riwayat pendidikan, proyek, pengalaman kerja kasar, dan Deskripsi Pekerjaan (Target Job).
- Validasi form sisi klien (*real-time*) sebelum dikirim ke AI, memastikan pengguna tidak membuang kredit untuk form kosong.

### C. AI Engine & Credit System
- Pemilihan tipe dokumen: *Generate CV* atau *Generate Cover Letter*.
- Pilihan bahasa keluaran otomatis dari AI (Bahasa Inggris atau Indonesia).
- **Transaksi Atomik Database:** Pemotongan saldo kredit (pengurangan 1 kredit) dan penyimpanan data dokumen (*save document*) dilakukan di dalam **satu transaksi database terpadu** (RPC) demi keamanan dan mencegah hilangnya kredit pengguna secara sepihak akibat gagal jaringan.

### D. Preview & Ekspor Dokumen
- Tampilan pratinjau instan di sisi kanan (*split-screen*) lengkap dengan efek *Skeleton Loader* saat AI bekerja.
- Tersedia opsi ganti tata letak (Template Klasik ATS, Modern, Minimalis).
- Ekspor satu klik ke PDF dengan standar ATS tinggi (format Harvard) murni tanpa *watermark*.

---

## 5. Strategi Monetisasi (Model Freemium / Kredit)

Ini adalah model utama yang diimplementasikan di dalam basis kode:

1. **Gratis di Awal (Onboarding):** Setiap pengguna baru yang mendaftar mendapat saldo **3 Kredit Gratis**.
2. **Top-Up Mikro:** Jika kredit habis, sistem memblokir form dan menawarkan *pop-up* pembelian kredit melalui QRIS Midtrans.
   - Contoh Harga: **Rp 10.000 untuk 10x Generate**.
3. **Alur Webhook Aman:** Setelah pengguna membayar via GoPay/QRIS, Midtrans mengirimkan *webhook* ke API Astro. API memvalidasi kunci rahasia (*signature*) dan menambah saldo pengguna secara atomik (RPC `add_credits`).

---

## 6. Alur Pengguna (User Flow)

1. **Landing Page:** Penjelasan keunggulan web dan ajakan "Create Your Perfect Resume".
2. **Auth:** Pengguna login dengan Google.
3. **Dashboard:** Pengguna dialihkan ke halaman pembuat CV (`/app`), melihat sisa kredit di menu/profil.
4. **Wizard Form:** Pengisi form langkah demi langkah.
5. **Processing:** Klik tombol Generate -> Muncul *loading skeleton* -> Sistem API validasi saldo -> Memanggil Gemini -> Transaksi DB (Kredit -1, Simpan Dokumen) -> Hasil ditampilkan.
6. **Download:** Pengguna menyesuaikan *template* dan klik *Download PDF*.
7. **Top Up (Jika Habis):** Muncul peringatan "Kredit Habis" dan diarahkan ke proses pembayaran Midtrans.

---

## 7. Batasan & Keamanan Infrastruktur

1. **Keamanan Kunci:** API Key Gemini (`GEMINI_API_KEY`) dan Key Midtrans disimpan sebagai environment variables (tidak pernah terekspos ke sisi klien).
2. **Rate Limiting:** Terdapat sistem pembatas permintaan (*rate limiter*) pada endpoint `/api/generate-cv` untuk mencegah serangan eksploitasi API massal (DDoS tingkat aplikasi).
3. **Integritas Saldo:** Tidak pernah melakukan pengurangan saldo kredit melalui dua *query* terpisah di klien atau *server functions* standar, melainkan 100% menggunakan fungsi khusus Postgres (`SECURITY DEFINER`) untuk menjaga konsistensi finansial dari ancaman modifikasi serentak (*race conditions*).