# google-auth-upgrade.md

This guide is used in either of two situations: (1) the user chooses Google Sign-In right at Phase 3 of `AGENTS.md`, during initial setup, instead of the simple shared-password gate — in which case follow the steps below from the start; or (2) the app already has the simple password gate running, and the user later decides to switch — in which case this replaces that gate. Either way, don't start this unprompted; it happens because the user chose it, at whichever point that happens.

## Why this option exists
Google Sign-In is worth choosing over a shared password when:
- More than one person (another practitioner, front-desk staff) needs their own login instead of sharing one password.
- The user wants to stop manually sharing/rotating a password.

If neither applies, the simple shared password is the better default — simpler, and just as secure for one person.

## What the user needs to set up first (outside of Codex)
Codex cannot create Google Cloud credentials on its own — walk the user through this part step by step, in plain language, since they have no technical background:

1. Go to https://console.cloud.google.com/apis/credentials (they'll need to sign in with a Google account and may need to create a project first — Codex should explain this is free and just a container for the login credentials).
2. Create an **OAuth 2.0 Client ID** → Application type: **Web application**.
3. Under "Authorized redirect URIs," add: `http://localhost:3000/api/auth/callback/google`
4. After creating it, Google shows a **Client ID** and **Client Secret** — the user copies both.

These two values go into `.env` (never committed to git) as:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Steps for Codex to follow once the above exists
1. If NextAuth isn't already installed (create-t3-app usually includes it), install it: `npm install next-auth`.
2. Configure the Google provider in the NextAuth config (location depends on scaffold version — typically `src/server/auth.ts` or `app/api/auth/[...nextauth]/route.ts`), reading `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from the environment.
3. **Restrict sign-in to an allowlist of specific email addresses** — this app must not accept sign-in from arbitrary Google accounts. Add an allowlist (array of approved emails, editable by the user later) checked in the `signIn` callback; reject anyone not on the list with a clear "not authorized" message.
4. Every other page/route should redirect to a sign-in prompt if there's no valid NextAuth session — if a password gate already exists (the later-upgrade case), replace its check with NextAuth's session check; if building this fresh at Phase 3, this is simply how route protection works from the start.
5. If a password gate already exists from before, ask the user to confirm before deleting the old login page and the `APP_PASSWORD` env var — she may want to keep both temporarily while testing. If there was no prior password gate (chosen fresh at Phase 3), skip this step.
6. Test end to end: sign in with an allowed Google account (should work), and if possible test a non-allowed account (should be rejected with a clear message, not a silent failure).

## Notes to pass along to the user
- Google's consent screen will show an "unverified app" warning during testing — this is normal for a small private app used by a handful of people and does not require Google's full app-verification process unless the app is later opened up to many outside users.
- The user is responsible for keeping the allowed-email list updated as staff changes (adding/removing people who should have access).
- This upgrade does not change where patient data is stored — it only changes how someone proves they're allowed to log in.
