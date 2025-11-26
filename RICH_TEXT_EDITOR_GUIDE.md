# Panduan Menggunakan Rich Text Editor untuk Artikel

## Akses Halaman
- **Buat Artikel Baru**: http://localhost:3000/admin/articles/create
- **Edit Artikel**: http://localhost:3000/admin/articles/edit/[id]
- **List Artikel**: http://localhost:3000/admin/articles

## Fitur Rich Text Editor

### 1. Text Formatting (Format Teks)
| Tombol | Fungsi | Shortcut |
|--------|--------|----------|
| **B** | Bold (Tebal) | Ctrl+B |
| *I* | Italic (Miring) | Ctrl+I |
| U | Underline (Garis Bawah) | Ctrl+U |
| ~~S~~ | Strikethrough (Coret) | - |
| `<>` | Code (Kode Inline) | - |

### 2. Headings (Judul)
- **H1** - Heading 1 (Judul Utama)
- **H2** - Heading 2 (Sub Judul)
- **H3** - Heading 3 (Sub-Sub Judul)

### 3. Lists (Daftar)
- **Bullet List** - Daftar dengan bullet point
- **Numbered List** - Daftar bernomor
- **Quote** - Blockquote untuk kutipan

### 4. Alignment (Perataan)
- **Align Left** - Rata kiri
- **Align Center** - Rata tengah
- **Align Right** - Rata kanan

### 5. Media
- **Link** - Tambahkan hyperlink
  1. Klik icon link
  2. Masukkan URL
  3. Klik "Add Link"
  
- **Image** - Sisipkan gambar
  1. Klik icon image
  2. Masukkan URL gambar
  3. Klik "Add Image"

### 6. Undo/Redo
- **Undo** - Batalkan perubahan (Ctrl+Z)
- **Redo** - Ulangi perubahan (Ctrl+Y)

## Cara Menggunakan

### Membuat Artikel Baru
1. Buka http://localhost:3000/admin/articles
2. Klik tombol "Tambah Artikel"
3. Isi form:
   - **Judul Artikel** - Judul akan otomatis generate slug
   - **Slug** - URL-friendly identifier (auto-generated)
   - **Ringkasan** - Deskripsi singkat artikel
   - **Konten Artikel** - Gunakan Rich Text Editor untuk menulis
   - **Gambar** - Upload atau masukkan URL gambar
   - **Tags** - Pisahkan dengan koma (contoh: umroh, tips, panduan)
   - **Travel** - Pilih travel penulis
   - **Status** - Publish atau Draft

4. Klik "Simpan Artikel"

### Tips Menulis dengan Rich Text Editor

**1. Struktur Artikel yang Baik:**
```
H1: Judul Utama Artikel
Paragraf pembuka...

H2: Sub Judul Pertama
Konten paragraf...

- Bullet point 1
- Bullet point 2

H2: Sub Judul Kedua
Konten paragraf...

1. Langkah pertama
2. Langkah kedua
```

**2. Menggunakan Format:**
- Gunakan **Bold** untuk menekankan kata penting
- Gunakan *Italic* untuk istilah asing atau penekanan ringan
- Gunakan Quote untuk kutipan atau highlight informasi penting
- Gunakan Code untuk menampilkan kode atau command

