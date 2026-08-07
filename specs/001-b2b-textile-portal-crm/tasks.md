---
description: "Task list for B2B Textile Portal & CRM implementation"
---

# Tasks: B2B Textile Company Website with Customer Portal & Internal CRM

**Input**: Design documents from `/specs/001-b2b-textile-portal-crm/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Included. The plan defines a Vitest + Playwright strategy, and [quickstart.md](./quickstart.md) defines validation scenarios V1–V10 that map directly to the spec's mandatory Success Criteria. Test tasks are scoped to the highest-risk guarantees (role isolation, no-public-pricing, responsive) rather than blanket coverage.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to a spec user story (US1–US6) for traceability
- Exact file paths included in every task

## Phase Ordering Note

Phases below follow the **delivery order requested by the user** (foundation → homepage → public site → auth/portal → CRM), which is design-first to enable early client sign-off on the approved homepage layout.

This differs from the spec's story priorities. The mapping:

| Delivery Phase | Spec User Stories | Note |
|---|---|---|
| Phase 1 — Foundation | — | Setup + foundational |
| Phase 2 — Homepage | US1 (partial) | FR-007 homepage layout |
| Phase 3 — Public site | US1 (complete) | P1 story finishes here |
| Phase 4 — Auth & Portal | US3, US6 (partial) | |
| Phase 5 — Admin CRM | US2, US4, US5, US6 | |

⚠️ **Trade-off to be aware of**: the spec's P2 story (staff respond to quotes) lands in Phase 5. Between Phase 3 and Phase 5, quote requests are captured but cannot be responded to in-app. If the client needs a working end-to-end sales loop sooner, pull T068–T070 forward immediately after Phase 4.

---

## Phase 1: Foundation & Local Setup

**Purpose**: A running, viewable Next.js app with the brand theme configured and the database schema in place — before any feature work.

- [X] T001 Initialize Next.js project with TypeScript and App Router at repository root (`package.json`, `tsconfig.json`, `next.config.ts`). **Done when**: `npm run dev` serves a page at `http://localhost:3000`.
- [X] T002 [P] Configure ESLint + Prettier with Tailwind class sorting in `.eslintrc.json` and `.prettierrc`. **Done when**: `npm run lint` passes on a clean tree.
- [X] T003 Install and configure Tailwind CSS in `tailwind.config.ts` and `app/globals.css`. **Done when**: a Tailwind utility class visibly styles the default page.
- [X] T004 Define the full 13-color brand palette in `tailwind.config.ts` per [contracts/design-tokens.md](./contracts/design-tokens.md) (`primary`, `accent-yellow`, `accent-gold`, `navy`, `ivory`, `platinum`, `champagne`, `burgundy`, `maroon`, `olive`, `cognac`, `forest`, `oxblood`). **Done when**: `bg-navy`, `text-ivory`, `border-accent-gold` all render the exact specified hex values.
- [X] T005 Define semantic CSS variables (`--background`, `--foreground`, `--primary`, `--premium`, `--destructive`, `--ring`, etc.) mapped to brand colors in `app/globals.css` per the design-tokens contract. **Done when**: shadcn components inherit ivory/navy theming without per-component overrides.
- [X] T006 Initialize shadcn/ui wired to the semantic variables from T005 (`components.json`). **Done when**: `npx shadcn add button` installs into `components/ui/` and renders with brand primary blue.
- [X] T007 [P] Install base shadcn/ui primitives into `components/ui/`: button, card, input, label, form, table, dialog, dropdown-menu, badge, select, textarea, tabs, sheet, sonner. **Done when**: each imports without type errors.
- [X] T008 Create the route-group folder structure with placeholder pages: `app/(marketing)/`, `app/(portal)/dashboard/`, `app/(crm)/admin/`, `app/(auth)/`. **Done when**: `/`, `/dashboard`, `/admin` each render a distinct placeholder heading.
- [X] T009 Build the root layout in `app/layout.tsx` with font loading (display serif for marketing, system sans for dashboards) and `<html>` theme class. **Done when**: fonts load without layout shift and ivory background applies globally.
- [X] T010 [P] Create `.env.example` and a typed env accessor in `lib/env.ts` covering `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLOUDINARY_*`, `NEXT_PUBLIC_APP_URL` per [quickstart.md](./quickstart.md). **Done when**: a missing required var fails fast at startup with a clear message.
- [X] T011 Install Prisma and initialize `prisma/schema.prisma` with the PostgreSQL provider and Supabase pooled + direct URLs. **Done when**: `npx prisma validate` passes.
- [X] T012 Write the complete Prisma schema in `prisma/schema.prisma` — models `User`, `CustomerProfile`, `Category`, `Product`, `Quote`, `QuoteItem`, `Order`, `Document`, `ActivityLog`, `InternalNote` and enums `Role`, `QuoteStatus`, `OrderStatus`, `DocumentType`, `ActivityAction` — exactly per [data-model.md](./data-model.md). **Done when**: `Product` has no price field of any kind, and `npx prisma validate` passes.
- [ ] T013 Add the indexes listed in data-model.md §Indexes to `prisma/schema.prisma`, then run the initial migration against Supabase. **Done when**: `npx prisma migrate dev` succeeds and tables exist in the Supabase dashboard.
- [X] T014 [P] Create the Prisma client singleton in `lib/db/prisma.ts` (guarded against hot-reload connection exhaustion). **Done when**: repeated dev-server reloads do not exhaust the connection pool.
- [X] T015 Write `prisma/seed.ts` seeding the 4 fixed categories, ~8 sample products with placeholder Cloudinary images, and the 4 test users from quickstart.md (admin, sales, customer-a, customer-b). **Done when**: `npx prisma db seed` populates all tables and is safely re-runnable.
- [X] T016 Verify the foundation end to end. **Done when**: `npm run dev` serves `/`, `/dashboard`, `/admin` placeholders; `npm run build` succeeds; seeded categories are queryable via Prisma Studio.

