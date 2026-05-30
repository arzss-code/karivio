# Rencana Implementasi Fitur Tambahan: AI ATS Checker Platform

Dokumen ini berisi rencana implementasi komprehensif untuk menambahkan fitur **AI ATS Checker** ke dalam platform web manajemen karier / resume. Rencana ini disusun dengan mengadaptasi kapabilitas analisis mutakhir yang berfokus pada kecocokan deskripsi pekerjaan (*Job Description Alignment*), kepatuhan format (*Format Compliance*), dan peningkatan kualitas bahasa berbasis AI (*AI Smart Rewrite*).

---

## 1. Arsitektur Sistem & Arsitektur Teknologi

Untuk memastikan sistem dapat menangani proses ekstraksi dokumen (*parsing*), analisis teks, dan komunikasi dengan Large Language Model (LLM) secara *real-time* dan efisien, arsitektur berikut akan digunakan:

### 1.1 Pandangan Umum Arsitektur (High-Level Architecture)
Sistem dibagi menjadi tiga layer utama:
1.  **Frontend Layer:** Menangani interaksi pengguna, unggah file resume (PDF/DOCX), input teks Deskripsi Pekerjaan (JD), serta visualisasi skor dan rekomendasi perbaikan.
2.  **Backend API Layer:** Menangani orkestrasi bisnis, validasi file, ekstraksi teks mentah dari dokumen (*document parsing*), dan manajemen *prompting* ke LLM.
3.  **AI & Analytics Layer:** Berperan melakukan pencocokan kata kunci, analisis struktur, dan penulisan ulang berbasis pemrosesan bahasa alami (NLP).

### 1.2 Komponen Teknologi (Tech Stack)
* **Frontend Framework:** Next.js (React) & Tailwind CSS v4 (untuk antarmuka responsif, interaktif, dan performa tinggi).
* **Backend Framework:** FastAPI (Python) atau Node.js (untuk efisiensi tinggi dalam menangani *computational heavy tasks* seperti ekstraksi dokumen dan integrasi AI).
* **Document Parsers:** `pdfminer.six` / `PyPDF2` (untuk PDF) dan `python-docx` (untuk Word) guna memastikan ekstraksi *raw text* berjalan tanpa kehilangan karakter.
* **AI Engine:** OpenAI API (GPT-4o-mini) atau Google Gemini API melalui integrasi SDK resmi dengan teknik *Structured Outputs* (JSON mode).
* **Database & Storage:** PostgreSQL/Supabase (menyimpan riwayat pemindaian pengguna secara aman) dan Object Storage (S3/Supabase Storage) untuk penyimpanan sementara file.

---

## 2. Spesifikasi Detail Fitur & Kriteria Penerimaan

### Fitur A: Job Description (JD) Alignment & Keyword Matcher
* **Deskripsi:** Pengguna mengunggah resume dan menempelkan teks kualifikasi lowongan kerja. Sistem menghitung persentase kecocokan.
* **Kriteria Penerimaan (Acceptance Criteria):**
    * Sistem mampu mengekstrak *hard skills* dan *soft skills* dari teks JD.
    * Sistem membandingkan kemunculan kata kunci tersebut di dalam resume (menangani variasi kata/sinonim dasar melalui embedding atau kamus kompetensi).
    * Menampilkan skor kecocokan total (0 - 100%) dan daftar *Missing Keywords* yang dikelompokkan berdasarkan urgensi (Kritis, Penting, Opsional).

### Fitur B: Format Compliance & Readability Checker
* **Deskripsi:** Memeriksa kesesuaian dokumen terhadap batasan teknis mesin pembaca ATS tradisional.
* **Kriteria Penerimaan:**
    * Mendeteksi keberadaan elemen non-teks yang berpotensi merusak *parsing* ATS (seperti tabel kompleks, grafik, gambar, ikon, atau penggunaan *layout* multi-kolom yang tidak berurutan).
    * Memvalidasi ukuran file (maksimal 5MB) dan struktur *header* standar (Kontak, Pengalaman Kerja, Pendidikan, Keahlian).
    * Memberikan status lolos/gagal beserta rekomendasi perbaikan layout.

