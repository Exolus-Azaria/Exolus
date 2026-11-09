# Exolus — Design System

Dokumen ini menjadi acuan tampilan dan interaksi UI Exolus. Perubahan visual sebaiknya dilakukan pada lapisan antarmuka tanpa mengubah backend, API, Hermes Agent, atau 9Router kecuali memang diperlukan.

## Identitas
- Nama aplikasi: **Exolus**
- Nama asisten: **Minnie**
- Gaya visual: futuristik, bersih, ringkas, mudah dibaca.
- Bahasa antarmuka: Bahasa Indonesia.
- Prinsip teks: singkat, menarik, dan menjelaskan kegunaan menu secara langsung.

## Navigasi utama
| Menu | Tujuan | Interaksi utama |
|---|---|---|
| Beranda | Ringkasan dan pintasan | Tombol Mulai Chat membuka Chat AI |
| Chat AI | Percakapan dengan Minnie | Form pesan mengirim pertanyaan ke backend Exolus |
| Kuliah | Tanya jawab materi kuliah | Pertanyaan diteruskan ke Chat AI; pemilih file hanya menampilkan file lokal yang dipilih |
| File Manager | Melihat pilihan file lokal | Menampilkan nama dan ukuran file; belum mengunggah atau mengelola file server |
| Model & Router | Memeriksa koneksi backend | Memeriksa status Hermes, 9Router, dan model melalui `/api/status` |
| Riwayat | Melihat dan menghapus percakapan lokal | Data disimpan di `localStorage` browser |
| Pengaturan | Mengatur tema, background, waktu, dan lokasi | Pengaturan waktu/lokasi disimpan di browser; tema diterapkan saat dipilih |

## Sistem tema
Preset: Cyber Blue, Phantom Purple, Matrix Green, Crimson Red, Solar Orange, Minimal White, dan Custom Color.

Setiap tema harus mengatur secara konsisten:
- Latar halaman, sidebar, panel, kartu, dan input.
- Warna teks utama dan sekunder.
- Logo, ikon, tombol, navigasi, border, serta indikator.
- Keadaan hover, fokus, aktif, berhasil, dan gagal.

Jangan menetapkan warna teks atau latar komponen secara permanen jika seharusnya mengikuti tema. Pastikan kontras tetap terbaca, khususnya pada Minimal White.

## Background
Sumber background: bawaan, foto/GIF lokal, video lokal, URL media, atau warna polos. Hanya satu sumber aktif pada satu waktu. Lapisan gelap digunakan untuk membantu keterbacaan konten. Pemilihan file lokal pada menu Kuliah dan File Manager hanya bersifat lokal di browser pada versi ini.

## Jam dan tanggal
- Jam utama menggunakan format `HH:MM`.
- Detik ditampilkan sebagai superscript dengan ukuran sekitar setengah ukuran jam.
- Tampilkan tanggal, label lokasi, zona waktu, serta periode Pagi/Siang/Sore/Malam berdasarkan zona waktu yang dipilih.

## Perilaku dan feedback
- Setiap navigasi harus membuka section dengan ID yang sesuai.
- Tombol harus memiliki label yang menjelaskan aksi sebenarnya.
- Form yang membutuhkan input harus memberi tahu pengguna jika input belum diisi.
- Tampilkan status proses, berhasil, atau gagal untuk aksi yang berkomunikasi dengan backend.
- Elemen yang tidak bisa diklik tidak boleh terlihat seperti tombol atau kartu navigasi.
- Jangan menyebut file sudah diunggah atau diproses jika fitur tersebut belum tersedia.

## Batas pemisahan sistem
- `index.html`: struktur halaman, style, dan interaksi UI saat ini.
- `server.js`: backend dan endpoint API; jangan mengubahnya untuk pekerjaan visual biasa.
- Hermes Agent dan 9Router: layanan backend eksternal; jangan mengubah konfigurasi dari pekerjaan desain.
- `design.md`: pedoman desain dan perilaku UI.

## Checklist sebelum rilis
1. Semua tombol navigasi membuka halaman yang sesuai.
2. Label dan deskripsi sesuai fungsi yang benar-benar tersedia.
3. Tema terang/gelap menjaga keterbacaan teks, ikon, logo, input, dan tombol.
4. Jam, detik, tanggal, lokasi, dan periode waktu diperbarui dengan benar.
5. Chat, pemeriksaan status, riwayat, serta pengaturan background tetap berfungsi.
6. Tidak ada perubahan backend yang tidak diperlukan.
