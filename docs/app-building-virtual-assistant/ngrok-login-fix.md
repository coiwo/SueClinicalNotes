# Fix: login fails over ngrok (请求来源不正确)

Project: `sue-clinical-notes` (local dev server on port 3000)

## Goal
Let Sue use the app through the ngrok URL while keeping the origin check as CSRF protection.

- Local: `http://localhost:3000`
- Public: `https://punisher-swampland-jovial.ngrok-free.dev`

## Symptom
- Login works at `http://localhost:3000/login`.
- Login fails at `https://punisher-swampland-jovial.ngrok-free.dev/login`.
- The login request returns `{"error":"请求来源不正确，请从本机页面操作。"}` ("Request origin is incorrect, please operate from the local page").

## Root cause
The server validates the request origin (likely the `Origin` header, possibly `Host` or `Referer`) and accepts only `http://localhost:3000`. Through ngrok, the browser sends `Origin: https://punisher-swampland-jovial.ngrok-free.dev`, so the check rejects the request.

## Fix
1. Find the check:
   ```bash
   grep -rn "请求来源不正确" . --exclude-dir=node_modules
   ```
   Also look for any other place the same logic is duplicated, such as other API routes or middleware.
2. Replace the hardcoded localhost comparison with an allowlist read from an env var. Keep localhost as the default:
   ```js
   const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
     .split(',')
     .map(s => s.trim())
     .filter(Boolean);

   if (!allowedOrigins.includes(req.headers.origin)) {
     // keep the existing 请求来源不正确 response
   }
   ```
   If the check uses `Host` or `Referer` instead, apply the same allowlist idea to that header. Do not remove the check.
3. Add this to `.env`:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,https://punisher-swampland-jovial.ngrok-free.dev
   ```
   Origins must match exactly: include `https://` and no trailing slash.
4. Check for other localhost assumptions that break behind ngrok, and fix any you find:
   - API base URLs hardcoded to `http://localhost:3000` in frontend code or env (use relative paths).
   - Auth config such as `NEXTAUTH_URL`.
   - Cookies set with `domain: "localhost"`. Cookies should work on HTTPS, so consider `secure` when the request is HTTPS.
   - Dev-server host allowlists (Vite `server.allowedHosts`, Next.js `allowedDevOrigins`).
5. Restart the app.

## Acceptance check
- Login works at `http://localhost:3000/login`.
- Login works at `https://punisher-swampland-jovial.ngrok-free.dev/login`.
- A request with any other `Origin` still gets the 请求来源不正确 error:
  ```bash
  curl -i -X POST http://localhost:3000/<login-endpoint> \
    -H "Origin: https://evil.example" -H "Content-Type: application/json" \
    -d '{"password":"x"}'
  ```

## Environment notes
- Start the tunnel with basic auth, using a real password:
  `ngrok http 3000 --basic-auth "sue:<password>"`
- If the app itself uses an `Authorization: Bearer` header, it will conflict with ngrok basic auth. Check this if you see 401s from ngrok.
- A launchd agent (`~/Library/LaunchAgents/com.ngrok.plist`) runs `ngrok http 5678` and holds the free domain. It is currently unloaded with `launchctl bootout` but will load again at login.
- Security: the app login password was exposed in chat. Change it after the fix.
