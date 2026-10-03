# MenujuKita — Final Production Readiness

Status: **FINAL QA — NO ACTUAL PRODUCTION DEPLOY YET**

## Product Baseline
- Promo pilot: **Rp49.000 / wedding**
- Max **250 active wedding licenses**
- 1 lisensi = 1 Wedding Workspace
- Customer auth: **Kode Lisensi + PIN**, tanpa email/password
- Demo: local browser only, tidak memakai Neon/license
- Admin: separate Super Admin PIN
- UI: Wedding Studio view-based shell + mobile bottom navigation
- Day-H: separate focus mode

## Auth & Security Gate
- Kode Lisensi disimpan hash-only
- PIN customer memakai random salt + scrypt
- PIN Super Admin memakai random salt + scrypt dan di-seed privat ke app_settings
- Customer/admin login rate limited
- Session token random 256-bit; database hanya menyimpan token hash
- Force logout dan reset PIN merevoke session lama
- Access audit log aktif
- Public RSVP HMAC signing tetap terpisah
- Suspended/revoked license tidak dapat masuk workspace
- Cross-wedding database triggers tetap aktif
- Private file signed URL tetap aktif

## Isolated Neon QA
Dev branch: dev-license-pin-studio-20261003
Branch expires automatically on 2026-10-04T15:00:00Z.

Verified:
1. license pin_salt tersedia
2. license session dapat dibuat
3. license session dapat direvoke
4. admin session table tersedia
5. access log table tersedia
6. Super Admin hash + salt dapat disimpan
7. production branch belum menerima QA records

## Vercel Deployment Guard
Repo sebelumnya terhubung ke 3 project Vercel.
Canonical project:
- name: menujukita
- ID: prj_rp05XZ24A3tOZSw1dQmJUF5bQ4AO

Duplicates yang harus tetap skip:
- menujukita-da4n
- menujukita-1xop

CI-only commits memakai:
- vercel.json ignoreCommand = exit 0

Final deploy commit memakai condition berbasis VERCEL_PROJECT_ID:
- duplicates → exit 0 / ignored
- canonical menujukita → exit 1 / build

Dengan demikian actual Vercel production build tetap **satu kali**.

## Production Environment Required
- DATABASE_URL
- RSVP_SIGNING_SECRET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_ENDPOINT_URL_S3
- AWS_REGION
- NEON_STORAGE_BUCKET

Neon Auth variables tidak lagi dibutuhkan untuk customer login.

## Final Deployment Sequence
1. Push CI-only commit dengan semua Vercel build di-skip.
2. Pastikan GitHub CI npm ci + tsc + next build hijau.
3. Apply migration auth/session ke production Neon.
4. Seed Super Admin PIN secara privat ke production DB.
5. Verifikasi production schema + 250-cap trigger.
6. Ubah Vercel ignoreCommand agar hanya canonical project boleh build.
7. Push final deploy commit.
8. Pastikan hanya canonical project membuat actual deployment.
9. Smoke test landing, Demo Pro, PWA, login, setup, Wedding Studio, CRUD, RSVP, seating, Vault, Day-H, Admin, support mode.
10. Scan Vercel build/runtime logs.

## Deployment Rule
**Tidak ada actual deploy berulang selama development. Hanya satu actual production deployment di akhir.**
