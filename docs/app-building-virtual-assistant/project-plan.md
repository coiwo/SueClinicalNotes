# SUE Clinical Notes — project plan

Updated: September 24, 2026

## At a glance

Continue the existing SUE Clinical Notes app rather than rebuild it. Keep the prototype's dark green and cream design and make its patient workspace support real entry, saving, editing, and review. The main goal is to quickly find earlier notes and prepare accurate English notes based on what actually happened at each visit.

Sue confirmed this written plan on September 23, 2026. Stage A and Phases 0–3 are complete. Phase 4 is underway; patient/note workflows and the fictional appointment-linking preview are ready for Sue to inspect. Conversation language is English.

Phase 4 progress: added patient directory search, create patient with an English draft, patient detail and visit history, editable draft revisions that preserve prior versions, finalization, print-to-PDF, patient metadata correction, new follow-up entry, and payer reference/status pages with no invented rules. Added a prominent local-test banner; entries made here are marked as demo data. An isolated browser run verified creating an initial note, saving a follow-up, changing a draft as version 2 while preserving version 1 and visit count, and finalizing a draft. A later check caught and fixed a follow-up validation error for existing demo patients; the form now accepts their stored ID format and a provided pain score as visit information. A repeat browser check confirmed the follow-up saved and remained after reload. The temporary test patient was archived. The appointments screen now displays three fictional Square-style appointments; a browser check linked a scheduled appointment to a demo patient, verified it stayed linked after reload, blocked cancelled appointments from linking, and confirmed no appointment or encounter was created or removed. The patient detail page now shows score changes between actual visits, a payer status panel that stays explicitly unconfirmed without source material, and an export action for the full note history. An isolated browser test inspected the rendered page and generated a valid print-to-PDF file containing the three notes. This is a local preview only; no Square account or live data is connected. TypeScript and database-safeguard checks passed. Real patient use is not ready: automatic backups, reviewed dependencies, hosting, and source-verified payer rules are incomplete. Exact CPT options await Sue's confirmation of actual codes; editable payer source-document records remain to be built.

Phase 4 follow-up notes: Sue is not yet sure which CPT codes the clinic uses or how e-stimulation timing should be recorded. Revisit this with her later; until confirmed, do not provide selectable CPT choices or assume codes or timing increments.

Phase 3 verification: isolated credential-store and HTTP tests passed for password hashing, private credential-file permissions, setup validation, preventing setup from replacing an existing password, incorrect-password rejection, five-attempt lockout, idle and absolute session expiry, forged/revoked sessions, origin checks, cookie flags, and no-store patient responses. TypeScript checking passed. Sue has successfully set her own password and logged in; her credentials were not changed by these tests. HTTPS-only cookie behavior remains a production deployment check, not a claim of verified HTTPS here.

Phase 2 completion update: after the initial report, an actual-browser test used a separate temporary login against the same fictional database. It verified all four patients and twelve note values, search, page reload, narrow-screen layout, logout, and unauthenticated redirects. Desktop and mobile screenshots were inspected. Sue subsequently logged in herself and confirmed patient switching, dates, expected scores, search, and reload all passed. Prisma Studio remains a separate viewer issue; the app/database integration has been verified directly.

Phase 2 verification: applied the inherited migration with its protection triggers; seeded four fictional patients, twelve encounters, and twelve drafts. Separate process read-back verified visit dates, scores, missing-score handling, and note text. Guard checks passed for score bounds, preserved versions, stable encounter counts, locked final notes, correction reasons, and patient archiving. Test changes were rolled back. The database and local configuration are ignored by Git. Prisma Studio started locally but its browser view remained loading; it was stopped. As a visual alternative, a read-only report was generated directly from the saved demo records at `sue-clinical-notes/storage/verification/phase-2-report.html` and its rendered screenshot was inspected. Actual patient-workspace and login interaction checks remain in Phase 3; no password was set by the assistant.

