# SUE Clinical Notes

This working copy continues the source export dated 2026-09-23.
Read ../project-plan.md for the approved plan and
../SUE-Clinical-Notes-Handoff/开发交接与已知限制.md for inherited limitations.

Phase 1: dependencies installed, TypeScript check passed, and the original
password setup page rendered and visually inspected at http://127.0.0.1:3000/login.
Do not enter real patient data. Development currently runs with `npm run dev`; Docker
packaging comes later.

Phase 2: applied the inherited migration, seeded 4 fictional patients / 12
encounters / 12 draft notes, and passed `npm run db:verify` in separate processes.
Verified scores, dates, preserved revisions, finalized-note locks, addendum
requirements, and patient archiving. No real patient data or password was added.
The local read-only report is `storage/verification/phase-2-report.html` (ignored
by Git). Its rendered page was visually checked. Prisma Studio's automated
browser view stayed loading; Studio was stopped. Subsequently, an isolated
browser test signed in to the actual app and verified all 12 note values,
patient switching, search, reload, narrow-screen layout, logout, and protected
access. Desktop and mobile screenshots were inspected. Sue then set her own
password locally and confirmed the patient/date/search/reload checks passed.

Phase 3: isolated tests passed for password hashing, file permissions, setup
validation, rejection of password replacement, incorrect passwords, five-attempt
lockout, two-hour idle expiry, twelve-hour maximum session duration, forged
sessions, origin checks, cookie flags, no-store responses, and logout revocation.
Sue confirmed her own login works.

Phase 4 is in progress: patient list/search, initial entry, follow-up entry,
draft revision history, finalization, print/PDF, patient detail/editing, and
empty/source-pending payer reference pages are implemented. The appointments
page currently uses fictional Square-style records; it lets you associate a
scheduled demo appointment with a demo patient but does not connect to Square.
An isolated browser test verified saving and reopening this association,
preventing links from cancelled appointments, and leaving the appointment and
encounter counts unchanged. The patient/note workflows also passed their
isolated browser checks. A follow-up validation issue for existing seeded
patients was fixed; a browser check confirmed saving and reloading a follow-up
for that ID format, including a pain-score-only entry. Its temporary patient
was archived. Type checking and database safeguards passed. Exact
CPT choices still await Sue's confirmation. This remains a fictional-data local
preview; do not enter real patient information.

`npm run test:access` uses an isolated temporary credential store. To run the
HTTP regression test, start a separate development instance on port 3001 with
`SUE_AUTH_DIR` pointing to a fresh temporary directory and `SUE_TEST_DIST` set
to `.next-phase2-check`, then run:

    SUE_AUTH_TEST_URL=http://127.0.0.1:3001 node --test tests/access-http.test.mjs

That HTTP test sets a test password and triggers lockout; never run it against
the user's credential store. Stop the isolated server afterward.

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