### Fitur C: Action Verbs & Impact Evaluator
* **Deskripsi:** Menganalisis kualitas kalimat pada poin-poin pengalaman kerja (*bullet points*) untuk memastikan gaya bahasa yang persuasif dan terukur.
* **Kriteria Penerimaan:**
    * Mendeteksi penggunaan kata kerja aktif (*Action Verbs*) di awal setiap *bullet point* (misal: "Mengembangkan", "Memimpin", "Mengoptimalkan").
    * Mengidentifikasi keberadaan komponen metrik kuantitatif (angka, persentase, durasi) untuk mengukur dampak kinerja.
    * Memberikan skor *Impact* khusus untuk bagian pengalaman kerja.

### Fitur D: AI Smart Rewrite Suggestions (STAR Method)
* **Deskripsi:** Fitur interaktif yang memberikan saran perbaikan langsung pada kalimat resume yang dinilai lemah agar sesuai metode STAR (Situation, Task, Action, Result).
* **Kriteria Penerimaan:**
    * Menyediakan tombol "Perbaiki dengan AI" di samping kalimat resume yang terdeteksi lemah.
    * Menghasilkan alternatif kalimat yang lebih kuat secara kontekstual tanpa mengubah fakta dasar pengalaman kerja pengguna.
    * Menyediakan fitur *one-click copy* atau *apply change* untuk memperbarui teks dengan cepat.

---

## 3. Garis Waktu Rencana Implementasi (8 Minggu)

Rencana kerja dibagi menjadi 4 fase utama menggunakan metodologi Agile/Scrum (2 minggu per *Sprint*).

| Fase | Minggu | Fokus Utama | Output / Deliverables |
| :--- | :--- | :--- | :--- |
| **Fase 1: Fondasi & Ekstraksi** | Minggu 1-2 | - Setup repositori & arsitektur base.<br>- Pembuatan modul *Document Parser*.<br>- Perancangan skema database untuk menyimpan log analisis. | API unggah file yang mengembalikan struktur teks mentah (*raw text*) secara bersih tanpa kehilangan data. |
| **Fase 2: Integrasi Engine AI** | Minggu 3-4 | - Rekayasa Prompt (*Prompt Engineering*) untuk LLM.<br>- Pembuatan fungsi pencocokan kata kunci dan kalkulasi skor.<br>- Pembuatan endpoint AI *Rewrite* berbasis metode STAR. | RESTful API terintegrasi LLM yang menghasilkan respon analisis dalam format JSON terstruktur. |
| **Fase 3: Pengembangan Frontend** | Minggu 5-6 | - Pembuatan halaman Dashboard ATS Checker.<br>- Implementasi komponen visual (Skor Gauge, Higlight teks).<br>- Integrasi State Management frontend dengan API. | UI/UX interaktif yang mampu menampilkan perbandingan resume vs JD secara *side-by-side*. |
| **Fase 4: QA, Keamanan, & Rilis** | Minggu 7-8 | - Pengujian performa ekstraksi dokumen (*stress testing*).<br>- Audit privasi data (penghapusan otomatis file sementara).<br>- Rilis versi Beta internal & perbaikan bug. | Sistem siap produksi (*production-ready*) dengan dokumentasi teknis lengkap. |

---

## 4. Alur Kerja Pengguna (User Flow) & Rancangan Antarmuka

```
[Mulai] -> [Halaman Unggah] -> (User Unggah PDF/Docx + Paste JD) -> [Klik "Analisis"]
                 |
                 v
       [Proses Backend & AI] -> (Ekstraksi -> Prompting -> Analisis)
                 |
                 v
   [Halaman Dashboard Hasil] -> Tampilan Split-Screen:
                                 - Sisi Kiri: Resume Text Viewer
                                 - Sisi Kanan: Skor Akhir, Missing Keywords, Format Alert, & AI Suggestion Button
```

