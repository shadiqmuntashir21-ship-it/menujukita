# MenujuKita — Final Production Readiness

Status: **FINAL CI GATE — ACTUAL VERCEL DEPLOY BELUM DIBUKA**

## Product
- Rp49.000 / wedding
- max 250 active wedding licenses
- 1 license = 1 Wedding Workspace
- Kode Lisensi + PIN
- local Demo Pro
- Wedding Studio + Day-H Mode

## Production Backend
Neon project: `steep-forest-69917879`
Production branch: `br-bitter-waterfall-b5jea6qo`

Verified:
- 250 active-wedding cap tetap aktif
- 0 active license
- 3 unused license existing
- 0 active wedding
- customer/admin session tables tersedia
- access audit table tersedia
- Super Admin PIN hash+salt tersedia
- runtime `app_secrets` tersedia
- `rsvp_signing_secret` digenerate server-side
- `storage_internal_secret` digenerate server-side
- private bucket `menujukita-private` tersedia
- production Neon Function `storagebridge` deployment completed

Rollback snapshot existing:
- `pre-menujukita-license-pin-final-20261003`

## Storage Architecture
Vercel tidak memerlukan AWS/Neon storage credential.

Flow:
1. Vercel server authenticates wedding/session using DATABASE_URL.
2. Vercel reads internal storage secret from server-only `app_secrets`.
3. Vercel calls Neon Function `storagebridge`.
4. Neon Function receives branch Object Storage credentials automatically.
5. Function creates presigned URL / HEAD / DELETE operation.
6. Credential never reaches browser, GitHub, or Vercel project environment.

## Canonical Vercel Project
Use only:
- name: `menujukita-da4n`
- project ID: `prj_ozb4CSrWCVsRIFAqA39uQi4UbGqS`
- team: `shadiq`

The existing project already exposes DATABASE_URL.

Duplicates that must remain ignored:
- `menujukita`
- `menujukita-1xop`

## Deployment Guard
During CI:
```json
{"ignoreCommand":"exit 0"}
```

Final deploy commit will allow builds only when:
`VERCEL_PROJECT_ID=prj_ozb4CSrWCVsRIFAqA39uQi4UbGqS`

Therefore only one actual Vercel build is permitted.

## Final Sequence
1. Push storage/runtime-secret refactor while all Vercel builds are ignored.
2. GitHub CI must pass npm ci, TypeScript, and Next.js builds.
3. Verify production Neon state again.
4. Change only `vercel.json` to allow canonical project.
5. Push one final deploy commit.
6. Confirm duplicate projects show Ignored Build Step.
7. Confirm canonical deployment reaches READY.
8. Verify new `/api/health` = HTTP 200.
9. Smoke test landing, Demo Pro, auth, admin, workspace routes and PWA endpoints.
10. Scan build/runtime errors.

## Rule
**Only one actual Vercel production build/deployment is allowed at the end.**
