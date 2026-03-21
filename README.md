# BE-BlockNest
```
BE-BlockNest/
├── node_modules/
├── src/                  # Semua kode sumber aplikasi kamu ada di sini
│   ├── config/           # Konfigurasi pihak ketiga (misal: koneksi Database)
│   ├── controllers/      # Logika utama: Menerima request dan mengirim response
│   ├── middlewares/      # Fungsi penengah (misal: cek login, error handling)
│   ├── models/           # Skema dan struktur data untuk Database
│   ├── routes/           # Daftar endpoint URL (misal: /users, /posts)
│   ├── utils/            # Fungsi bantuan yang sering dipakai (format tanggal, dll)
│   └── index.js          # File utama untuk menyalakan server Express
├── .env                  # Tempat menyimpan data rahasia (Password DB, Port)
├── .gitignore            # Daftar file yang tidak boleh masuk ke GitHub
└── package.json
```