Phase 1 verification: copied the existing app to `sue-clinical-notes`, installed its locked dependencies, passed TypeScript checking, and ran the server bound to 127.0.0.1. Chrome rendered the original first-time password setup page; its screenshot was inspected and the server returned HTTP 200. Patient workspace rendering, database initialization, and password setup have not yet been verified in this working copy. No application UI or clinical logic was changed. Dependency audit reported seven affected packages (two critical, four high, one moderate); details are recorded in the app README and must be resolved and retested before real-data or remote use.

Phase 0 verification: Node.js v26.6.0, npm 11.18.0, Docker 20.10.11, and Docker Compose v2.2.1 are installed. Docker responded successfully to `docker ps` with no running containers after permission was granted to access its local socket. This Mac uses arm64 and has approximately 1.1 TiB of free disk space. These are environment checks, not yet proof that the inherited app builds or runs with these versions; compatibility will be checked when starting the app.

Working-copy decision: reuse the source from `SUE-Clinical-Notes-Handoff/app` in a new outer-folder subdirectory named `sue-clinical-notes`, preserving the handoff as the original reference.

## Design reference

The source of truth is `SUE-Clinical-Notes-Handoff/app`, especially its existing workspace and styles, together with the handoff documents. Preserve the SUE branding, dark green accents, cream backgrounds, patient search sidebar, visit timeline, summary cards, sectioned note reading, source-text tab, tables, and muted review panel. Extend this design to forms and other pages using shared components. No emoji in the app.

The code and handoff have been reviewed, and the existing login and patient workspace have now been rendered and inspected in this session, including desktop and narrow-screen workspace layouts. Earlier original-site screenshots and the older prototype ZIP are mentioned in the handoff but have not been inspected here.

## Existing work and current position

The handoff contains an app foundation, database definitions and migrations, fictional seed records, shared-password login code, and a read-only patient workspace. Previous test results are documented, but are not fresh verification on this computer. The handoff excludes passwords, live databases, patient files, installed dependencies, and local sample material.

The earlier project reached the database stage, implemented login pending Sue's normal password setup and confirmation, and previewed part of the patient interface. This session has verified the inherited foundation and database, and is completing login acceptance before building entry/editing workflows. We continue to reuse the existing app in phase order.

## Pages and everyday workflow

- Login: shared password, entered locally rather than in chat, with failed-login limits and expiring sessions.
- Patient list and record: search patients, see payer and treatment details, review visits by date, correct patient details, and archive records.
- New patient and initial note: enter actual clinical information, preview an English draft, save it, review it, and finalize when ready.
- Follow-up workspace: refer to the previous note, enter this visit's facts and changes, preview and edit the new draft, and save it. Previous findings must not automatically become current findings.
- Note history and export: copy notes, export TXT or print/PDF, and export a patient's complete note history. Finalized records remain preserved; later corrections record their reason and retain the original.
- Appointments: read patient and appointment information from Square and link it to local records. App changes do not write back to Square. Cancelled or missed appointments do not count as completed treatments.
- Payer reference: maintain source-backed requirements and local attachments for Aetna, Cigna/ASH, BCBS, and UHC. Clearly distinguish verified source material, individual claim observations, and unconfirmed statements. UMR handling remains undecided.

Editing a note version must not increase treatment counts. Saving must persist across app restarts. Changing inputs must prevent accidental export of an outdated preview. Concurrent edits must not silently overwrite each other.

## Templates, language, and AI

The app interface remains mixed Chinese and English; insurance-facing notes must be English. Start with reviewed fixed templates, with AI as an optional, deliberately triggered aid. Fixed-template generation does not call an external AI service. A future hosted app still transmits saved entries to its chosen server.

Never invent clinical findings, scores, treatment details, progress, or payer rules. Missing or conflicting information is flagged for review. Sue reviews drafts before finalizing. No template guarantees claim payment.

