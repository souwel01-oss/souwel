# Implementation Plan: B2B Textile Company Website with Customer Portal & Internal CRM

**Branch**: `001-b2b-textile-portal-crm` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-b2b-textile-portal-crm/spec.md`

## Summary

A single Next.js (App Router) application serving three distinct audiences from one codebase: a statically-rendered public marketing site and product catalog with no pricing anywhere, an authenticated customer portal for tracking quotes/orders/documents, and an internal CRM for Admin and Sales staff. Quote requests are the central business object — capturable by anonymous visitors, priced by staff, accepted or declined by customers, then converted into orders.

The technical approach centers on three structural guarantees rather than policies: pricing exists only on `QuoteItem` (never on `Product`), so public price exposure is impossible by construction; authorization is enforced at the data-access layer via a `requireRole()` helper reading the Better Auth server session, so route-level bypasses cannot leak data; and customer documents are delivered through Cloudinary authenticated URLs behind a server-side ownership check, so financial documents are never reachable by URL alone.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 20+

**Primary Dependencies**: Next.js (App Router), Tailwind CSS, shadcn/ui (Radix UI), Prisma ORM, Better Auth (with `admin` plugin for roles), Cloudinary SDK, Zod (input validation)

**Storage**: PostgreSQL hosted on Supabase, accessed exclusively through Prisma. Cloudinary for binary assets (product images public; customer documents private/authenticated).

**Testing**: Vitest (unit — authorization helpers, status transitions, utilities); Playwright (E2E — role boundaries, anonymous quote flow, public no-pricing audit, responsive viewports)

**Target Platform**: Vercel (serverless/edge), Cloudflare DNS. Browsers: modern evergreen, mobile/tablet/desktop.

**Project Type**: Full-stack web application (single Next.js app; server actions replace a separate backend service)

**Performance Goals**: Public pages statically rendered with ISR; Cloudinary `f_auto,q_auto` responsive transformations; lazy-loaded video and carousel sections; Core Web Vitals in the "good" band (LCP < 2.5s, CLS < 0.1) on the homepage.

**Constraints**:
- No payment gateway or checkout flow anywhere in the system (FR-023).
- No pricing on any public/unauthenticated surface (FR-004, FR-024).
- Prisma is the only data access layer — no raw Supabase client queries for application data.
- RBAC enforced server-side only; client-side hiding is never the security boundary.
- Customer data isolation is absolute: a customer can never read another customer's records (FR-013).

**Scale/Scope**: ~20 distinct routes across three route groups; 10 core entities; 3 roles; 4 fixed product categories. Small-team B2B traffic (hundreds of customers, not consumer scale).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status: NOT APPLICABLE — no ratified constitution.**

`.specify/memory/constitution.md` is the unmodified spec-kit template: every principle, section, and governance rule is still an unfilled `[PLACEHOLDER]` token, and the version/ratification fields are unset. There are therefore no project principles to gate this design against.

**Initial check (pre-Phase 0)**: Passed vacuously — no gates defined.
**Post-design re-check (post-Phase 1)**: Passed vacuously — no gates defined. No violations to record in Complexity Tracking.

**Recommendation**: Run `/speckit-constitution` to ratify project principles before implementation begins. Given this feature's risk profile, the highest-value candidates are (1) server-side authorization as a non-negotiable boundary, (2) no pricing on public surfaces, and (3) accessibility/contrast standards for the brand palette — see `research.md` §6 for the contrast findings that a constitution would let this plan formally gate against.

## Project Structure

### Documentation (this feature)

```text
specs/001-b2b-textile-portal-crm/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── server-actions.md
│   ├── routes.md
│   └── design-tokens.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── (marketing)/                    # Public route group — SSG/ISR, indexable
│   ├── layout.tsx                  # Public shell: SiteHeader + SiteFooter
│   ├── page.tsx                    # Homepage (composes the 6 spec'd sections)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── categories/[slug]/page.tsx  # Category catalog listing
│   ├── products/[slug]/page.tsx    # Product detail (gold-framed hero, no price)
│   └── quote/
│       ├── page.tsx                # Quote request cart/review
│       └── success/page.tsx
├── (portal)/                       # Customer portal — auth required, noindex
│   ├── layout.tsx                  # Guards: session + role CUSTOMER
│   └── dashboard/
│       ├── page.tsx                # Quote status overview
│       ├── quotes/[id]/page.tsx    # Detail + accept/decline action
│       ├── orders/page.tsx
│       ├── documents/page.tsx
│       └── profile/page.tsx
├── (crm)/                          # Internal CRM — auth + ADMIN|SALES, noindex
│   ├── layout.tsx                  # Guards: session + role ADMIN|SALES
│   └── admin/
│       ├── page.tsx                # CRM dashboard
│       ├── customers/
│       │   ├── page.tsx            # Search/list
│       │   └── [id]/page.tsx       # Unified history: profile/quotes/orders/docs/log/notes
│       ├── quotes/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx       # Price & respond; convert to order
│       ├── orders/[id]/page.tsx
│       ├── products/               # Catalog authoring
│       └── users/page.tsx          # ADMIN ONLY — user & role management
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── api/
│   ├── auth/[...all]/route.ts      # Better Auth handler
│   ├── documents/[id]/download/route.ts  # Ownership check → signed Cloudinary URL
│   └── uploads/sign/route.ts       # Signed direct-upload params (staff only)
├── sitemap.ts                      # Generated from DB (public content only)
├── robots.ts
├── layout.tsx                      # Root layout, fonts, theme vars
└── globals.css                     # Tailwind + shadcn CSS variables