### Panduan UI/UX (Dashboard Hasil):
1.  **Sistem Penilaian:** Skor utama (0-100) diletakkan di bagian atas panel kanan menggunakan warna indikator dinamis: Merah (0-49), Kuning (50-74), Hijau (75-100).
2.  **Highlight Teks:** Kata kunci yang berhasil dicocokkan akan diberi highlight warna hijau muda pada tampilan teks resume, sedangkan area yang memerlukan perbaikan diberi warna amber/oranye.
3.  **Panel Rekomendasi Mandiri:** Setiap saran perbaikan dikemas dalam bentuk kartu (*collapsible card*) yang dapat dibuka untuk melihat detail masalah dan solusi yang disarankan AI.

---

## 5. Rencana Pengujian & Validasi (Testing Plan)

Untuk menjamin akurasi dan reliabilitas sistem, pengujian akan difokuskan pada tiga aspek berikut:

1.  **Akurasi Parsing Dokumen (Document Parsing Accuracy):**
    * **Metode:** Memasukkan 50 sampel resume dengan berbagai variasi struktur layout (1 kolom, 2 kolom, dengan tabel, dengan gambar, menggunakan *font* non-standar).
    * **Kriteria Sukses:** Teks mentah terekstrak dengan akurasi keterbacaan karakter minimal 95% dan urutan kronologis pengalaman kerja tidak saling tumpang tindih.
2.  **Validasi Struktur JSON Model AI (AI Output Validation):**
    * **Metode:** Melakukan pengujian skema (*schema testing*) pada respon dari LLM API.
    * **Kriteria Sukses:** 100% respon AI wajib mematuhi format JSON yang ditentukan (memiliki key: `score`, `missing_keywords`, `formatting_issues`, `suggestions`) tanpa terjadi kegagalan *parsing code*.
3.  **Uji Latensi & Kecepatan Proses (Performance & Latency Test):**
    * **Metode:** Mengukur waktu respon total dari saat user menekan tombol "Analisis" hingga hasil muncul di layar.
    * **Kriteria Sukses:** Rata-rata waktu proses tidak boleh melebihi 7 detik per dokumen pada kondisi jaringan normal.

---

## 6. Strategi Manajemen Risiko & Mitigasi

* **Risiko 1: Kebocoran Data Pribadi (Data Privacy & Compliance)**
    * *Deskripsi:* Dokumen resume mengandung data sensitif (nama, nomor telepon, alamat, riwayat kerja).
    * *Mitigasi:* File fisik yang diunggah ke *temporary storage* wajib dihapus secara otomatis dalam waktu maksimal 10 menit setelah proses analisis selesai. Data teks tidak boleh digunakan untuk melatih (*training*) model pihak ketiga (pastikan mengaktifkan opsi *Zero Data Retention* jika didukung oleh penyedia API LLM).
* **Risiko 2: Biaya API LLM yang Membengkak (Cost Management)**
    * *Deskripsi:* Penggunaan token LLM yang berlebihan jika user melakukan pemindaian berulang kali dalam waktu singkat.
    * *Mitigasi:* Terapkan sistem *caching* hasil analisis berbasis *hash* konten resume dan JD. Jika teks tidak berubah, sistem akan mengambil hasil dari cache database. Tambahkan juga kebijakan pembatasan akses (*Rate Limiting*), misalnya maksimal 5 kali analisis per pengguna per jam.
* **Risiko 3: *Hallucination* pada AI Rewrite Suggestions**
    * *Deskripsi:* AI memberikan saran penulisan ulang yang menambahkan pengalaman fiktif atau keahlian yang tidak dimiliki pengguna.
    * *Mitigasi:* Memperketat instruksi *System Prompt* dengan batasan tegas: *"Hanya gunakan informasi yang tersedia pada teks asli resume. Dilarang keras mengarang atau menambahkan fakta baru di luar dokumen yang disediakan."*

---
*Dokumen ini merupakan panduan kerja teknis. Setiap perubahan pada ruang lingkup atau teknologi yang digunakan harus melalui proses persetujuan tim teknis utama.*