The handoff describes about 20 samples for future template work; they are not included in this package. Handling Chinese free text in an English note needs a specific agreed approach. AI provider, transmitted fields, costs, data terms, and necessary agreements will be settled before real patient text is sent.

## Confirmed choices and remaining decisions

- Name: SUE Clinical Notes.
- Conversation: English; switch automatically when Sue changes language.
- Interface: mixed Chinese/English. Clinical notes: English only.
- Appearance: closely follow the existing green-and-cream prototype.
- Login: shared password initially. Individual accounts and Google Sign-In are deferred.
- Calendar: Square read-only integration is in scope. Google Calendar is excluded from this version.
- Remote access: required for the intended first usable version, including when Sue's Mac is off. This requires an always-running server; no provider has been selected or deployment authorized.
- Backups: destination remains undecided. Daily backups and a verified recovery process are required before real patient use; an external drive may be added later.
- Historical records: the handoff reports dozens of Word/PDF files with inconsistent formats. Exact paths, format groups, and any scanned PDFs will be confirmed at import time.
- Later: CMS-1500 form generation and claims submission planning are outside the initial build.

Remaining decisions will be addressed at their relevant stages: hosting budget/provider/region, backup destination, Square access scope, AI service and terms, translation behavior, UMR categorization, supported CPT choices, and historical-file locations. No service purchases, external account connections, or public deployment are authorized by this plan alone.

## Technology

Reuse Next.js and React for pages and interactions, TypeScript for code checks, Tailwind CSS and the existing styles for presentation, and Prisma with SQLite for stored records. Retain and verify the current shared-password implementation. Add Docker packaging for everyday operation later.

SQLite and the current login storage suit a single app instance. Hosting must respect that constraint; scaling to multiple instances would require revisiting storage and sessions.

## Phase order

Each phase is checked by the assistant, demonstrated in plain language, and confirmed by Sue before the next phase begins.

1. Stage A — review and confirm this updated plan.
2. Phase 0 — verify privacy settings and the current computer's Node/Docker environment. Earlier checks are historical evidence, not verification of this machine.
3. Phase 1 — reuse the existing scaffold in a working app folder, install needed dependencies, render the existing app locally, and verify its appearance. Preserve the handoff as the reference; establish local-only version history.
4. Phase 2 — recreate fictional test data, verify database safeguards and persistence, and show records through the app.
5. Phase 3 — verify login protections and let Sue set and test the password locally.
6. Phase 4 — complete patient entry, note editing/saving, follow-ups, templates, finalization, and export in the existing style. Build Square behavior with fictional data before connecting an authorized account. Add optional AI only after its data flow is agreed.
7. Phase 5 — finish payer reference editing and attachments; activate requirements only after reviewing actual sources with Sue.
8. Phase 6 — package with Docker, confirm hosting and costs, obtain deployment approval, and establish protected remote access, daily independent backups, visible backup status, and tested restoration. Hosted backups must work while Sue's Mac is off.
9. Phase 7 — locally inspect and import historical files in small verified batches, preserving originals and reporting uncertain fields rather than guessing.

## Data safety commitments

Use fictional patients during development. Keep the development app local and password-protected. Never upload secrets or patient data to GitHub; keep databases, uploads, and secrets out of version history. Never publish the app or weaken access controls without explicit confirmation at that time.

Before real data is used, verify access protection, the hosting/data arrangements, and daily backups of both records and attachments to an independent protected destination. Test that backups can be restored. Read historical patient files only through local tools; do not ask Sue to upload them to chat. Local file paths alone do not establish that every processing step stays on the device.

Explain and agree to any external AI data flow before enabling it for real patient text. These security measures alone do not establish HIPAA compliance.

## What counts as working

Actual rendered pages and real workflow checks are required, not just file listings or successful builds. Verify saving and reopening records, restart persistence, correction history, accurate visit counts, English output, validation, export matching the reviewed draft, and denied access when logged out. Verify Square sync avoids duplicates, remote access works with the Mac off, and backups restore successfully at the relevant phases.