components/
├── ui/                             # shadcn/ui primitives (button, card, table, dialog…)
├── marketing/                      # Homepage sections — one component each
│   ├── Hero.tsx
│   ├── ContentShowcaseGrid.tsx
│   ├── CategoryCarousel.tsx
│   ├── VideoSection.tsx
│   ├── CoverageMap.tsx
│   ├── SiteHeader.tsx
│   └── SiteFooter.tsx
├── catalog/                        # ProductCard, CategoryCard, ProductGallery
├── quote/                          # QuoteCart, QuoteRequestForm, QuoteStatusBadge
├── portal/                         # Customer dashboard widgets
├── crm/                            # DataTable, CustomerHistoryTabs, InternalNotes…
└── shared/                         # Cross-area: PageHeader, EmptyState, FileUpload

lib/
├── auth/
│   ├── auth.ts                     # Better Auth server instance (Prisma adapter)
│   ├── client.ts                   # Better Auth client
│   └── guards.ts                   # requireSession(), requireRole() — THE boundary
├── db/
│   ├── prisma.ts                   # Singleton client
│   ├── public.ts                   # ONLY queries the public group may call (no price)
│   ├── quotes.ts
│   ├── orders.ts
│   ├── customers.ts
│   ├── documents.ts
│   └── activity.ts                 # logActivity() — in-transaction, append-only
├── actions/                        # Server actions (all call requireRole first)
│   ├── quote-actions.ts
│   ├── order-actions.ts
│   ├── document-actions.ts
│   ├── customer-actions.ts
│   └── user-actions.ts             # ADMIN only
├── cloudinary/
│   ├── client.ts
│   ├── sign-upload.ts
│   └── signed-url.ts               # Short-lived authenticated delivery URLs
├── validation/                     # Zod schemas per entity
└── utils/

prisma/
├── schema.prisma
├── migrations/
└── seed.ts                         # 4 categories, sample products, test users

tests/
├── unit/                           # Vitest — guards, status transitions, validators
└── e2e/                            # Playwright
    ├── public-no-pricing.spec.ts   # SC-003
    ├── anonymous-quote.spec.ts     # SC-001
    ├── role-boundaries.spec.ts     # SC-008, SC-009
    └── responsive.spec.ts          # SC-007

middleware.ts                       # Coarse route-group auth redirect (UX layer)
tailwind.config.ts                  # Brand palette + semantic tokens
```

**Structure Decision**: Single Next.js application using App Router **route groups** — `(marketing)`, `(portal)`, `(crm)`, `(auth)` — rather than separate frontend/backend projects. Server actions and route handlers serve as the backend, so no separate API service is warranted. Route groups give each audience its own layout and guard boundary while sharing one component library and one Prisma layer, satisfying both the "separate route structure" and "reusable component library shared across all three areas" requirements from the technical brief.

The `lib/db/public.ts` split is deliberate and load-bearing: it is the only data module the `(marketing)` group imports, and it never selects pricing fields. Combined with pricing living solely on `QuoteItem`, this makes FR-004/FR-024 a structural property rather than a review checklist item.

## Complexity Tracking

> No Constitution Check violations — no constitution is ratified, so there are no gates to violate and nothing requiring justification here.
