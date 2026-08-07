# Quickstart & Validation Guide

**Feature**: 001-b2b-textile-portal-crm

How to run the project locally and verify each success criterion from the spec. This is a validation guide — implementation detail lives in `tasks.md`.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node 20+ | |
| pnpm (or npm) | |
| Supabase project | PostgreSQL connection string (pooled + direct) |
| Cloudinary account | Cloud name, API key, API secret |
| Vercel account | Deployment (not needed for local dev) |

---

## Environment Variables

`.env.local` — never committed. Mirror these into Vercel project settings for deploys.

```bash
# Database (Supabase)
DATABASE_URL=              # Pooled connection (app runtime)
DIRECT_URL=                # Direct connection (migrations)

# Better Auth
BETTER_AUTH_SECRET=        # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `CLOUDINARY_API_SECRET` and `BETTER_AUTH_SECRET` are server-only. Never prefix them with `NEXT_PUBLIC_`.

---

## Setup

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev        # Creates schema in Supabase
pnpm prisma db seed            # 4 categories, sample products, test users
pnpm dev                       # http://localhost:3000
```

### Seeded test accounts

| Role | Email | Purpose |
|---|---|---|
| Admin | `admin@example.test` | Full access incl. user management |
| Sales | `sales@example.test` | CRM without user management |
| Customer A | `customer-a@example.test` | Owns seeded quotes/orders |
| Customer B | `customer-b@example.test` | Used to prove cross-customer isolation |

---

## Validation Scenarios

Each maps to a success criterion in [spec.md](./spec.md). Entity and permission details are in [data-model.md](./data-model.md); route access in [contracts/routes.md](./contracts/routes.md).

### V1 — Anonymous quote request (SC-001)

1. Open `/` logged out.
2. Navigate to a category → open a product.
3. Add it to a quote request; add a second product from another category.
4. Submit with guest contact details.

**Expected**: confirmation page with a quote reference. No account required. No price shown at any step. Quote appears in `/admin/quotes` with status `REQUESTED` and null pricing.

### V2 — Public no-pricing audit (SC-003)

Crawl every public route (`/`, `/about`, `/contact`, `/categories/*`, `/products/*`, `/quote`) logged out and scan rendered HTML for currency symbols, price-like patterns, and the strings `price`/`cost`/`total`.

**Expected**: zero matches. Automated as `tests/e2e/public-no-pricing.spec.ts`.

### V3 — Staff quote response (SC-002)

1. Log in as Sales → `/admin/quotes` → open the `REQUESTED` quote from V1.
2. Enter a unit price per line item, add a response, save.

**Expected**: status → `QUOTED`; `quotedAt` stamped; `ActivityLog(QUOTE_RESPONDED)` written; pricing visible in CRM and to the owning customer only.

### V4 — Customer portal & accept/decline (SC-004)

1. Log in as Customer A → `/dashboard`.
2. Confirm quote statuses are visible within 2 clicks.
3. Open a `QUOTED` quote → Accept.

**Expected**: pricing visible now that status is `QUOTED`; Accept moves it to `ACCEPTED`; `ActivityLog(QUOTE_ACCEPTED)` written.

### V5 — Quote → order conversion (FR-016)

1. As Sales, open the `ACCEPTED` quote → Convert to Order.
2. Then attempt conversion on a `REQUESTED` and a `DECLINED` quote.

**Expected**: first succeeds with a snapshotted `totalAmount` and `ActivityLog(ORDER_CREATED)`. The latter two are rejected with `CONFLICT` — conversion is only legal from `ACCEPTED`.

### V6 — Document upload & private download (SC-005)

1. As Sales, upload a PDF against Customer A's order.
2. As Customer A, open `/dashboard/documents` and download it.
3. As Customer B, request Customer A's document id directly:
   `GET /api/documents/{id}/download`.

**Expected**: A downloads via a short-lived signed URL. B receives `403`. The raw Cloudinary URL never appears in any response body or page source.

### V7 — Role boundaries (SC-008, SC-009)

| Attempt | Expected |
|---|---|
| Sales → `/admin/users` | `403` |
| Sales → any `user-actions` server action | `FORBIDDEN` |
| Customer A → Customer B's quote/order/document URL | `404` |
| Customer A → `/admin/*` | redirect to `/dashboard` |
| Anonymous → `/dashboard/*` or `/admin/*` | redirect to `/login` |
| Admin → `/admin/users` | `200` |

Automated as `tests/e2e/role-boundaries.spec.ts`. **Run these against server actions directly, not just through the UI** — hidden nav links are not proof of protection.

### V8 — Customer history (SC-006)

As Sales, search a customer by company name → open their record.

**Expected**: one view containing profile, all quotes, all orders, all documents, chronological activity log, and internal notes. Add an internal note; confirm it saves, appears in the log, and is **absent** from Customer A's portal.

### V9 — Responsive layout (SC-007)

Check at 375px (mobile), 768px (tablet), 1440px (desktop): homepage (all six sections), category carousel, `/dashboard`, `/admin`.

**Expected**: layouts match the table in [contracts/design-tokens.md](./contracts/design-tokens.md). No horizontal page scroll at any width. Carousel is swipeable on mobile and arrow-driven on desktop.

### V10 — SEO (FR-025)

```bash
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
curl -s http://localhost:3000/products/{slug} | grep -i "<title>\|og:"
```

**Expected**: sitemap lists all published products/categories; robots disallows `/dashboard`, `/admin`, `/api`; product HTML contains a unique title, meta description, canonical, and OG tags in the server response (not client-injected).

---

## Test Commands

```bash
pnpm test              # Vitest — guards, status transitions, validators
pnpm test:e2e          # Playwright — full validation suite above
pnpm lint
pnpm typecheck
pnpm build             # Verify static generation of public routes
```

---

## Pre-Deploy Checklist

- [ ] All V1–V10 scenarios pass
- [ ] `pnpm build` emits public routes as static/ISR (not dynamic)
- [ ] Env vars set in Vercel; no secret carries a `NEXT_PUBLIC_` prefix
- [ ] Cloudinary document uploads use `type: authenticated`, product images public
- [ ] Cloudflare DNS points to Vercel; HTTPS enforced
- [ ] `prisma migrate deploy` runs against production
- [ ] `robots.txt` disallows portal, CRM, and API routes
- [ ] No pricing on any public route (V2 green)
