# MenujuKita

**Plan the journey. Enjoy the day.**

MenujuKita adalah **Wedding Planning Studio** dari Teman Digital: ruang kerja wedding yang menyatukan checklist, budget, vendor, tamu, RSVP, seating, dokumen, dan Day-H Mode tanpa terasa seperti dashboard bisnis.

## Pilot
- Harga promo: **Rp49.000 / wedding**
- Kapasitas resmi: **maksimal 250 wedding/lisensi aktif**
- **1 lisensi = 1 Wedding Workspace**
- Customer login memakai **Kode Lisensi + PIN** — tanpa email/password
- Demo Alya & Raka berjalan lokal di browser dan **tidak memakai slot lisensi**
- Database: Neon Postgres
- Private files: Neon Object Storage
- PWA mobile-first untuk HP dan laptop

## Pengalaman Produk

### Landing
- positioning sebagai wedding journey, bukan dashboard generik
- CTA Demo tanpa daftar
- promo Rp49.000
- alur pembelian → Kode Lisensi + PIN → setup wedding

### Demo Pro
- tanpa login dan tanpa database
- localStorage persistence + Reset Demo
- editable checklist, budget, vendor, RSVP simulation, visual seating, Vault preview, Day-H preview

### Wedding Studio
- view-based workspace, bukan satu halaman panjang
- Wedding Health + What Needs Your Attention
- Wedding Journey & smart checklist
- Wedding Wallet + Safe to Spend
- Vendor Partners
- Guest Book + public RSVP
- Visual Seating
- Private Wedding Vault
- Wedding Team access
- Notification Center + Activity
- Day-H Mode terpisah dan fokus

### Admin Control Center
- Super Admin login dengan PIN terpisah
- generate Kode Lisensi + random 6-digit PIN
- database menyimpan **code hash** dan **salted scrypt PIN hash**
- PIN penuh hanya tampil ketika dibuat atau di-reset
- reset PIN otomatis memutus session lama
- force logout seluruh session sebuah lisensi
- suspend/reactivate/revoke
- Open Wedding support mode dengan audit trail
- capacity monitoring 250 slot

## Security
- customer session memakai random 256-bit server-side token; database hanya menyimpan token hash
- PIN customer memakai random salt + scrypt
- PIN Super Admin juga memakai random salt + scrypt dan nilainya di-seed privat ke database, tidak ditulis ke repository
- login customer/admin rate-limited
- access log menyimpan hashed IP, bukan IP mentah
- public RSVP memakai HMAC secret terpisah
- public RSVP hanya tersedia untuk wedding + lisensi aktif
- private documents memakai short-lived signed URL
- file max 5 MB; workspace document max 15 MB
- cross-wedding database guards tetap aktif
- hard cap active license tetap 250

## Environment
Required:
- DATABASE_URL
- RSVP_SIGNING_SECRET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_ENDPOINT_URL_S3
- AWS_REGION
- NEON_STORAGE_BUCKET

Never commit real secrets.

## Database
Base application schema: database/schema.sql

Migration Kode Lisensi + PIN:
database/migrations/20261003_license_pin_sessions.sql

## Development
npm ci && npm run dev

## CI gate
npm ci --no-audit --no-fund → npx tsc --noEmit → npm run build

## Deployment policy
**Actual production deployment hanya sekali di akhir.**
Selama CI, Vercel Git build di-skip melalui vercel.json. Setelah CI hijau, rule diubah agar hanya project canonical MenujuKita yang boleh build; project duplikat tetap skip.

## Brand
**MenujuKita**  
*Plan the journey. Enjoy the day.*

Created by **Teman Digital**.
