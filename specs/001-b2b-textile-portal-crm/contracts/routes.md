# Contract: Routes & Access Control

**Feature**: 001-b2b-textile-portal-crm

Every route in the application, its access requirement, rendering strategy, and indexability.

## Legend

- **Access**: `public` = no session · `CUSTOMER` / `SALES` / `ADMIN` = required role
- **Render**: `SSG` static · `ISR` static + revalidate · `dynamic` per-request
- **Index**: whether search engines may index it

---

## `(marketing)` — Public Site

All routes public, statically rendered, indexable (FR-025). No pricing on any of them (FR-004).

| Route | Access | Render | Index | Notes |
|---|---|---|---|---|
| `/` | public | SSG | ✅ | Homepage — 6 spec'd sections in order (FR-007) |
| `/about` | public | SSG | ✅ | |
| `/contact` | public | SSG | ✅ | Contact form |
| `/categories/[slug]` | public | ISR | ✅ | Catalog per category; `generateStaticParams` over 4 categories (FR-002, FR-003) |
| `/products/[slug]` | public | ISR | ✅ | Detail page; gold-framed hero on white (FR-008); **no price** |
| `/quote` | public | dynamic | ❌ | Quote request cart/review — submittable without an account (FR-005) |
| `/quote/success` | public | dynamic | ❌ | Confirmation with reference number |

**Metadata**: every indexable route exports `generateMetadata` with a unique title, description, canonical URL, and OpenGraph image. `app/sitemap.ts` enumerates static pages plus all published products and categories from the DB. `app/robots.ts` allows `(marketing)` and disallows `/dashboard`, `/admin`, `/api`.

---

## `(auth)` — Authentication

| Route | Access | Render | Index | Notes |
|---|---|---|---|---|
| `/login` | public | dynamic | ❌ | Redirects by role: `CUSTOMER` → `/dashboard`, `ADMIN`/`SALES` → `/admin` |
| `/register` | public | dynamic | ❌ | Always creates `role = CUSTOMER` (FR-006); role never accepted from input |

---

## `(portal)` — Customer Portal

Layout guard: `requireRole('CUSTOMER')`. All routes `noindex`, dynamic. Every query scoped to the session's own profile (FR-013, SC-009).

| Route | Access | Notes |
|---|---|---|
| `/dashboard` | CUSTOMER | Quote status overview — all five statuses visible (FR-009) |
| `/dashboard/quotes/[id]` | CUSTOMER | Own quote only. Pricing shown once `QUOTED`. **Accept / Decline actions live here.** |
| `/dashboard/orders` | CUSTOMER | Own order history (FR-010) |
| `/dashboard/orders/[id]` | CUSTOMER | Own order detail |
| `/dashboard/documents` | CUSTOMER | Own documents; download via ownership-checked route (FR-011) |
| `/dashboard/profile` | CUSTOMER | View/update own profile (FR-012) |

**Ownership rule**: a `[id]` param is never trusted. Every detail route re-queries with `where: { id, customerProfileId: session.customerProfileId }` and renders `notFound()` on miss — so probing another customer's id is indistinguishable from a nonexistent record.

---

## `(crm)` — Internal CRM

Layout guard: `requireRole('ADMIN', 'SALES')`. All routes `noindex`, dynamic. Staff have full cross-customer visibility (no per-rep assignment).

| Route | Access | Notes |
|---|---|---|
| `/admin` | ADMIN, SALES | Dashboard: pending quotes, recent orders, activity |
| `/admin/customers` | ADMIN, SALES | Search by company/contact/email (FR-014) |
| `/admin/customers/[id]` | ADMIN, SALES | **Unified history** — profile, quotes, orders, documents, activity log, internal notes (FR-017, FR-019) |
| `/admin/quotes` | ADMIN, SALES | Queue, filterable by status |
| `/admin/quotes/[id]` | ADMIN, SALES | Price line items → `QUOTED` (FR-015); convert to order when `ACCEPTED` (FR-016) |
| `/admin/orders` | ADMIN, SALES | All orders |
| `/admin/orders/[id]` | ADMIN, SALES | Detail, status updates, document attachment |
| `/admin/products` | ADMIN, SALES | Catalog list |
| `/admin/products/new`, `/admin/products/[id]` | ADMIN, SALES | Authoring: content, images, publish state |
| `/admin/users` | **ADMIN only** | User & role management (FR-021). SALES → `403` (FR-022, SC-008) |

**Note on `/admin/users`**: the layout guard admits both staff roles, so this route re-guards with `requireAdmin()` at both the page and every underlying action. Hiding the nav link is presentation, not protection.

---

## API Route Handlers

| Route | Access | Notes |
|---|---|---|
| `ALL /api/auth/[...all]` | public | Better Auth handler |
| `POST /api/uploads/sign` | ADMIN, SALES | Cloudinary signed direct-upload params |
| `GET /api/documents/[id]/download` | session + ownership | Redirects to a ~5-min signed Cloudinary URL after verifying the caller owns the document or is staff |

---

## Middleware

`middleware.ts` provides coarse, fast redirects — **not** the security boundary:

- Unauthenticated request to `/dashboard/*` or `/admin/*` → redirect to `/login?next=...`
- Authenticated `CUSTOMER` hitting `/admin/*` → redirect to `/dashboard`
- Authenticated staff hitting `/dashboard/*` → redirect to `/admin`

Matcher excludes `/api/auth`, static assets, and the entire `(marketing)` group. Real enforcement remains in layout guards and, authoritatively, in the data layer (`research.md` §3).

---

## Access Control Test Matrix

Drives `tests/e2e/role-boundaries.spec.ts` (SC-008, SC-009).

| Actor | Target | Expected |
|---|---|---|
| Anonymous | `/`, `/about`, `/categories/*`, `/products/*`, `/quote` | ✅ 200 |
| Anonymous | `/dashboard/*`, `/admin/*` | ↪ redirect to `/login` |
| Anonymous | any pricing on any public page | ❌ never present |
| Customer A | own quote / order / document | ✅ 200 |
| Customer A | Customer B's quote / order / document | ❌ 404 |
| Customer A | `/admin/*` | ↪ redirect to `/dashboard` |
| Customer A | `GET /api/documents/{B's doc}/download` | ❌ 403 |
| Sales | all customers, quotes, orders, documents | ✅ 200 |
| Sales | `/admin/users` | ❌ 403 |
| Sales | any `user-actions.*` server action | ❌ FORBIDDEN |
| Admin | everything, including `/admin/users` | ✅ 200 |
