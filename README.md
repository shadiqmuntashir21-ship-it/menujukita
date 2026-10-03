# MenujuKita

**Plan the journey. Enjoy the day.**

MenujuKita adalah wedding planning command center dari Teman Digital. Produk ini dirancang sebagai PWA mobile-first untuk membantu pasangan mengendalikan persiapan wedding tanpa menyebarkan data ke banyak chat, notes, spreadsheet, dan reminder.

## Pilot
- Kapasitas resmi: **maksimal 250 wedding/lisensi aktif**
- 1 lisensi = 1 wedding workspace
- Demo tidak memakai lisensi dan tidak membuat workspace database
- Database: Neon Lakebase Postgres
- Auth: Neon Managed Better Auth
- Private files: Neon Object Storage

## Fitur yang sudah dibangun
### Demo-first
- dummy wedding Alya & Raka
- tanpa login
- localStorage persistence
- Reset Demo
- simulasi 30 hari
- checklist, vendor, guest, budget, Safe to Spend, Wedding Health

### Live Workspace
- smart onboarding dari tanggal wedding
- seeded checklist dan kategori budget
- Wedding Health berbasis data live
- What Should I Do Next
- checklist CRUD
- rundown + Day-H Mode
- budget + Wedding Safe to Spend
- payment tracker
- vendor manager
- guest manager
- secure public RSVP
- RSVP per event
- seating plan basic
- private Document Vault
- Wedding Team collaboration
- role: owner / partner / collaborator / viewer
- budget permission terpisah
- license suspend/reactivate/revoke handling

### Admin
- admin allowlist via `ADMIN_EMAILS`
- generate activation code
- kode penuh hanya muncul saat dibuat; database menyimpan SHA-256 hash
- registry lisensi
- capacity counter
- hard guard 250 active licenses di database

### PWA
- manifest
- app icon
- service worker
- standalone mode foundation
- demo shell cache

## Stack
- Next.js App Router
- React
- Neon Managed Better Auth
- Neon serverless driver
- Neon Postgres
- Neon Object Storage (private S3-compatible bucket)
- AWS S3 SDK for presigned file operations
- Lucide icons

## Environment
Copy `.env.example` to `.env.local` and configure all values.

Required:
- `DATABASE_URL`
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_COOKIE_SECRET`
- `ADMIN_EMAILS`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ENDPOINT_URL_S3`
- `AWS_REGION`
- `NEON_STORAGE_BUCKET`

Never commit real secrets.

## Database
Reproducible application schema is stored in:
`database/schema.sql`

Neon Managed Better Auth owns the separate `neon_auth` schema.

## Security model
- all live CRUD actions resolve the authenticated wedding membership server-side
- viewer role is read-only
- collaborator can edit operational planning
- financial data requires separate budget permission
- public RSVP links are HMAC-signed
- targeted collaboration invites are tied to the invited email
- documents use a private object bucket and short-lived signed URLs
- uploads are capped at 5 MB/file and 15 MB/workspace
- suspended/revoked licenses cannot enter live workspace

## Development
```bash
npm install
npm run dev
```

## CI
GitHub Actions runs:
```bash
npm install
npm run build
```
No production deployment is performed by CI.

## Deployment policy
The pilot is intentionally **not deployed yet**. Production deployment should happen only after the build gate, final responsive QA, production environment variables, Auth trusted domain, and storage credentials are confirmed.

## Brand
**MenujuKita**  
*Plan the journey. Enjoy the day.*

A Teman Digital Product.