**Checkpoint**: App runs locally with brand theme and database schema in place. Homepage work can begin.

---

## Phase 2: Homepage Design (US1 — partial)

**Goal**: Deliver the client-approved homepage layout (FR-007) with exact brand palette usage, fully responsive.

**Independent Test**: Load `/` at 375px, 768px, and 1280px — all six sections render in the specified order, use the brand palette, and produce no horizontal page scroll.

- [X] T017 [P] [US1] Build `components/marketing/SiteHeader.tsx` — logo, nav links (Hospitality, Health-Care, Institutional/Laundry, Commercial/Automotive, About, Contact Us), Register link, mobile drawer. **Done when**: renders on the dark navy background, and the mobile drawer opens/closes at < 640px.
- [X] T018 [US1] Build `components/marketing/Hero.tsx` — dark navy background, hero heading, short intro text, "Get Started" CTA in primary blue with white text. **Done when**: CTA meets ≥ 16px semibold white-on-primary per the design-tokens contrast rule; stacks on mobile, side-by-side on desktop.
- [X] T019 [P] [US1] Build `components/marketing/ContentShowcaseGrid.tsx` — intro line above a grid of visual tiles, each linking to a category or catalog page. **Done when**: 1 column at mobile / 2 at tablet / 3–4 at desktop, and every tile navigates correctly.
- [X] T020 [US1] Build `components/marketing/CategoryCarousel.tsx` — horizontally scrollable, one card per category, prev/next arrow controls. **Done when**: swipeable on touch, arrow-driven on desktop, keyboard-navigable, and arrows disable at the ends.
- [X] T021 [P] [US1] Build `components/marketing/VideoSection.tsx` — two side-by-side video placeholders (company overview, manufacturing process) with lazy loading. **Done when**: videos stack vertically below 1024px and load only when scrolled into view.
- [X] T022 [P] [US1] Build `components/marketing/CoverageMap.tsx` — descriptive text beside a map graphic placeholder. **Done when**: text sits above the map on mobile/tablet and beside it on desktop.
- [X] T023 [P] [US1] Build `components/marketing/SiteFooter.tsx` — logo, company blurb, and link columns for Categories, Useful Links, Manufacturing. **Done when**: columns collapse to an accordion on mobile, 2 at tablet, 4 at desktop.
- [X] T024 [US1] Create `app/(marketing)/layout.tsx` composing SiteHeader + SiteFooter around page content. **Done when**: header and footer appear on every marketing route.
- [X] T025 [US1] Assemble `app/(marketing)/page.tsx` from the six sections in the exact spec order: Hero → ContentShowcaseGrid → CategoryCarousel → VideoSection → CoverageMap → Footer. **Done when**: section order matches FR-007 exactly.
- [X] T026 [US1] Apply the palette usage rules from [contracts/design-tokens.md](./contracts/design-tokens.md) across all homepage sections. **Done when**: ivory/navy form the base, primary blue is the only interactive fill, gold/burgundy appear only as premium accents, and jewel tones appear only as supporting decoration.
- [X] T027 [US1] Add homepage metadata in `app/(marketing)/page.tsx` via `generateMetadata` — title, description, canonical, OpenGraph. **Done when**: `curl` of `/` shows the tags server-rendered, not client-injected.
- [X] T028 [US1] Run a contrast audit against the design-tokens accessibility table. **Done when**: no text uses `accent-gold` or `accent-yellow` as a foreground color, inline links use the darkened `#0668B3` variant, and all focus rings are visible.
- [X] T029 [US1] Verify homepage responsiveness at 375px / 768px / 1280px. **Done when**: all six sections match the responsive matrix in the design-tokens contract, with zero horizontal page scroll at any width.

