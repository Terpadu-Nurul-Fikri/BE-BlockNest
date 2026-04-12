# Backend Feature Updates

Dokumen ini menjelaskan update yang sudah ditambahkan untuk admin CRUD, webhook payment, dan model review.

## 1. Route Baru dan Proteksi Role

### Product Admin (`/api/admin/products`)

- `GET /api/admin/products` daftar semua produk untuk admin
- `GET /api/admin/products/:id` detail produk by id
- `POST /api/admin/products` tambah produk
- `PUT /api/admin/products/:id` ubah produk
- `DELETE /api/admin/products/:id` hapus produk

Semua endpoint di atas dilindungi middleware:

- `redirectGuestToLogin`
- `authorizeRoles("ADMIN")`

### Category Admin (`/api/category/admin`)

- `GET /api/category/admin` daftar category
- `GET /api/category/admin/:id` detail category
- `POST /api/category/admin` tambah category
- `PUT /api/category/admin/:id` ubah category
- `DELETE /api/category/admin/:id` hapus category

Semua endpoint admin category juga dilindungi middleware admin.

### Banner Admin (`/api/banners`)

- `GET /api/banners/active` public untuk frontend
- `GET /api/banners` admin only
- `GET /api/banners/:id` admin only
- `POST /api/banners` admin only
- `PUT /api/banners/:id` admin only
- `DELETE /api/banners/:id` admin only

## 2. Payment Webhook

Endpoint baru:

- `POST /api/webhooks/payment`

Controller webhook akan:

- validasi signature webhook jika env `PAYMENT_WEBHOOK_SECRET` di-set
- mapping status payment gateway ke `PaymentStatus` internal (`PENDING`, `SUCCESS`, `FAILED`)
- update/create data pada tabel `payments`
- sinkronkan status order (`PAID`, `PENDING`, `CANCELLED`)

Contoh payload webhook:

```json
{
  "order_id": "uuid-order-di-sistem",
  "transaction_id": "trx-12345",
  "payment_type": "bank_transfer",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "gross_amount": "150000"
}
```

Jika menggunakan signature secret, kirim header:

- `x-webhook-signature: <hmac_sha256_hex>`

Nilai signature dihitung dari raw request body dengan key `PAYMENT_WEBHOOK_SECRET`.

## 3. Review Model (Prisma)

Model baru: `Review`

Struktur utama:

- `id`
- `userId`
- `productId`
- `rating`
- `comment`
- `createdAt`
- `updatedAt`

Relasi:

- `User` memiliki `reviews: Review[]`
- `Product` memiliki `reviews: Review[]`

Constraint:

- `@@unique([userId, productId])` agar 1 user hanya bisa memberi 1 review per produk.

## 4. Update Index Server

`src/index.js` diupdate agar:

- register route webhook `app.use("/api/webhooks", webhookRouters)`
- simpan raw body via `express.json({ verify })` untuk validasi signature webhook
- expose endpoint health check `GET /health`
- tambah fallback 404 JSON untuk endpoint yang tidak ditemukan

## 5. Langkah Setelah Perubahan

1. Jalankan migrasi Prisma untuk model review:

```bash
npx prisma migrate dev --name add-review-model
```

2. Regenerate Prisma client:

```bash
npx prisma generate
```

3. Set environment variable webhook jika diperlukan:

```bash
PAYMENT_WEBHOOK_SECRET=your-secret-key
```

4. Test endpoint admin dengan JWT user role `ADMIN`.
