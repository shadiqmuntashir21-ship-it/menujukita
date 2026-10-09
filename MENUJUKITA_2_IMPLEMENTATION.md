# MenujuKita 2.0 — Implementation and Release Gate (2026-10-09)

> **NOT PRODUCTION READY.** This branch must not be merged or deployed yet.
> The Vercel ignored build step intentionally blocks builds on this feature branch. Production remains on main.

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
- Basic educational guide integration into browser-local Demo Pro.

## Applied ONLY in the Neon development branch

1. database/migrations/20261009_finance_ledger.sql
2. database/migrations/20261009_partner_access.sql
3. database/migrations/20261009_agenda_calendar.sql

**Important dev-schema detail:** the development branch initially created license_sessions.partner_id with ON DELETE SET NULL; the committed production migration uses ON DELETE CASCADE instead. An explicit actor_kind check additionally prevents invalid partner sessions from becoming owner sessions. Reconcile the development constraint before security testing. Do not use development as a direct production schema copy.

## Not implemented / release blockers

- Exact end-to-end validation of double-submission, concurrent license/partner claims, revocation, payment trigger and financial correction.
- E2E verification of Neon OIDC bridge, storage bridge and private documents using the actual Vercel runtime.
- Production-ready access recovery: the inherited PR #4 email-first PIN rotation still needs a pending credential flow.
- Actual shared finance ledger parity in Demo Pro (it currently has its original local simulation).
- Additional requested modules: full visual concept/mood board, seserahan planner, mini digital invitation, Deep Talk/decisions, richer staff permissions, admin guide/template editing, complete print/PDF/Excel exports.
- Full mobile browser/Instagram in-app/PWA QA, accessibility audit, performance/limits audit for 250 weddings.
- Controlled checkout-email-admin-license activation test without issuing access to a real purchaser.
- Final CI pass for the final commit and exact one-time production deployment.

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

## Current production

Not altered in this feature branch. Never reset or seed customer production data merely to test UI.