**Checkpoint**: Homepage is demo-ready for client sign-off on local dev.

---

## Phase 3: Remaining Public Site (US1 — complete)

**Goal**: Complete the P1 story — full catalog browsing and quote submission without an account, with no pricing anywhere.

**Independent Test**: As an anonymous visitor, browse a category → open a product → add 2 products to a quote → submit with guest details → receive a reference number. No price appears at any step.

- [ ] T030 [US1] Create `lib/db/public.ts` with `getCategories`, `getCategoryBySlug`, `getPublishedProducts`, `getProductBySlug`, `getProductsForSitemap` per [contracts/server-actions.md](./contracts/server-actions.md). **Done when**: every query uses an explicit `select`, none reference pricing fields, and all filter `isPublished = true`.
- [ ] T031 [P] [US1] Build `app/(marketing)/about/page.tsx` with company profile content and metadata. **Done when**: statically rendered and indexable.
- [ ] T032 [P] [US1] Build `app/(marketing)/contact/page.tsx` with a contact form and validation. **Done when**: submission succeeds with a confirmation and validation errors render inline.
- [ ] T033 [P] [US1] Build `components/catalog/ProductCard.tsx` and `components/catalog/CategoryCard.tsx`. **Done when**: neither component accepts or renders a price prop.
- [ ] T034 [US1] Build `app/(marketing)/categories/[slug]/page.tsx` with `generateStaticParams` over the 4 categories and ISR. **Done when**: all 4 category pages statically generate and list only published products.
- [ ] T035 [US1] Build `app/(marketing)/products/[slug]/page.tsx` — hero image on white background with a thin gold frame (FR-008), description, specifications, gallery. **Done when**: the gold frame renders per the design-tokens product treatment and no price is present in the page source.
- [ ] T036 [US1] Add per-product and per-category `generateMetadata` for SEO. **Done when**: each page has a unique title, description, canonical, and OG image in the server response.
- [ ] T037 [US1] Build quote cart state in `components/quote/QuoteCart.tsx` with client-side persistence. **Done when**: products from multiple categories can be added, quantities edited, items removed, and the cart survives a page reload.
- [ ] T038 [US1] Add an "Add to Quote" control to the product detail page wired to the cart. **Done when**: adding gives visible feedback and increments the cart count.
- [ ] T039 [US1] Build `app/(marketing)/quote/page.tsx` — review items, per-item notes/quantity, guest contact fields, message. **Done when**: guest fields are required when logged out and hidden when a customer session exists.
- [ ] T040 [US1] Implement `submitQuoteRequest` in `lib/actions/quote-actions.ts` with a Zod schema per the server-actions contract. **Done when**: anonymous submissions persist guest contact on the `Quote`, authenticated ones link `customerProfileId`, all `QuoteItem` prices are null, and status is `REQUESTED`.
- [ ] T041 [US1] Build `app/(marketing)/quote/success/page.tsx` displaying the quote reference. **Done when**: the reference matches the persisted `Quote.reference`.
- [ ] T042 [P] [US1] Create `app/sitemap.ts` and `app/robots.ts` generated from the database. **Done when**: sitemap lists all published products/categories and robots disallows `/dashboard`, `/admin`, `/api`.
- [ ] T043 [P] [US1] Write `tests/e2e/public-no-pricing.spec.ts` — crawl every public route and scan for currency symbols and price-like patterns (SC-003). **Done when**: the test passes with zero matches across all public routes.
- [ ] T044 [P] [US1] Write `tests/e2e/anonymous-quote.spec.ts` covering quickstart scenario V1 (SC-001). **Done when**: the full anonymous flow completes and the quote appears with status `REQUESTED`.

