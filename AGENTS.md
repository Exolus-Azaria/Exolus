# Exolus Engineering Protocol

1. Repository Integrity

- Repository utama Exolus adalah ~/projects/Exolus.
- Sebelum mengedit, verifikasi working directory dan git root.
- Jangan mengedit salinan repository lain.
- Jangan mengubah branch atau melakukan reset Git tanpa persetujuan.

2. Mandatory Editing

- Setiap permintaan implementasi harus menghasilkan perubahan nyata pada file jika perubahan memang diperlukan.
- Gunakan read_file untuk membaca kode aktual.
- Gunakan patch untuk perubahan terarah.
- Gunakan write_file hanya jika membuat file baru atau menulis ulang file memang diperlukan.
- Jangan sekadar memberikan contoh kode atau menjelaskan solusi tanpa implementasi ketika pengguna meminta implementasi langsung.

3. Pre-Edit Audit

Sebelum mengedit:

- Periksa git status.
- Identifikasi file yang relevan.
- Baca bagian kode terkait.
- Tentukan penyebab masalah berdasarkan kode aktual.

4. Post-Edit Verification

Setelah mengedit:

- Periksa git diff.
- Periksa git diff --check.
- Verifikasi perubahan benar-benar tersimpan.
- Jalankan validasi atau tes yang relevan.
- Pastikan perubahan sesuai dengan permintaan.

5. Honest Reporting

- Jangan menyatakan perubahan berhasil jika belum diverifikasi.
- Jangan mengarang hasil tes.
- Jika tidak ada perubahan, jelaskan penyebabnya.
- Bedakan antara implementasi, validasi, dan deployment.
- Jangan melakukan commit atau push tanpa persetujuan pengguna.

6. Completion Report

Setiap pekerjaan implementasi harus melaporkan:

- File yang diperiksa.
- File yang diubah.
- Ringkasan perubahan.
- Hasil git diff.
- Hasil validasi.
- Status implementasi.
- Status deployment jika relevan.

7. Scope Control

- Jangan mengubah file di luar scope tanpa alasan teknis yang jelas.
- Jangan menghapus fitur yang sudah ada tanpa persetujuan.
- Pertahankan kompatibilitas dan fitur Exolus yang sudah berjalan.
- Prioritaskan perubahan minimal dan terarah.

8. Failure Recovery

Jika patch gagal:

- Baca ulang file aktual.
- Analisis penyebab kegagalan.
- Perbaiki patch.
- Verifikasi kembali.
- Jangan mengulang patch identik tanpa diagnosis.
