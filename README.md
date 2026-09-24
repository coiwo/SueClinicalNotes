# SUE Clinical Notes

This working copy continues the source export dated 2026-09-23.
Read ../project-plan.md for the approved plan and
../SUE-Clinical-Notes-Handoff/开发交接与已知限制.md for inherited limitations.

Phase 1: dependencies installed, TypeScript check passed, and the original
password setup page rendered and visually inspected at http://127.0.0.1:3000/login.
Database initialization and password setup are subsequent phases. Do not enter
real patient data. Development currently runs with `npm run dev`; Docker
packaging comes later.

Phase 2: applied the inherited migration, seeded 4 fictional patients / 12
encounters / 12 draft notes, and passed `npm run db:verify` in separate processes.
Verified scores, dates, preserved revisions, finalized-note locks, addendum
requirements, and patient archiving. No real patient data or password was added.
The local read-only report is `storage/verification/phase-2-report.html` (ignored
by Git). Its rendered page was visually checked. Prisma Studio's automated
browser view stayed loading; Studio was stopped. Login and patient-workspace
browser checks remain pending in Phase 3.

Dependency review on 2026-09-23 reported seven affected packages: two critical,
four high, and one moderate. Findings include unused NextAuth scaffold packages,
Prisma configuration dependencies, and Next.js's nested PostCSS. The current
login uses the custom access store, not NextAuth. These findings remain open;
resolve and retest before real data or remote deployment. No automatic major
dependency upgrades were applied during the initial visual baseline check.

Copy .env.example to .env, then run:

    npm ci
    npx prisma migrate deploy
    npm run db:seed
    npm run typecheck
    npm run db:verify
    npm run test:access
    npm run dev

Open http://127.0.0.1:3000/login and choose your own test password. Only fictional records are provided. No clinical sample, password, session, database, or real environment file is distributed.

The exported .env.example and README are simplified for independent testing; application source is unchanged from 04de4a7. The optional import-demo.mjs needs a local sample that is deliberately not distributed. No deployment or patient use is authorized by this test package.