**Checkpoint**: US1 (P1) complete — the public site captures leads end to end.

---

## Phase 4: Auth & Customer Portal (US3, US6 partial)

**Goal**: Customers can register, log in, and self-serve their quotes, orders, documents, and profile — seeing only their own data.

**Independent Test**: Register a new customer, log in, view quote statuses and order history, download a document, update the profile. Attempting to reach another customer's records returns 404.

- [ ] T045 [US3] Configure the Better Auth server instance in `lib/auth/auth.ts` — Prisma adapter, `admin` plugin for roles, email/password, session config. **Done when**: the `role` field persists on `User` and defaults to `CUSTOMER`.
- [ ] T046 [US3] Create the Better Auth route handler at `app/api/auth/[...all]/route.ts`. **Done when**: sign-up, sign-in, sign-out, and session endpoints all respond.
- [ ] T047 [P] [US3] Create the Better Auth client in `lib/auth/client.ts`. **Done when**: client components can read session state.
- [ ] T048 [US6] Implement authorization guards in `lib/auth/guards.ts` — `requireSession`, `requireRole`, `requireCustomer`, `requireStaff`, `requireAdmin` per the server-actions contract. **Done when**: each throws the correct `UNAUTHORIZED`/`FORBIDDEN` code and role is read only from the server session, never from input.
- [ ] T049 [US6] Implement `middleware.ts` with coarse route-group redirects per [contracts/routes.md](./contracts/routes.md). **Done when**: anonymous → `/login`, customer on `/admin/*` → `/dashboard`, staff on `/dashboard/*` → `/admin`.
- [ ] T050 [P] [US3] Build `app/(auth)/register/page.tsx`. **Done when**: registration always creates `role = CUSTOMER` with a linked `CustomerProfile`, and a client-supplied role field is ignored.
- [ ] T051 [P] [US3] Build `app/(auth)/login/page.tsx` with role-based post-login redirect. **Done when**: customers land on `/dashboard` and staff on `/admin`.
- [ ] T052 [P] [US3] Implement password reset (request + confirm) via Better Auth. **Done when**: a reset email is sent and the new password authenticates.
- [ ] T053 [P] [US3] Implement email verification via Better Auth. **Done when**: a verification link sets `emailVerified`.
- [ ] T054 [US3] Create `app/(portal)/layout.tsx` with a server-side `requireRole('CUSTOMER')` guard and `noindex` metadata. **Done when**: non-customers cannot render any portal route.
- [ ] T055 [US3] Implement `listMyQuotes` / `getMyQuote` in `lib/db/quotes.ts`, scoped to the session's own `customerProfileId`. **Done when**: queries always filter by session profile, `staffNotes` is never selected, and prices are selected only when status ≠ `REQUESTED`.
- [ ] T056 [US3] Build `app/(portal)/dashboard/page.tsx` showing all quote statuses (FR-009). **Done when**: all five statuses display with `QuoteStatusBadge`, reachable within 2 clicks (SC-004).
- [ ] T057 [P] [US3] Build `components/quote/QuoteStatusBadge.tsx` per the design-tokens status color table. **Done when**: status is conveyed by label as well as color, never color alone.
- [ ] T058 [US3] Build `app/(portal)/dashboard/quotes/[id]/page.tsx` with ownership re-query returning `notFound()` on miss. **Done when**: pricing shows only once status is `QUOTED`, and another customer's id yields 404.
- [ ] T059 [US3] Implement `acceptQuote` / `declineQuote` in `lib/actions/quote-actions.ts`. **Done when**: only the owning customer can act, only from `QUOTED` status, and an `ActivityLog` entry is written in the same transaction.
- [ ] T060 [P] [US3] Build `app/(portal)/dashboard/orders/page.tsx` and `orders/[id]/page.tsx` scoped to the caller (FR-010). **Done when**: only the caller's own orders are listed and reachable.
- [ ] T061 [US3] Build `app/(portal)/dashboard/documents/page.tsx` listing metadata only (FR-011). **Done when**: no Cloudinary URL appears in the response body or page source.
- [ ] T062 [US3] Implement `app/api/documents/[id]/download/route.ts` — resolve the owning customer via profile/quote/order, permit staff or owner, otherwise 403; redirect to a ~5-minute signed Cloudinary URL. **Done when**: the owner downloads successfully and another customer receives 403.
- [ ] T063 [P] [US3] Build `app/(portal)/dashboard/profile/page.tsx` with `getMyProfile` / `updateMyProfile` (FR-012). **Done when**: updates persist and write `ActivityLog(PROFILE_UPDATED)`.
- [ ] T064 [P] [US3] Write `tests/e2e/customer-isolation.spec.ts` covering quickstart V4 and the customer rows of the access-control matrix (SC-009). **Done when**: every cross-customer access attempt returns 404 or 403.

