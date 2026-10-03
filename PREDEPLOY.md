# MenujuKita — Production Readiness

Status: **PRE-DEPLOY QA**

Production deployment is intentionally postponed until the Vercel account/project is connected correctly. Do not create repeated preview/production deployments just for testing.

## Verified

- GitHub CI Next.js production build: passing
- Runtime dependencies pinned to exact versions
- Neon production branch contains no QA data
- Pilot capacity hard limit: 250 active wedding licenses
- Demo data is browser-local and does not consume licenses
- Neon Auth provisioned
- Private Object Storage bucket provisioned
- Workspace membership is resolved server-side
- Financial permissions enforced server-side
- Financial Document Vault access enforced at query, upload and download layers
- HMAC-signed public RSVP with a dedicated signing secret
- Public RSVP is disabled if the wedding or license is inactive
- Public RSVP rate limiting
- Cross-wedding database guards active
- One active owner per wedding enforced
- Multi-workspace switcher supports owner/partner/collaborator workflows
- PWA 192px / 512px / maskable icons configured
- Live workspace never falls back to Demo while offline
- Mobile application-style navigation implemented
- Global Search is permission-aware
- Safe to Spend deducts paid amounts, outstanding commitments, and reserve buffer
- Basic production security headers configured (`nosniff`, frame deny, referrer policy, permissions policy, COOP)

## Isolated Neon QA

Temporary branch:

`qa-menujukita-predeploy-20261003`

It expires automatically on 2026-10-04.

Passed integration checks:

1. active license capacity guard rejects capacity overflow
2. second active owner is rejected
3. cross-wedding vendor/payment reference is rejected
4. cross-wedding guest/seating reference is rejected
5. cross-wedding task/event reference is rejected
6. cross-wedding RSVP reference is rejected
7. cross-wedding rundown/vendor reference is rejected
8. valid same-wedding partner/payment/seating/task/RSVP/rundown relations succeed
9. active-license wedding RSVP remains publicly available
10. suspended-license wedding RSVP is hidden

No QA records were written to the production branch.

## Production Environment Required

- DATABASE_URL
- NEON_AUTH_BASE_URL
- NEON_AUTH_COOKIE_SECRET
- RSVP_SIGNING_SECRET (separate, random, at least 32 characters; do not rotate casually after links are issued)
- ADMIN_EMAILS
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_ENDPOINT_URL_S3
- AWS_REGION
- NEON_STORAGE_BUCKET

## Final Deployment Sequence

1. Confirm the correct Vercel account/team is connected.
2. Create/link the Vercel project to `shadiqmuntashir21-ship-it/menujukita`.
3. Configure all production environment variables.
4. Confirm Node.js 22 runtime.
5. Perform one production deployment.
6. Obtain the final production domain.
7. Add the production domain to Neon Auth trusted domains.
8. Verify:
   - landing
   - Demo Mode
   - installable PWA
   - sign-up/sign-in
   - license activation
   - live workspace
   - task/vendor/budget/payment/guest CRUD
   - public RSVP
   - seating
   - collaboration invite
   - Document Vault
   - Day-H Mode
   - admin capacity controls
9. Scan Vercel build/runtime logs for errors.

## Deployment Rule

**Do not deploy repeatedly during development. Production deployment happens only after all checks above are satisfied.**
