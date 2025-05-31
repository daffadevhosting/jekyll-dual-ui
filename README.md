# 🔀 DUAL-UI Jekyll Site

Boilerplate **Jekyll** yang memiliki **dua tampilan antarmuka (UI)** terpisah:

* 💻 **UI Desktop** menggunakan [Bootstrap 5.3](https://getbootstrap.com/)
* 📱 **UI Mobile** menggunakan [@ionic/core@8](https://www.npmjs.com/package/@ionic/core)

---

## 📁 Struktur Proyek

```
/
├── desktop/           # Halaman dan layout untuk desktop
│   ├── index.html
│   └── ...
├── mobile/            # Halaman dan layout untuk mobile
│   ├── index.html
│   └── ...
├── assets/             # CSS, JS, gambar
│   └── vendor/
│       ├── bootstrap/      # Bootstrap 5.3
│       └── ionic/          # Ionic Core 8
├── _layouts/
│   ├── desktop.html
│   ├── default.html
│   └── mobile.html
├── index.html          # Script redirect ke UI sesuai perangkat
├── 403.html            # Halaman akses ditolak
└── _config.yml         # Konfigurasi Jekyll
```

---

## 🚀 Fitur Utama

* 🔁 **Redirect otomatis** ke `/desktop/` atau `/mobile/` sesuai ukuran layar.
* 🧠 **Pendeteksi perangkat** berbasis JavaScript yang mencegah akses ke UI yang salah.
* 🎨 Dua sistem UI terpisah untuk pengalaman pengguna yang lebih optimal.
* 🚱 Halaman `403.html` untuk melarang akses jika pengguna membuka UI yang tidak sesuai.

---

## 🧰 Teknologi Digunakan

| Teknologi      | Fungsi                         |
| -------------- | ------------------------------ |
| Jekyll         | Static site generator          |
| Bootstrap 5.3  | Tampilan UI untuk desktop      |
| @ionic/core\@8 | Web components untuk mobile UI |
| JavaScript     | Deteksi perangkat & redirect   |
| Liquid         | Template engine dari Jekyll    |

---

## 🔧 Cara Menjalankan secara Lokal

1. **Install Jekyll**:

   ```bash
   gem install jekyll bundler
   ```

2. **Clone repo ini**

    ```bash
    git clone https://github.com/daffadevhosting/jekyll-dual-ui.git
    ```

   **dan jalankan**:

   ```bash
   cd jekyll-dual-ui
   bundle install
   bundle exec jekyll serve
   ```

3. **Akses situs** di: [http://localhost:8800](http://localhost:8800)

---

## 🔒 Proteksi Akses UI

Script JavaScript ditambahkan dalam layout untuk memastikan:

* UI mobile hanya bisa diakses dari layar kecil (≤768px)
* UI desktop hanya bisa diakses dari layar besar (>768px)
* Jika akses tidak sesuai, pengguna diarahkan ke `/403.html`

---

## 🗜️ TODO (pengembangan berikutnya)

* [ ] Menyediakan tombol ganti UI manual
* [ ] Dukungan bahasa ganda (i18n)
* [ ] Mode dark/light otomatis

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).

---

## ✨ Kredit

* [Bootstrap](https://getbootstrap.com/)
* [Ionic Framework](https://ionicframework.com/)
* [Jekyll](https://jekyllrb.com/)