**Checkpoint**: US3 complete — customers self-serve. Quotes still cannot be priced until Phase 5.

---

## Phase 5: Admin CRM (US2, US4, US5, US6)

**Goal**: Staff manage the full customer lifecycle — respond to quotes with pricing, convert to orders, manage documents and history — with Admin-only user management.

**Independent Test**: As Sales, price a `REQUESTED` quote → customer accepts → convert to order → upload a document → view unified customer history → add an internal note. Attempting `/admin/users` as Sales returns 403.

- [ ] T065 [US6] Create `app/(crm)/layout.tsx` with a server-side `requireRole('ADMIN','SALES')` guard and `noindex` metadata. **Done when**: customers and anonymous users cannot render any CRM route.
- [ ] T066 [P] [US5] Build `components/crm/DataTable.tsx` — sortable, paginated, responsive per the design-tokens matrix. **Done when**: it renders as a card list on mobile and a full table on desktop, using only the restricted dashboard palette (no jewel tones).
- [ ] T067 [US2] Build `app/(crm)/admin/page.tsx` — pending quotes, recent orders, recent activity. **Done when**: counts reflect live database state.
- [ ] T068 [US2] Build `app/(crm)/admin/quotes/page.tsx` with status filtering via `listQuotes`. **Done when**: staff see all quotes across all customers, filterable by status.
- [ ] T069 [US2] Build `app/(crm)/admin/quotes/[id]/page.tsx` showing all line items, requester details, and per-item price inputs. **Done when**: guest and registered requesters both render correctly.
- [ ] T070 [US2] Implement `respondToQuote` in `lib/actions/quote-actions.ts` (FR-015). **Done when**: requires `requireStaff()`, only accepts quotes in `REQUESTED`, sets `unitPrice`/`lineTotal`, moves status to `QUOTED`, stamps `quotedAt`, and writes `ActivityLog(QUOTE_RESPONDED)`.
- [ ] T071 [US4] Implement `logActivity` in `lib/db/activity.ts` — append-only, called inside the caller's transaction. **Done when**: no update or delete path exists and log writes roll back with a failed mutation.
- [ ] T072 [US4] Implement `convertQuoteToOrder` in `lib/actions/order-actions.ts` (FR-016). **Done when**: succeeds only from `ACCEPTED`, rejects `REQUESTED`/`QUOTED`/`DECLINED`/`FULFILLED` with `CONFLICT`, requires a linked `customerProfileId`, snapshots `totalAmount`, and enforces one order per quote.
- [ ] T073 [US4] Build `app/(crm)/admin/orders/page.tsx` and `orders/[id]/page.tsx` with `updateOrderStatus`. **Done when**: setting an order to `COMPLETED` also moves its source quote to `FULFILLED`.
- [ ] T074 [P] [US4] Configure Cloudinary in `lib/cloudinary/client.ts`. **Done when**: the server SDK authenticates and the public cloud name is available client-side.
- [ ] T075 [US4] Implement `app/api/uploads/sign/route.ts` returning signed direct-upload params (FR-018). **Done when**: requires `requireStaff()`, signs documents as `type: authenticated` and product images as public, and never exposes the API secret.
- [ ] T076 [US4] Implement `lib/cloudinary/signed-url.ts` generating short-lived authenticated delivery URLs. **Done when**: a generated URL expires after ~5 minutes.
- [ ] T077 [US4] Build `components/shared/FileUpload.tsx` performing direct browser→Cloudinary upload. **Done when**: file bytes never pass through a Vercel serverless function.
- [ ] T078 [US4] Implement `createDocumentRecord` / `deleteDocument` / `listDocumentsFor` in `lib/actions/document-actions.ts`. **Done when**: requires `requireStaff()`, enforces at least one attachment target, validates MIME type and size, and writes `ActivityLog(DOCUMENT_UPLOADED)`.
- [ ] T079 [US5] Implement `searchCustomers` in `lib/db/customers.ts` (FR-014). **Done when**: matches by company name, contact name, and email, paginated.
- [ ] T080 [US5] Build `app/(crm)/admin/customers/page.tsx` with search. **Done when**: staff can locate any customer by any of the three search fields.
- [ ] T081 [US5] Build `app/(crm)/admin/customers/[id]/page.tsx` — unified history via tabs: profile, quotes, orders, documents, activity log, internal notes (FR-017). **Done when**: all six sections load from one search in under 30 seconds (SC-006).
- [ ] T082 [US5] Implement `addInternalNote` / `listInternalNotes` in `lib/actions/customer-actions.ts` (FR-019). **Done when**: requires `requireStaff()`, writes `ActivityLog(NOTE_ADDED)`, and notes never appear in any customer-facing query.
- [ ] T083 [P] [US5] Build `components/crm/ActivityTimeline.tsx` rendering the chronological log. **Done when**: entries display newest-first with actor and description.
- [ ] T084 [P] [US4] Build product catalog authoring at `app/(crm)/admin/products/` (list, new, edit) with image upload and publish toggle. **Done when**: unpublishing removes a product from public queries while leaving historical `QuoteItem` references intact.
- [ ] T085 [US6] Implement `lib/actions/user-actions.ts` — `listUsers`, `createStaffUser`, `updateUserRole`, `deactivateUser`, `reactivateUser` (FR-021). **Done when**: every action calls `requireAdmin()` and role changes reconcile the `CustomerProfile` 1:1 rule.
- [ ] T086 [US6] Build `app/(crm)/admin/users/page.tsx` with a page-level `requireAdmin()` re-guard. **Done when**: Sales receives 403 at both the page and every underlying action, not merely a hidden nav link (FR-022).
- [ ] T087 [US6] Implement `linkGuestQuoteToCustomer` in `lib/actions/quote-actions.ts`. **Done when**: only quotes with a null `customerProfileId` can be linked, the action is explicit (never automatic on email match), and it writes an `ActivityLog` entry.
- [ ] T088 [P] [US6] Write `tests/e2e/role-boundaries.spec.ts` covering the full access-control matrix in [contracts/routes.md](./contracts/routes.md) (SC-008, SC-009). **Done when**: all rows pass, including direct server-action invocation — not only UI navigation.

