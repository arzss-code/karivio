# Karivio Design System & Style Guide

Panduan ini mendokumentasikan sistem desain, variabel, dan prinsip antarmuka pengguna (UI) yang digunakan dalam proyek **Karivio**. Gunakan panduan ini sebagai referensi untuk menjaga konsistensi visual saat menambah fitur atau halaman baru.

---

## 1. Filosofi Desain

Karivio menggunakan gaya **Modern, Minimalis, dan Clean**. Prinsip utamanya adalah:
- **Ruang Kosong (White Space):** Jangan ragu memberikan jarak antar elemen agar UI terasa lega dan tidak sumpek.
- **Hierarki Tipografi:** Gunakan ukuran teks, ketebalan (*weight*), dan warna (hitam/abu-abu) untuk membedakan judul, sub-judul, dan teks paragraf.
- **Soft UI:** Hindari border atau warna yang terlalu tajam/mencolok (*harsh*), kecuali untuk tombol Call-to-Action (CTA) yang penting. Gunakan sudut melengkung (*rounded corners*) dan bayangan lembut (*soft shadows*).

---

## 2. Palet Warna (Color Palette)

Semua warna dasar diatur menggunakan Tailwind CSS v4 dengan variabel kustom di `src/app/globals.css`. Karivio sangat bergantung pada palet **Neutral** untuk dasar dan elemen sekunder, dengan aksen **Blue/Green** untuk aksi spesifik.

### Base Colors (Neutral)
Kita sering menggunakan `bg-neutral-50`, `bg-neutral-100` untuk latar belakang kartu/form, dan `text-neutral-500` / `text-neutral-900` untuk tipografi hierarki.

- **Background (Utama):** `bg-white` atau `bg-neutral-50`
- **Border:** `border-neutral-200`
- **Teks Primer:** `text-neutral-900` (untuk Heading dan teks utama)
- **Teks Sekunder/Muted:** `text-neutral-500` (untuk Label, deksripsi tambahan, placeholder)
- **Teks Tersier:** `text-neutral-400` (untuk icon non-aktif)

### Aksen & Interaksi
- **Aksi Utama (Primary CTA):** `bg-neutral-900 text-white` (Solid)
- **Aksi Sekunder:** `bg-white border-neutral-200 text-neutral-700`
- **Success (Berhasil):** `text-green-500` atau `bg-green-50`
- **Error (Gagal / Missing):** `text-red-500` atau `bg-red-50 text-red-700` (seperti pada *Missing Keywords*)
- **Warning / Saran:** `text-yellow-500` atau `bg-yellow-50`
- **Aksen Biru:** Digunakan untuk elemen-elemen edukasi, badge tertentu, atau tombol *link*.

---

## 3. Tipografi (Typography)

Kita menggunakan keluarga *font* **Inter** (sans-serif) sebagai standar utama.
Untuk membedakan hierarki:

- **Page Title:** `text-3xl font-bold tracking-tight text-neutral-900`
- **Section Heading:** `text-xl font-semibold text-neutral-900`
- **Card/Label Heading:** `text-sm font-bold text-neutral-900`
- **Body Text:** `text-sm text-neutral-700` (leading-relaxed)
- **Small Info / Caption:** `text-xs text-neutral-500`

> [!TIP]
> **Best Practice Tipografi:**
> Selalu gabungkan teks hitam tegas (`text-neutral-900`) untuk judul dan abu-abu (`text-neutral-500`) untuk sub-judul agar langsung tercipta kontras hierarki tanpa perlu membesarkan ukuran teks berlebihan.

---

## 4. UI Components & Utilities

### 4.1 Buttons (Tombol)
Semua tombol *clickable* menggunakan sedikit interaksi saat di-hover atau ditekan (`active:scale-95`).
- **Primary Button:**
  ```html
  <button className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors active:scale-95">
    Simpan CV
  </button>
  ```
- **Secondary / Outline Button:**
  ```html
  <button className="inline-flex items-center justify-center rounded-xl bg-white border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors active:scale-95">
    Batal
  </button>
  ```

### 4.2 Card & Container
Gunakan `rounded-2xl` untuk *card* berukuran besar/halaman utama, dan `rounded-xl` untuk elemen/kartu di dalamnya.

```html
<div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden p-6">
  <!-- Konten Kartu -->
</div>
```

### 4.3 Inputs & Textareas
Gunakan warna background `bg-neutral-50` dipadukan dengan border yang halus.
```html
<input 
  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm focus:border-neutral-400 focus:ring-0 outline-none transition-colors"
  placeholder="Masukkan nama..."
/>
```

---

## 5. Animasi (Animations)

Kita sudah mendaftarkan *custom animations* di `globals.css`. Selalu gunakan ini agar pergerakan terasa *smooth* dan premium.

- **Muncul (Fade In):** `animate-fade-in` (Sangat cocok untuk *tab* konten yang baru diklik atau halaman yang baru dimuat).
- **Skala (Scale In):** `animate-scale-in` (Cocok untuk pop-up/modal atau kartu kecil yang baru muncul).
- **Loading:** Selalu gunakan `animate-pulse` dari Tailwind untuk status *skeleton loading*, atau ikon `Loader2` dari `lucide-react` dengan `animate-spin` untuk memuat data.

---

## 6. Integrasi Ikon

Kita menggunakan perpustakaan ikon **Lucide React**. 
- Ukuran standar: `h-4 w-4` atau `h-5 w-5`.
- Jangan biarkan ikon menggantung sendiri; selaraskan di tengah menggunakan flexbox: `flex items-center gap-2`.

```jsx
import { Target } from 'lucide-react';

// Penggunaan standar:
<h3 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
  <Target className="h-4 w-4 text-blue-500" />
  ATS Analysis Dashboard
</h3>
```

---

> [!IMPORTANT]
> **Aturan Emas:** Jika tidak yakin, lihatlah kembali komponen *Navbar* (`Navbar.tsx`), *ATS Checker* (`ats-checker/page.tsx`), atau *Result Preview* (`ResultPreview.tsx`) untuk memastikan struktur *Tailwind utility classes* yang Anda tulis masih sejalan dengan pedoman di atas.