**3. Menambahkan Link:**
- Pilih teks yang ingin dijadikan link
- Klik icon link di toolbar
- Masukkan URL lengkap (https://...)
- Klik "Add Link"

**4. Menambahkan Gambar:**
- Letakkan cursor di posisi yang diinginkan
- Klik icon image di toolbar
- Masukkan URL gambar
- Klik "Add Image"
- Gambar akan muncul dengan styling otomatis

**5. Keyboard Shortcuts:**
- Ctrl+B = Bold
- Ctrl+I = Italic
- Ctrl+U = Underline
- Ctrl+Z = Undo
- Ctrl+Y = Redo

## Output HTML

Editor akan menghasilkan HTML yang bersih dan terstruktur:

```html
<h1>Judul Artikel</h1>
<p>Paragraf pertama dengan <strong>teks tebal</strong> dan <em>teks miring</em>.</p>

<h2>Sub Judul</h2>
<ul>
  <li>Item pertama</li>
  <li>Item kedua</li>
</ul>

<blockquote>Ini adalah kutipan penting</blockquote>

<p>Paragraf dengan <a href="https://example.com">link</a>.</p>

<img src="https://example.com/image.jpg" alt="Gambar" />
```

## Styling Otomatis

Editor sudah dilengkapi dengan styling CSS yang bagus:
- Heading dengan ukuran dan weight yang tepat
- List dengan indentasi yang rapi
- Blockquote dengan border dan styling khusus
- Code dengan background abu-abu
- Link dengan warna biru dan underline
- Image dengan border radius dan responsive

## Troubleshooting

**Editor tidak muncul?**
- Pastikan JavaScript enabled di browser
- Refresh halaman (Ctrl+F5)
- Cek console browser untuk error

**Perubahan tidak tersimpan?**
- Pastikan semua field required sudah diisi
- Cek koneksi internet
- Lihat error message yang muncul

**Gambar tidak muncul?**
- Pastikan URL gambar valid dan accessible
- Gunakan URL lengkap dengan https://
- Cek apakah gambar tidak di-block oleh CORS

## Best Practices

1. **Gunakan Heading Secara Hierarkis**
   - H1 untuk judul utama (1x per artikel)
   - H2 untuk sub judul utama
   - H3 untuk sub-sub judul

2. **Paragraf yang Pendek**
   - Maksimal 3-4 kalimat per paragraf
   - Gunakan spasi antar paragraf

3. **Gunakan List untuk Enumerasi**
   - Bullet list untuk item tanpa urutan
   - Numbered list untuk langkah-langkah

4. **Tambahkan Media**
   - Minimal 1 gambar per artikel
   - Gunakan gambar berkualitas tinggi
   - Pastikan gambar relevan dengan konten

5. **Link yang Berguna**
   - Link ke sumber referensi
   - Link ke artikel terkait
   - Gunakan anchor text yang deskriptif

## Contoh Artikel Lengkap

```
[H1] Panduan Lengkap Persiapan Umrah untuk Pemula

Umrah adalah ibadah yang sangat dianjurkan dalam Islam. Artikel ini akan membahas persiapan lengkap yang perlu Anda lakukan sebelum berangkat umrah.

[H2] Persiapan Dokumen

Sebelum berangkat, pastikan dokumen-dokumen berikut sudah lengkap:

1. Paspor dengan masa berlaku minimal 6 bulan
2. Visa umrah
3. Buku vaksinasi meningitis
4. Tiket pesawat PP

[H2] Persiapan Fisik

Persiapan fisik sangat penting untuk kelancaran ibadah:

- Olahraga rutin minimal 2 minggu sebelum keberangkatan
- Konsumsi makanan bergizi
- Istirahat yang cukup
- Konsultasi dengan dokter jika ada kondisi kesehatan khusus

[Quote] "Persiapan yang matang adalah kunci kesuksesan ibadah umrah yang khusyuk"

[H2] Persiapan Mental dan Spiritual

Selain fisik, persiapan mental dan spiritual juga penting:

- Pelajari doa-doa umrah
- Niat yang ikhlas
- Mohon doa restu orang tua
- Selesaikan urusan duniawi

Untuk informasi lebih lengkap, Anda bisa mengunjungi [website resmi Kemenag](https://kemenag.go.id).

[Image: Gambar Masjidil Haram]

[H2] Kesimpulan

Dengan persiapan yang matang, insyaAllah ibadah umrah Anda akan berjalan lancar dan khusyuk. Semoga bermanfaat!
```

---

**Catatan:** Rich Text Editor ini menggunakan Tiptap, sebuah headless editor yang modern dan extensible. Untuk fitur tambahan atau customization, silakan hubungi developer.