**Checkpoint**: All user stories complete. Full quote → order → document lifecycle works with enforced role boundaries.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T089 [P] Write unit tests in `tests/unit/guards.test.ts` for every `requireRole` variant. **Done when**: each role/permission combination is asserted.
- [ ] T090 [P] Write unit tests in `tests/unit/quote-transitions.test.ts` for the quote state machine. **Done when**: every illegal transition from data-model.md is rejected.
- [ ] T091 [P] Write `tests/e2e/responsive.spec.ts` asserting the responsive matrix at 375/768/1440px (SC-007). **Done when**: no horizontal page scroll at any width on homepage, portal, or CRM.
- [ ] T092 [P] Add error boundaries and `not-found.tsx` / `error.tsx` for each route group. **Done when**: errors render branded pages instead of raw stack traces.
- [ ] T093 [P] Apply Cloudinary `f_auto,q_auto` responsive transformations via a custom `next/image` loader. **Done when**: images serve as WebP/AVIF at appropriate widths.
- [ ] T094 Verify Core Web Vitals on the homepage. **Done when**: LCP < 2.5s and CLS < 0.1 in a production build.
- [ ] T095 Security review against the field-level visibility matrix in [data-model.md](./data-model.md). **Done when**: every restricted field is confirmed unreachable by each unauthorized role.
- [ ] T096 Run the full quickstart validation suite V1–V10. **Done when**: all ten scenarios pass.
- [ ] T097 Configure Vercel deployment and Cloudflare DNS per the quickstart pre-deploy checklist. **Done when**: every checklist item is green, no secret carries a `NEXT_PUBLIC_` prefix, and `prisma migrate deploy` has run against production.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundation)**: no dependencies — start immediately. **Blocks everything.**
- **Phase 2 (Homepage)**: depends on Phase 1 (theme + route groups). Independent of all backend work.
- **Phase 3 (Public site)**: depends on Phase 1; T030 (`lib/db/public.ts`) blocks T034/T035.
- **Phase 4 (Auth & portal)**: depends on Phase 1. T045→T048 block all portal routes.
- **Phase 5 (CRM)**: depends on Phase 4 (guards from T048, activity log helper T071).
- **Phase 6 (Polish)**: depends on all preceding phases.

