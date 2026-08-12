# Going live

The public site can deploy with no database — product pages are built from
content files, not queried. **The customer portal and the admin CRM cannot.**
Both read every figure they show through Prisma, so until a real Postgres is
connected `/dashboard` and `/admin` will error rather than render empty.

That is the whole reason this file exists: three things have to be true before
those two areas work on the live domain.

---

## 1. A real database

`DATABASE_URL` currently points at `localhost:5432`, which does not exist on
Vercel. Create a Supabase project and take **both** connection strings from
Project Settings → Database:

| Variable | Which string | Why |
| --- | --- | --- |
| `DATABASE_URL` | **Transaction pooler**, port `6543`, with `?pgbouncer=true&connection_limit=1` | Serverless functions open a connection per invocation. Straight to Postgres this exhausts the connection limit under any real traffic. |
| `DIRECT_URL` | **Direct connection**, port `5432` | Migrations cannot run through a transaction pooler — it does not support the statements they issue. Prisma uses this one only for `migrate`. |

Both are needed. Setting only `DATABASE_URL` looks fine until the first deploy
tries to migrate.

## 2. Schema on that database

`prisma/migrations/20260812000000_init/` is the baseline — 13 tables, 17 foreign
keys, verified by applying it to an empty database rather than assuming.

It runs automatically: `vercel-build` is `prisma migrate deploy && next build`,
and Vercel prefers that script over `build`. Nothing to do by hand, but if the
deploy fails at this step the cause is almost always a missing `DIRECT_URL`.

Seed content (categories, products) is optional:

```
npm run db:seed
```

## 3. Environment variables on Vercel

Project → Settings → Environment Variables. Everything below, for **Production**
(and Preview if you want previews to work):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase pooler string (see above) |
| `DIRECT_URL` | Supabase direct string |
| `BETTER_AUTH_SECRET` | 32+ random bytes. **Generate a new one — do not reuse the local value.** `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `BETTER_AUTH_URL` | `https://your-domain` — the live origin, no trailing slash |
| `NEXT_PUBLIC_APP_URL` | same live origin |
| `CLOUDINARY_*` | only if document upload is switched on; the app runs without them |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional — without them the Google button is not rendered at all |
| `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` | optional — see `docs/authentication.md`, Apple's secret expires every 6 months |
| `RESEND_API_KEY` / `AUTH_EMAIL_FROM` | optional, but **without them email verification is not enforced and reset links are only printed to the server log** — which nobody reads in production |

`BETTER_AUTH_URL` being wrong is the failure that looks like nothing is wrong:
sign-in appears to work locally and silently breaks the OAuth callback live.

---

## The first admin

Sign up normally on the live site. Every new account is `CUSTOMER` — the role
column cannot be set from a client, deliberately. Promote yourself once, with
SQL, in the Supabase editor:

```sql
update "User" set role = 'ADMIN' where email = 'you@souwel.com';
```

After that the CRM's own role controls handle everyone else, and no one needs
database access again.

---

## Before the domain is public

The CRM and portal pages already carry `robots: { index: false }`. The marketing
site does not — decide whether the site should be indexed **before** pointing
DNS at it, because removing pages from a search index afterwards is slow.
