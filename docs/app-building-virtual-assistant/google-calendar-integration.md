# google-calendar-integration.md

This is a **follow-up, optional** guide — only use it when the user explicitly asks to see her schedule inside the app. It is independent of `google-auth-upgrade.md`: connecting Google Calendar does not require switching her login method first, and switching her login method does not require connecting Calendar. Treat them as two separate, optional upgrades she can adopt in either order or neither.

## What this adds
A "Today's schedule" (or "This week") view inside the app, pulled from her real Google Calendar, showing her actual appointments — with an option to link each calendar event to an existing patient record so she can jump straight from "today's 2pm with J. Alvarez" to that patient's page.

## What the user needs to set up first (outside of Codex)
Walk her through this step by step, in plain language:

1. Go to https://console.cloud.google.com/apis/credentials (reuse the same Google Cloud project from `google-auth-upgrade.md` if she's already done that step, or create a new one — either is fine).
2. Enable the **Google Calendar API**: in the Cloud Console, go to "APIs & Services" → "Library", search "Google Calendar API", click Enable.
3. Create (or reuse) an **OAuth 2.0 Client ID** → Application type: Web application.
4. Add an authorized redirect URI: `http://localhost:3000/api/calendar/callback` (adjust the path to match however the app's routing ends up structured).
5. Copy the **Client ID** and **Client Secret** into `.env` as `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET` — kept as their own values, separate from any sign-in credentials, even if reusing the same Google Cloud project. Never commit `.env` to git.

## Ask before building
Confirm these with the user before writing any code:
- Does she want this to be **read-only reference** (see the schedule, click through to the matching patient) — or does she also want the app to auto-create new patient records from calendar events? **Recommend read-only reference to start** — auto-creating patient records from calendar entries risks creating duplicate or incorrect records without her reviewing them first.
- If she has more than one Google Calendar (e.g. a personal one and a separate clinic-booking one), which one should the app read?

## Steps for Codex to follow
1. Add a **"Connect Google Calendar"** action (e.g. on a new `/schedule` page) that starts an OAuth flow requesting **read-only** access only — scope `https://www.googleapis.com/auth/calendar.readonly`. Never request write access, and never create, edit, or delete anything on her actual calendar from this app.
2. Store the resulting refresh token securely — kept out of any client-side code, out of git, and treated with the same care as other secrets (see the Security baseline in `AGENTS.md`).
3. Build a `/schedule` page listing that day's (or week's) events from the connected calendar: event title, time, and any notes she's already put in the event description.
4. For each event, try to **match it to an existing patient** (fuzzy match against the patient's identifier) — but never auto-link silently. Show the proposed match and require her confirmation before treating an event as linked to a specific patient, since acting on a wrong match could surface the wrong patient's treatment/payer history next to the wrong appointment. If no match is found, offer a manual "Link to patient" action, or "This is a new patient" if appropriate.
5. Once an event is linked, clicking it takes her straight to that patient's page — or directly into "New visit" if today's appointment looks like a follow-up.
6. This integration is **read-only, always** — never write, modify, or delete anything on her real Google Calendar.

## Data the user should know about
Once connected, her calendar events (which likely include real patient names and appointment times) will be read through Google's Calendar API and a local copy will be cached in the app for display. This isn't new exposure to Google itself (she's presumably already using Google Calendar with real names for scheduling), but it does mean the app now also holds a local copy of that schedule data. Treat this cached data with the same care as other patient data: include it in the backup routine if it's stored locally, and never commit it to git.