### Critical Path

```text
T001 → T003 → T004 → T005 → T006  (theme)
T011 → T012 → T013 → T014          (database)
                ↓
        T048 (guards) → T054 (portal guard) → T065 (CRM guard)
                ↓
        T070 (respond) → T072 (convert to order)
```

### Cross-Phase Blockers

| Task | Blocks |
|---|---|
| T012/T013 (schema + migration) | every data task |
| T030 (public data layer) | T034, T035, T042 |
| T048 (guards) | T054, T065, and every server action |
| T071 (logActivity) | T070, T072, T078, T082 |
| T074–T076 (Cloudinary) | T077, T078, T062 |

### Parallel Opportunities

- **Phase 1**: T002, T007, T010, T014 in parallel.
- **Phase 2**: T017, T019, T021, T022, T023 — all independent section components.
- **Phase 3**: T031, T032, T033 in parallel; T043, T044 in parallel once pages exist.
- **Phase 4**: T050–T053 (auth pages) in parallel after T045–T047.
- **Phase 5**: T066, T074, T083, T084 in parallel.
- **Phase 6**: T089–T093 all in parallel.

### Parallel Example: Phase 2 Homepage

```bash
# All six section components touch different files — build simultaneously:
Task: "Build components/marketing/SiteHeader.tsx"
Task: "Build components/marketing/ContentShowcaseGrid.tsx"
Task: "Build components/marketing/VideoSection.tsx"
Task: "Build components/marketing/CoverageMap.tsx"
Task: "Build components/marketing/SiteFooter.tsx"
# Then serially: T018 Hero → T020 Carousel → T025 assemble
```

