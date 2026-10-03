# MenujuKita

**Plan the journey. Enjoy the day.**

MenujuKita adalah **Wedding Planning Studio** dari Teman Digital: ruang kerja wedding untuk checklist, budget, vendor, tamu, RSVP, seating, dokumen, dan Day-H Mode.

## Pilot
- Promo: **Rp49.000 / wedding**
- Maksimal **250 wedding/lisensi aktif**
- **1 lisensi = 1 Wedding Workspace**
- Login customer: **Kode Lisensi + PIN**, tanpa email/password
- Demo Alya & Raka berjalan lokal di browser dan tidak memakai slot lisensi
- Database: Neon Postgres
- Private files: Neon Object Storage
- PWA mobile-first untuk HP dan laptop

## Runtime Architecture
Vercel production hanya membutuhkan koneksi database.

- `DATABASE_URL` tersedia pada project canonical Vercel
- RSVP signing secret digenerate dan disimpan server-side di Neon Postgres
- Object Storage credential tidak disalin ke Vercel
- Storage upload/download/head/delete diproxy secara aman melalui Neon Function `storagebridge`
- Neon Function menerima credential Object Storage dari Neon runtime
- Secret internal antara Vercel dan storage bridge dibaca server-side dari Neon Postgres
- Tidak ada credential sensitif di repository atau browser

## Pengalaman Produk
### Landing
- Wedding journey positioning
- Demo tanpa daftar
- Promo Rp49.000
- Pembelian → Kode Lisensi + PIN → setup wedding

### Demo Pro
- tanpa login/database
- localStorage persistence + Reset Demo
- editable checklist, budget, vendor, RSVP simulation, seating, Vault preview, Day-H preview

### Wedding Studio
- view-based workspace
- Wedding Health + What Needs Your Attention
- Wedding Journey & smart checklist
- Wedding Wallet + Safe to Spend
- Vendor Partners
- Guest Book + public RSVP
- Visual Seating
- Private Wedding Vault
- Wedding Team
- Notification Center + Activity
- Day-H Mode

### Admin Control Center
- Super Admin PIN terpisah
- generate Kode Lisensi + random 6-digit PIN
- code hash + salted scrypt PIN hash
- reset PIN memutus session lama
- force logout
- suspend/reactivate/revoke
- Open Wedding support mode dengan audit trail
- capacity monitoring 250 slot

## Security
- random 256-bit session tokens; DB hanya menyimpan hash
- customer/admin PIN memakai random salt + scrypt
- login customer/admin rate-limited
- access log menyimpan hashed IP
- public RSVP HMAC-signed
- inactive license/wedding tidak dapat memakai RSVP
- private document links short-lived
- max file 5 MB; max workspace documents 15 MB
- cross-wedding database guards aktif
- hard cap active license 250
- runtime secrets tidak disimpan di Git

## Environment
Production Vercel required:
- `DATABASE_URL`

Optional local/dev override:
- `STORAGE_BRIDGE_URL`

## Database
Base schema: `database/schema.sql`

Migrations:
- `database/migrations/20261003_license_pin_sessions.sql`
- `database/migrations/20261004_runtime_secrets.sql`

## Neon Function
Reproducible source:
- `neon-functions/storagebridge/index.mjs`

Production function slug:
- `storagebridge`

## CI
```bash
npm ci --no-audit --no-fund
npx tsc --noEmit
npm run build
```

## Deployment
Actual Vercel build selama development dimatikan menggunakan Ignored Build Step.

Canonical production project:
- `menujukita-da4n`
- `prj_ozb4CSrWCVsRIFAqA39uQi4UbGqS`

Project duplikat tetap di-skip.

## Brand
**MenujuKita**  
*Plan the journey. Enjoy the day.*

Created by **Teman Digital**.
