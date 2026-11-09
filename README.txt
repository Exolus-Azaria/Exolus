VEX — EXOLUS AI v2.2.4 | Minnie Assistant

RINGKASAN UPDATE
- Identitas: Vex / Exolus — AI, Made Easy / Minnie.
- Chat menyertakan persona Minnie dan konteks percakapan terakhir. Riwayat tersimpan di browser, bukan sesi persisten internal Hermes.
- Menu Model & Router memeriksa `hermes status` secara nyata dan endpoint 9Router `http://127.0.0.1:20128/v1/models`. Indikator menampilkan status berhasil/gagal, detail, jumlah model, dan waktu pemeriksaan. Tombol Periksa ulang tersedia.
- UI memiliki efek visual futuristik ringan, indikator koneksi yang jelas, animasi transisi halus, dan pemulihan pesan sebelumnya saat halaman dimuat ulang.
- `start-tunnel.sh` opsional untuk Cloudflare Quick Tunnel HTTPS. Tunnel tidak dijalankan otomatis.

MENJALANKAN DI TERMUX
1. Ekstrak ZIP ke folder yang mudah ditemukan.
2. Jalankan `termux-setup-storage` jika folder berada di penyimpanan bersama.
3. Masuk ke folder hasil ekstrak, misalnya `cd ~/storage/downloads/Hermes_Game_UI` (sesuaikan nama/lokasi folder).
4. Pastikan Node.js dan Hermes Agent sudah terpasang serta `hermes -z "tes"` berhasil.
5. Pastikan 9Router berjalan di `127.0.0.1:20128`.
6. Jalankan `bash start.sh` dan biarkan Termux tetap aktif.
7. Buka `http://127.0.0.1:18765` di browser HP.
8. Saat pertama kali chat, masukkan token yang dicetak di terminal.

MEMBACA STATUS
- Buka menu Model & Router, lalu tekan Periksa ulang.
- Hermes Agent berstatus tersedia bila `hermes status` sukses. Ini menguji CLI/status, bukan mengirim prompt berbayar ke model.
- 9Router berstatus terhubung bila `GET /v1/models` di localhost:20128 memberi respons JSON berisi daftar model.
- Jika Hermes gagal, uji `hermes status` dan `hermes -z "Balas tepat: TES"` langsung di Termux.
- Jika 9Router gagal, pastikan proses 9Router aktif dan endpoint `http://127.0.0.1:20128/v1/models` dapat dibuka dari Termux.

TOKEN DAN KEAMANAN
- Token dibuat otomatis dalam `.hermes-ui-token` dengan izin file privat. Jangan bagikan token atau file ini.
- Token kustom bisa dibuat setelah menghentikan server (Ctrl+C):
  `openssl rand -hex 32 > .hermes-ui-token && chmod 600 .hermes-ui-token`
  Kemudian jalankan `bash start.sh` lagi. Browser mungkin masih menyimpan token lama; hapus item `hermes-ui-token` dari localStorage situs jika token diminta ulang.
- Token pendek seperti `531343112#Minnie` hanya untuk uji lokal, bukan akses publik. Jangan pakai token pendek bila mengaktifkan tunnel.
- Backend tetap bind ke 127.0.0.1. Jangan ubah ke 0.0.0.0 dan jangan membuka port 18765 atau 20128 langsung ke internet.

AKSES HTTPS DARI LUAR HP (OPSIONAL)
Quick Tunnel memberikan URL HTTPS sementara, bukan domain permanen. Kamu perlu memasang `cloudflared` dari sumber resmi yang sesuai dengan perangkat/Termux. Setelah itu:
1. Jalankan `bash start.sh` di sesi Termux pertama.
2. Di sesi Termux kedua, masuk ke folder aplikasi yang sama.
3. Pastikan token `.hermes-ui-token` panjang dan acak. Jika perlu, buat dengan perintah openssl di atas, lalu restart server agar membaca token baru.
4. Jalankan `bash start-tunnel.sh`.
5. Buka URL `https://....trycloudflare.com` yang dicetak oleh cloudflared. URL Quick Tunnel bisa berubah dan biasanya tidak permanen.
6. Jangan membagikan URL/token kepada orang yang tidak dipercaya. Siapa pun yang mengetahui URL dapat melihat halaman publik; chat memerlukan token. Hentikan tunnel dengan Ctrl+C saat selesai.

DOMAIN VEX PERMANEN
Alamat seperti `vex.domainkamu.com` memerlukan domain yang kamu miliki, konfigurasi DNS dan named tunnel pada akun Cloudflare. Script Quick Tunnel di atas tidak membuat domain permanen. Jangan memasukkan kredensial Cloudflare ke halaman UI atau membagikan token tunnel.

BATASAN SAAT INI
- Konteks chat dikirim sebagai riwayat teks terakhir; ini bukan memori permanen di sisi model. Riwayat tersimpan lokal di browser perangkat tersebut.
- Pemilihan file di menu Kuliah/File Manager masih menampilkan file lokal di UI; belum mengunggah atau menganalisis isi file.
- Model yang dipakai tetap mengikuti konfigurasi Hermes/9Router; pemilih model UI belum mengubah konfigurasi.
- Video/GIF latar dapat meningkatkan pemakaian baterai dan RAM.

--- LATAR BELAKANG DAN AUTO-START (v2.2.5) ---

Jalankan server di latar belakang (tidak perlu membiarkan sesi start.sh terbuka):
  bash start-background.sh

Periksa status:
  bash status-background.sh

Hentikan server:
  bash stop-background.sh

Server lokal tetap di http://127.0.0.1:18765. Skrip ini hanya menjalankan server lokal; tidak membuat domain publik atau HTTPS dengan sendirinya.

AUTO-START SETELAH HP RESTART:
1. Pasang aplikasi Termux:Boot dari sumber yang sama dengan Termux (jangan campur sumber F-Droid/GitHub).
2. Buka Termux:Boot sekali setelah dipasang.
3. Di Termux, masuk ke folder Hermes_Game_UI hasil ekstrak.
4. Jalankan: bash install-boot.sh
5. Nonaktifkan optimasi baterai untuk Termux dan Termux:Boot melalui pengaturan Android jika tersedia.
6. Restart HP, lalu cek di browser http://127.0.0.1:18765.

PENTING:
- Android/HyperOS dapat membatasi atau menghentikan proses latar belakang. Auto-start tidak dapat dijamin di semua perangkat.
- Jangan force-stop Termux; force-stop akan memblokir proses dan auto-start sampai aplikasi dibuka lagi.
- Jika perangkat meminta izin notifikasi, izinkan agar layanan latar belakang lebih mudah dipantau.
- Skrip boot mencoba menjalankan termux-wake-lock; jika perintah itu tidak tersedia, server tetap dicoba dijalankan tetapi Android bisa menidurkannya.
- Untuk pemakaian publik, jangan membuka server langsung ke internet. Siapkan domain/tunnel dan autentikasi yang kuat terlebih dahulu.
- Simpan token di .hermes-ui-token secara rahasia. Jangan membagikannya.
