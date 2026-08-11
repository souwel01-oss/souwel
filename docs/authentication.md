# Authentication & accounts

Customer sign-in, the account area, and the light/dark theme.
Stack: **Better Auth** → **Prisma** → **PostgreSQL**.

---

## What you must fill in

Everything below lives in `.env.local` (copy from `.env.example`). Nothing here
is hard-coded and no credential is committed.

| Variable | Needed for | If missing |
| --- | --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | everything | sign-in fails; the public site still renders |
| `BETTER_AUTH_SECRET` | signing sessions | auth routes throw at start-up |
| `BETTER_AUTH_URL` | OAuth callbacks | same |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | "Continue with Google" | **the Google button is not rendered** |
| `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` | "Continue with Apple" | **the Apple button is not rendered** |
| `RESEND_API_KEY`, `AUTH_EMAIL_FROM` | verification + reset emails | links are printed to the server console, and email verification is not enforced |

A provider with no credentials is **not registered at all**, so its button never
appears. That is deliberate: a "Continue with Google" button that dead-ends on a
redirect error is worse than no button.

### Google

1. <https://console.cloud.google.com> → APIs & Services → Credentials
2. Create OAuth client ID → **Web application**
3. Authorised redirect URIs — one line per environment:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-DOMAIN/api/auth/callback/google`

### Apple — read this before you start

Apple is not like Google, in three ways that matter:

- **`APPLE_CLIENT_ID` is a Services ID**, not the App ID. Create the App ID
  first (enable "Sign in with Apple"), then a **Services ID** — that identifier
  (e.g. `com.souwel.web`) is what goes in the variable.
- **`APPLE_CLIENT_SECRET` is not a password.** Apple never shows you one. You
  download a `.p8` private key and sign an **ES256 JWT** yourself. Apple caps
  its lifetime at **six months**, so this variable has to be regenerated on a
  schedule — put it in a calendar. When it expires, Apple sign-in starts failing
  and nothing else does.
- **Apple requires HTTPS** for the return URL, so this provider cannot be tested
  on `http://localhost`. Use a preview deployment.

### Email

Verification and password reset are fully implemented; only the transport is
pluggable. With `RESEND_API_KEY` + `AUTH_EMAIL_FROM` set, mail is sent for real.
Without them, the link is printed to the terminal running the server — which is
how to test the flows today:

```
────────────────────────────────────────────────────────────
  EMAIL NOT SENT — no transport configured (Verify email)
  to:      you@company.com
  link:    http://localhost:3000/api/auth/verify-email?token=…
────────────────────────────────────────────────────────────
```

`requireEmailVerification` is tied to whether a transport exists. Hard-coding it
to `true` on a site that cannot send email would lock every new customer out of
the account they just created.

---

## Roles

| | Sales | Admin |
| --- | :---: | :---: |
| View users, leads, quotes, orders | ✅ | ✅ |
| Change a quote or lead status | ✅ | ✅ |
| Export users and leads to Excel | ✅ | ✅ |
| Change a user's role | — | ✅ |
| Activate / deactivate an account | — | ✅ |

Sales cannot grant roles **including to itself** — a Sales account that can
promote itself to Admin is not a Sales account. An Admin also cannot change
their own role or deactivate their own account: if they were the last Admin,
the controls become unreachable by anyone and the only fix is raw SQL.

Deactivating an account deletes its sessions, so the person is signed out
immediately rather than whenever their cookie happens to expire.

The live readout of who can do what is at **/admin/settings**.

---

## How access control works

Two layers, and only one of them is a security boundary.

| Layer | File | What it does |
| --- | --- | --- |
| Middleware | `middleware.ts` | Checks a session cookie is **present**. Redirects with the intended path in `?next=`. **Not a security check** — it never validates the cookie. |
| Server guard | `app/(portal)/layout.tsx`, `app/(crm)/layout.tsx` | Verifies the session against the store via `requireUser` / `requireRole`. **This is the boundary for pages.** |
| Action guard | every function in `app/(crm)/actions.ts` | `getStaffUser()` / `getAdminUser()` on every call. **This is the boundary for mutations.** |

A forged or expired cookie passes the middleware and is rejected by the layout.

The third row is not belt-and-braces. A Server Action is its own public POST
endpoint with a stable id — the layout guard decides who can *see* a button,
and nothing more. Anyone who has loaded the bundle once can call these for as
long as their session lasts, so the action checks for itself. Same for
`/admin/export`, which is a Route Handler: a URL that returns the entire
customer list as a spreadsheet.

Other invariants worth knowing:

- **`role` cannot be set by a client.** It is declared `input: false` in
  `lib/auth/index.ts`, so `POST /api/auth/sign-up/email` with `{"role":"ADMIN"}`
  is ignored. The database column defaults to `CUSTOMER` as a second guarantee.
- **`getSessionUser()` fails closed.** If the session store is unreachable it
  returns `null`, so an outage redirects to sign-in rather than granting access.
- **`?next=` is sanitised** (`lib/auth/redirect.ts`) against open redirects —
  absolute URLs, `//evil.com`, backslash and control-character variants.
- **Portal queries are scoped by `userId` from the session**, never by an id
  from the URL (`lib/db/portal.ts`).

---

## Theme

`next-themes` with `attribute="class"`, stored under `souwel-theme`, defaulting
to `system`. The dark palette is a re-weighting of the brand colours, not an
inversion — blue and gold are lifted so they hold up on a near-black ground, and
surfaces get *lighter* with elevation.

Contrast was measured, not eyeballed: body 16.8:1, muted 10.2:1, primary fill
6.8:1, gold on card 8.4:1.

One thing to know if you touch the tokens: **`--primary` is not the button
fill.** White on raw brand blue `#0b97ff` is 3.05:1 and fails AA for button
text, so solid CTAs use `--primary-strong` (`#0668b3` light / `#4fb3ff` dark).
`--primary` stays the brand blue for rings, links and accents.

---

## Files

```
lib/auth/index.ts        Better Auth server instance (server only)
lib/auth/client.ts       browser client
lib/auth/session.ts      getSessionUser / requireUser / requireRole
lib/auth/redirect.ts     ?next= open-redirect guard
lib/auth/email.ts        transactional email + console fallback
lib/auth/user.ts         pure helpers, safe on both sides
lib/db/portal.ts         customer-scoped reads
middleware.ts            optimistic cookie gate
app/api/auth/[...all]/   Better Auth's own endpoints
app/(auth)/              login, register, forgot-password, reset-password
app/(portal)/            dashboard, account, orders — behind the guard
```
