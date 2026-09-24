# remote-access-setup.md

This is a **follow-up, optional** guide — only use it when the user explicitly asks to access the app from somewhere other than the computer it's running on. Her actual situation: a Mac at home (runs the app via Docker) and a Mac at her office — she wants the office Mac to reach the app running on the home Mac. It is independent of the other optional upgrades in this folder.

## The decision: do not use port forwarding + free dynamic DNS
A common old-school approach is a free dynamic DNS service (DuckDNS, No-IP, etc.) plus forwarding a port on the home router so the app is reachable from the public internet. **Do not set this up for this app.** It directly exposes a system holding real patient health data to the entire public internet — even behind a password, this meaningfully increases the attack surface (automated scanners, brute-force attempts, and any future vulnerability in the stack become exploitable by anyone, not just the user). This tradeoff is not worth it for what the user needs.

## Recommended approach: Tailscale
Tailscale (free for personal use, up to 100 devices) creates a private, encrypted network between only the user's own devices. The app is never exposed to the public internet at all — no port forwarding, no public DNS record, no open attack surface. Only devices she's personally signed into her Tailscale account on can reach it. This is both the safest option for real patient data and the simplest for someone with no technical background.

### Steps for Codex to walk the user through
1. **On the home Mac** (the one running `docker compose up`): install Tailscale from tailscale.com/download, sign in with a Google or email account (a personal account is fine for solo use).
2. **On the office Mac**: install Tailscale the same way, and sign in with the *exact same* account — this is what puts both Macs on the same private network.
3. Once both are signed in, Tailscale gives the home Mac a private address (something like `100.x.x.x`, or a name like `home-mac.tailnet-name.ts.net`, visible in the Tailscale app's device list on either machine) that's reachable only from her other signed-in devices — from the office, or anywhere else, not just the same home WiFi.
4. **Adjust the Docker setup for this case**: the existing rule (Phase 6, Security baseline) is to bind the app only to `localhost` so other devices on the same WiFi can't reach it. For the office Mac to reach it, the home Mac's app needs to listen on the network interface rather than only `localhost` — but this is still safe, because Tailscale's private network is the actual boundary here, not the bind address. Bind to `0.0.0.0` (or the specific Tailscale interface if that's straightforward to target) **only after Tailscale is installed and confirmed working on both Macs**, and explain this tradeoff to the user in plain terms: "this makes the app reachable from your office Mac specifically, not from the general internet or even your home WiFi."
5. Test from the office Mac: open a browser and go to `http://<home-mac's-tailscale-address>:3000` (or whichever port). She should see the same login page as usual.
6. The regular password gate (or Google Sign-In, if she's adopted that upgrade) still applies on top of this — Tailscale controls *which devices* can reach the app at all; the login still controls *who* can use it once reached.

## What to tell the user, in plain language
- Tailscale is free for her use case (two personal Macs).
- Nothing changes about how she uses the app day to day — from the office Mac she opens the same kind of link, just pointed at the home Mac's Tailscale address instead of `localhost`.
- **The home Mac has to actually be on, awake, and connected to the internet** for this to work — if it's asleep or shut down, the office Mac won't be able to reach it. Two things matter here:
  - Docker's `restart: unless-stopped` policy (below) means the app comes back automatically if the home Mac restarts, but the Mac still has to be powered on.
  - macOS will let a laptop go to sleep even when plugged in unless told otherwise. If she wants this to work reliably while she's away, go to System Settings → Battery/Energy → and enable "Prevent automatic sleeping when the display is off" (wording varies slightly by macOS version) on the home Mac, or keep it plugged in with the lid open. Explain this plainly rather than assuming she'll figure it out — a sleeping home Mac is the single most likely reason remote access "stops working."
- If she stops wanting remote access, she can just disconnect or uninstall Tailscale from either Mac — no other cleanup needed.

## Two more security steps to set up alongside this
Tailscale secures the *connection* between her two Macs, but two other things are outside what it protects, and matter once real patient data is involved:
- **Turn on two-factor authentication on the Google (or email) account she used to sign into Tailscale.** If that account's password were ever compromised, 2FA is what stops someone else from adding their own device to her private network. Walk her through this in her Google Account security settings if she hasn't already got 2FA on.
- **Make sure both Macs have a lock-screen password and FileVault disk encryption turned on** (System Settings → Privacy & Security → FileVault). Tailscale protects the network connection, not a lost or stolen laptop — if either Mac were physically taken and had no lock screen or disk encryption, patient data on it would be exposed regardless of how well the network side is secured. Check with the user whether these are already on, and walk her through enabling them if not.

## Keeping the app available when she's not at the computer
For remote access to be reliable, the app should keep running even if the computer restarts (e.g. after an update) — she shouldn't have to manually reopen a terminal and run `docker compose up` after every restart. Set the Docker service's restart policy to `restart: unless-stopped` in `docker-compose.yml` as part of this upgrade, so Docker automatically brings the app back up after a restart, and explain this change to her in one sentence.
