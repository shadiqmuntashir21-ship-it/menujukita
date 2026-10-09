# MenujuKita 2.0 — Implementation and Release Gate (2026-10-09)

> **Release candidate: 2026-10-09.** GitHub CI now includes real-browser Demo Pro smoke; Neon staging SQL smoke and full migration replay passed.
> Production schema has been migrated non-destructively after a pre-release backup; production code will be deployed once after the final CI passes.

## Canonical infrastructure

- GitHub: shadiqmuntashir21-ship-it/menujukita
- Vercel: shadiq/menujukita-da4n, project ID prj_ozb4CSrWCVsRIFAqA39uQi4UbGqS
- Neon: steep-forest-69917879, production br-bitter-waterfall-b5jea6qo
- Neon dev only: br-plain-butterfly-b58inqvg (menujukita-2-development)
- Initial feature branch built from fix/production-readiness-20261009, retaining PR #4 changes.

## Implemented in the feature branch

- 16 Indonesian contextual learning guides and a searchable guide center, linked to checklist actions.
- 45 stage-aware starter tasks, chosen by planning style; deadline recommendations never start overdue.
- Five-screen guided onboarding and optional unknown wedding date.
- Real budget target decoupled from actual wedding cash.
- Non-destructive, auditable cash ledger for deposits/withdrawals/refunds/vendor payments; vendor payments synchronized by database triggers.
- Joint calendar displaying existing tasks, payments, wedding events, and rundown plus writable custom agenda.
- Separate partner identity with one-time link, personal six-digit PIN, scoped session and revocation.
- Educational guide integration into browser-local Demo Pro, plus simulated cash deposits, withdrawals, concept, seserahan, and discussion.

## Applied ONLY in the Neon development branch

1. database/migrations/20261009_finance_ledger.sql
2. database/migrations/20261009_partner_access.sql
3. database/migrations/20261009_agenda_calendar.sql
4. database/migrations/20261009_wedding_companion.sql
5. database/migrations/20261009_pending_pin.sql

**Dev constraint detail:** partner_id on the development branch uses ON DELETE SET NULL, while the production migration uses ON DELETE CASCADE. In both environments, actor_kind prevents removed partner sessions from becoming owner sessions. The production migration was tested for idempotency on the development branch.

## Not implemented / release blockers

- Database transaction rollback tests for partner claim/revocation, finance ledger corrections and onboarding modules passed. True browser-driven purchase, email receipt and two-user concurrent sessions should still receive a controlled post-deploy test using non-customer data.
- E2E verification of Neon OIDC bridge, storage bridge and private documents using the actual Vercel runtime.
- A pending-PIN recovery flow is now coded: old access remains valid until the replacement is claimed. Still needs concurrency and full email failure testing.
- Demo Pro has local cash-movement simulation, but its implementation is not yet the exact same reusable component and storage adapter as production.
- New modules coded: concept and URL-backed inspiration board, seserahan, joint decisions/comments, event editor, CSV exports and print-to-PDF summary.
- Still incomplete: direct image upload for mood board, full spreadsheet XLSX download, advanced vendor comparisons, rich staff permissions, admin editing of guidance/templates, and reusable demo/production feature parity.
- Full mobile browser/Instagram in-app/PWA QA, accessibility audit, performance/limits audit for 250 weddings.
- Controlled checkout-email-admin-license activation test without issuing access to a real purchaser.
- Final CI pass for the exact release commit and one-time production deployment; CI now tests desktop/mobile Demo Pro interactions.

## Mandatory release sequence

1. Finish incomplete modules and reconcile preexisting auth/permissions without exposing other wedding data.
2. Verify all migrations on a test Neon branch, including data isolation, transaction idempotency and rollback plan.
3. Test staged real app with production-equivalent OIDC + database settings, separately from the actual production website.
4. Run TypeScript, Next.js builds, lint/security checks and 18+ real task scenarios.
5. Create verified backup/rollback before touching production.
6. Apply **non-destructive** reviewed migrations to the exact production branch.
7. Restore the canonical Vercel ignoreCommand guard only at the final release commit; ensure duplicate projects remain ignored.
8. Merge once, trigger one production deploy, verify its commit matches and deployment is READY.
9. Smoke test /api/health, login, partner, cash, agenda, checklist, purchase, email, RSVP, documents, Day-H and PWA.
10. If any release gate fails, do not call it ready; use rollback plan.

## October 9 follow-up

- New companion tables were created only on Neon development branch, not production. An unused wedding_invitation_pages table exists in the development branch from earlier experiments; it is not read by application code and is excluded from release migrations. It will only be dropped with explicit approval after verification.
- CI TypeScript and Next.js builds passed on previous commits; final branch head must pass again.
- Digital invitation feature was explicitly removed on request. Event dates remain editable in Wedding Settings; individual RSVP links remain for attendance management.
- CSV exports use authenticated wedding scope and sanitize spreadsheet formula beginnings.
- Existing production deploy and GitHub main must remain unchanged until final release validation.

## Release safety status

- Neon production snapshot backup: br-twilight-art-b5or5u8l, created before migrations. No production wedding or license data reset.
- Neon production migration: 26 additive/idempotent DDL statements applied transactionally; 8 new tables and 2 payment triggers verified; existing production /api/health remained 200.
- Preview deployment health returned 200 only after configuring a development-only Neon DB Bridge with preview OIDC scope; production bridge remains production-only.
- GitHub CI has passed browser navigation, checklist add/persist/reset, responsive mobile and TypeScript/build tests at commit c21f843.
- Outbound transactional email live delivery, real multi-user browser POST actions, customer payment verification, and PWA device-specific UX are not fully proven by automated smoke; verify immediately after release without real customer charges.
- Do not reset or seed real production data for tests.

## Scope update: no digital invitations

Digital invitation design, public shareable wedding page, publication settings, Demo Pro invitation, and their migration were removed by request. Keep event schedule/calendar, guest list, privately signed RSVP confirmation links, seating, wedding documents, and rundown. Do not reintroduce a public digital invitation as part of this project unless requested.
