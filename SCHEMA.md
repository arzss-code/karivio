Skema Database & Alur Monetisasi (Model 1)

Untuk menjalankan sistem kredit, kita akan menggunakan Supabase (PostgreSQL) dan Midtrans (Payment Gateway).

1. Skema Tabel Database (Supabase)

Kita butuh 3 tabel utama. (Catatan: Supabase sudah punya tabel auth.users bawaan untuk login, kita akan buat tabel profiles yang terhubung ke sana).

A. Tabel profiles

Menyimpan data publik user dan saldo kredit.

id (UUID, Primary Key, berelasi dengan auth.users.id)

email (Text)

full_name (Text)

credits_balance (Integer, Default: 3) -> Di sinilah 3 kredit gratis diberikan.

created_at (Timestamp)

B. Tabel transactions

Menyimpan riwayat pembelian kredit / Top-Up via Midtrans.

id (UUID, Primary Key)

user_id (UUID, Foreign Key ke profiles.id)

order_id (Text, Unique) -> ID unik yang dikirim ke Midtrans (misal: TRX-12345).

amount (Integer) -> Nominal rupiah (misal: 10000).

credit_added (Integer) -> Jumlah kredit yang didapat (misal: 10).

status (Text) -> Bisa berisi: 'pending', 'settlement' (berhasil), 'expire'.

created_at (Timestamp)

C. Tabel documents (Opsional tapi Direkomendasikan)

Menyimpan hasil CV/Cover Letter agar user bisa melihat history mereka dan tidak perlu buang kredit untuk generate ulang data yang sama.

id (UUID, Primary Key)

user_id (UUID, Foreign Key ke profiles.id)

document_type (Text) -> 'resume' atau 'cover_letter'.

content (Text / JSON) -> Hasil teks AI.

created_at (Timestamp)

2. Otomatisasi (Database Trigger)

Agar setiap pengguna baru yang login pakai Google otomatis dapat 3 kredit, kita akan menggunakan fitur Postgres Trigger di Supabase.
Logikanya: Jika ada baris baru di tabel auth.users, otomatis buat baris baru di tabel profiles dengan credits_balance = 3.

3. Alur Pembayaran (Midtrans Webhook Flow)

Ini adalah alur ketika credit user habis dan mereka mau beli lagi:

User Klik Top-Up: Di web Astro, user klik tombol "Beli 10 Kredit (Rp 10.000)".

Astro Server Endpoint: Web mengirim request ke server Astro (/api/payment). Server membuat baris baru di tabel transactions dengan status pending, lalu meminta URL pembayaran ke API Midtrans.

Pop-up Pembayaran: Midtrans Snap (QRIS) muncul di layar user.

User Bayar: User scan QRIS pakai GoPay/DANA.

Webhook Midtrans (Krusial): Midtrans akan mengirim sinyal di balik layar (webhook) ke server Astro kita (/api/webhook/midtrans).

Update Saldo: Server Astro memvalidasi sinyal itu, mengubah status di tabel transactions jadi settlement, dan menambahkan +10 ke credits_balance di tabel profiles.