---

## Implementation Strategy

### Demo-First MVP (Phases 1–2)

1. Complete Phase 1 — running app, brand theme, database schema.
2. Complete Phase 2 — the approved homepage.
3. **STOP and VALIDATE**: demo the homepage to the client at all three breakpoints.
4. Get sign-off on the visual direction before investing in backend work.

This is the fastest path to a client-visible artifact and the reason the phases are ordered this way.

### Lead-Capture Increment (Phase 3)

Adds the complete P1 story — a live site that captures quote requests. Deployable and commercially useful even before staff tooling exists (staff can read requests directly from the database in the interim).

### Full Product (Phases 4–5)

Phase 4 gives customers self-service; Phase 5 gives staff the CRM that closes the loop.

⚠️ If the client needs a working sales loop before the full CRM ships, pull **T070** (respond to quote) and **T072** (convert to order) forward immediately after Phase 4 — they are the minimum staff tooling that makes the business process complete.

### Parallel Team Strategy

After Phase 1:

- **Developer A**: Phase 2 → Phase 3 (frontend/marketing)
- **Developer B**: Phase 4 auth foundation (T045–T049), then portal
- **Developer C**: joins Phase 5 CRM once T048 guards land

---

## Implementation Notes (recorded 2026-08-06)

Deviations from the plan discovered during Phase 1–2 execution. The plan was written before dependency versions were pinned; these are the real-world corrections.

### 1. Tailwind v4 — no `tailwind.config.ts`

`create-next-app` now ships **Tailwind CSS v4**, which uses CSS-first configuration. There is no `tailwind.config.ts`. The brand palette and semantic tokens live in `app/globals.css` under `@theme` / `@theme inline` instead. T003/T004/T005 were completed this way. All token names in [contracts/design-tokens.md](./contracts/design-tokens.md) still resolve as documented (`bg-navy`, `text-ivory`, `border-premium`).

### 2. Prisma 7 — driver adapters, URLs moved out of schema

Prisma 7 rejects `url`/`directUrl` inside `datasource`. Connection strings now live in **`prisma.config.ts`**, and the runtime client connects through the `@prisma/adapter-pg` driver adapter (see `lib/db/prisma.ts`). Migrations use `DIRECT_URL`; the app runtime uses the pooled `DATABASE_URL`.

### 3. Next.js 16 — `LayoutProps` is build-generated

`app/layout.tsx` uses an explicit `{ children: React.ReactNode }` type rather than the generated global `LayoutProps<"/">`, so `npm run typecheck` works without a prior build.

### 4. Extra tokens added

- `--color-brand-blue-text: #0668B3` — the darkened blue required for inline links, since raw `#0b97ff` on ivory is ~2.9:1 and fails WCAG AA for body text. Exposed as the `.link-inline` utility.
- `.product-frame` utility implements the FR-008 white-background + thin-gold-frame product hero treatment.

### 5. T013 blocked — no Supabase credentials

`prisma migrate dev` cannot run: `.env.local` currently holds **placeholder** connection strings. The schema validates and the client generates, but no tables exist yet. **To unblock**: put real Supabase `DATABASE_URL` and `DIRECT_URL` into `.env.local`, then run `npm run db:migrate && npm run db:seed`. Every later data task (Phase 3 onward) depends on this.

### 6. Node.js was installed during this session

Node was absent from the machine. Installed **Node.js 24.19.0 LTS** via winget before any task could run.

---

## Notes

- `[P]` = different files, no incomplete dependencies.
- `[US#]` maps to spec user stories for traceability — see the Phase Ordering Note for how delivery phases relate to story priorities.
- Every server action task must call a guard from `lib/auth/guards.ts` **before** reading input. This is the security boundary; route and middleware checks are UX only.
- `Product` must never gain a price field. Pricing lives solely on `QuoteItem`.
- Commit after each task or logical group; stop at any checkpoint to validate.
