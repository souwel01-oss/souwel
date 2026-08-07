# Phase 0 Research: B2B Textile Portal & CRM

**Feature**: 001-b2b-textile-portal-crm
**Date**: 2026-08-06

The stack was specified by the user, so this document records *how* each choice is applied and which patterns were selected — not whether to adopt it. Open questions raised by the stack itself are resolved below.

---

## 1. Anonymous Quote Requests vs. Authenticated Customers

**Decision**: `Quote.customerId` is nullable. Anonymous submissions capture contact details (name, email, company, phone) directly on the Quote record via a `guestContact` embedded set of fields. When a user later registers with a matching email, staff can link the historical quote to the new `CustomerProfile` via an explicit CRM action.

**Rationale**: FR-005 requires quote submission without an account, but FR-009 requires customers to track status in-portal. A nullable owner is the only model that satisfies both without forcing account creation. Auto-linking on email match was rejected as an implicit trust of an unverified email — an attacker could register with a known buyer's address and inherit their quote history.

**Alternatives considered**:
- *Force registration before quoting* — violates FR-005 directly.
- *Shadow/pending accounts auto-created per anonymous quote* — pollutes the User table with unverifiable records and complicates Better Auth's user lifecycle.
- *Auto-link on email match at registration* — rejected for the account-takeover risk noted above.

---

## 2. Better Auth Role Modeling

**Decision**: Use Better Auth's `admin` plugin for role support, with a `role` field on the user (`ADMIN | SALES | CUSTOMER`) persisted through the Prisma adapter. Roles are read server-side from the session on every protected request. A thin `requireRole()` server helper wraps `auth.api.getSession()` and throws/redirects on mismatch.

**Rationale**: Better Auth ships first-class Prisma adapter support and an admin plugin that already models roles and user management operations — matching FR-021's Admin-only user/role management without hand-rolling an authorization layer. Reading the role from the server session (never from a client-supplied value) satisfies the architecture constraint that RBAC is server-enforced.

**Alternatives considered**:
- *Roles in a separate join table (full RBAC)* — over-engineered for exactly three fixed, mutually exclusive roles.
- *Supabase Auth + RLS* — the stack mandates Prisma as the only data access layer, and RLS policies would sit outside Prisma, splitting authorization across two systems.

---

## 3. Server-Side Authorization Boundary

**Decision**: Three enforcement layers, all server-side:
1. **Middleware** — coarse route-group protection; redirects unauthenticated users away from `(portal)` and `(crm)`.
2. **Layout guards** — each protected route group's `layout.tsx` re-validates the session and role server-side.
3. **Data-access guards (authoritative)** — every server action / route handler calls `requireRole()` and scopes queries by the session's user id for customers.

**Rationale**: FR-013 and SC-009 require that a customer can *never* read another customer's data. Middleware alone is insufficient — Next.js middleware can be bypassed for direct server-action invocations. The data-access layer is the only place where a scoping guarantee actually holds, so it is treated as authoritative and the outer layers are UX conveniences.

**Alternatives considered**:
- *Middleware-only checks* — rejected; does not protect server actions invoked directly.
- *Client-side conditional rendering* — explicitly rejected by the architecture brief.

---

## 4. Keeping Internal Pricing Off Public Surfaces

**Decision**: Price lives only on `QuoteItem.unitPrice` / `QuoteItem.lineTotal` — never on `Product`. Public product queries use explicit Prisma `select` clauses listing only public fields. A dedicated `lib/db/public.ts` module exposes the only query functions the public route group is permitted to call.

**Rationale**: FR-004 and FR-024 forbid any public pricing, and SC-003 audits for it. Structurally omitting price from the `Product` model makes public price exposure impossible-by-construction rather than a policy someone must remember. Pricing is inherently per-quote in B2B textile anyway (volume-dependent), so this also matches the domain.

**Alternatives considered**:
- *`Product.basePrice` hidden by query filters* — one forgotten `include` leaks it; rejected.
- *Separate pricing table keyed to product* — unnecessary; no list price concept exists in the domain.

---

## 5. Cloudinary Upload Strategy & Document Privacy

**Decision**: Two distinct handling paths.
- **Product images** (public): standard Cloudinary delivery, served through `next/image` with a custom Cloudinary loader for transformations (`f_auto,q_auto`, responsive `w_`).
- **Customer documents** (private): uploaded as Cloudinary *authenticated* delivery type. Downloads go through a server route that verifies ownership/role, then issues a short-lived signed URL. Raw Cloudinary URLs are never returned to the client.

**Rationale**: FR-011 lets customers download their own documents while FR-013 forbids cross-customer access. Public Cloudinary URLs are unguessable but permanently valid and shareable — insufficient for invoices and contracts. Signed, expiring URLs gated by a server-side ownership check close that gap.

**Alternatives considered**:
- *Public URLs stored in the DB* — security-through-obscurity for financial documents; rejected.
- *Proxy every download through the Next.js server* — safe but pushes file bytes through Vercel functions, risking payload/duration limits on large files.

**Uploads**: signed direct-to-Cloudinary uploads (server generates the signature; browser uploads directly), avoiding Vercel's serverless request body size limit for staff document uploads.

---

## 6. Tailwind Theme Tokens

**Decision**: Register the full 13-color brand palette as Tailwind theme colors, but layer *semantic* tokens on top (`surface`, `surface-subtle`, `content`, `content-muted`, `border`, `primary`, `premium`) mapped to the brand colors. shadcn/ui's CSS-variable convention drives component theming. Data-heavy UI (tables/forms in the portal and CRM) is restricted to the `primary` / `navy` / `ivory` / `platinum` subset; jewel tones are exposed only to marketing-surface components.

**Rationale**: shadcn/ui expects CSS variables for theming, and the brief explicitly requires that dashboards reuse primary/navy/ivory while avoiding jewel tones in data-heavy UI. Semantic tokens make that rule enforceable in review ("why is `oxblood` in a table cell?") rather than relying on discipline.

**Alternatives considered**:
- *Raw brand colors used directly everywhere* — no mechanism to keep jewel tones out of dashboards.
- *Two separate Tailwind configs* — breaks the shared component library requirement.

**Contrast note**: `accent-yellow #f9eb3e` and `accent-gold #C9A84C` both fail WCAG AA as text colors on ivory. They are restricted to non-text decorative use (badges with dark text, image frames, dividers). Primary blue `#0b97ff` on ivory also fails AA for small text — CTAs use white text on blue fill, and inline text links use a darkened blue variant. This is recorded here so it is not "discovered" during implementation.

---

## 7. Rendering Strategy for SEO

**Decision**: Public route group is fully static (SSG) with ISR on catalog pages; `generateMetadata` per page; `generateStaticParams` for category and product routes; `app/sitemap.ts` and `app/robots.ts` generated from the database. Portal and CRM route groups are dynamic and explicitly marked `noindex`.

**Rationale**: FR-025 requires crawlable public pages. Product/category content changes infrequently (staff-authored), making ISR a better fit than per-request SSR. Dashboards must never be indexed.

**Alternatives considered**:
- *Full SSR for public pages* — unnecessary server cost for near-static content.
- *Client-side fetched catalog* — defeats the SEO requirement.

---

## 8. Activity Log Generation

**Decision**: Activity log entries are written inside the same Prisma transaction as the mutation that triggers them, via a shared `logActivity()` helper invoked from server actions. Log entries are append-only (no update/delete exposed).

**Rationale**: FR-017 requires a complete per-customer history and the spec's Assumptions state logs are generated automatically from system actions. Writing in-transaction guarantees the log never diverges from the data it describes.

**Alternatives considered**:
- *Prisma middleware / client extensions to auto-log* — too implicit; can't capture the acting user or a human-readable description reliably.
- *Post-hoc log writes outside the transaction* — a failure between mutation and log leaves gaps in an audit trail.

---

## 9. Testing Approach

**Decision**: Vitest for unit tests (utilities, authorization helpers, status-transition logic); Playwright for end-to-end tests covering the role-boundary scenarios (SC-008, SC-009), the anonymous quote flow (SC-001), and the public no-pricing audit (SC-003).

**Rationale**: The highest-risk requirements in this feature are access-control boundaries and the no-public-pricing guarantee — both are cross-layer behaviors only meaningfully verified end-to-end. Playwright also covers the responsive requirement (SC-007) via viewport-based assertions.

**Alternatives considered**:
- *Unit tests only* — cannot verify that a customer is actually blocked from another customer's data through the real request path.
- *Jest* — Vitest aligns better with a modern TS/ESM Next.js setup.

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---|---|
| Anonymous quote ownership | Nullable `customerId` + guest contact fields; manual CRM linking |
| Role storage & enforcement | Better Auth admin plugin, server-session role, `requireRole()` at data layer |
| Public pricing prevention | Price exists only on `QuoteItem`; public queries use explicit field selects |
| Private document delivery | Cloudinary authenticated type + server-verified short-lived signed URLs |
| Dashboard vs. marketing color scope | Semantic tokens; jewel tones excluded from data-heavy UI |
| Public page rendering | SSG + ISR, per-page metadata, generated sitemap; dashboards `noindex` |
| Audit log integrity | In-transaction append-only writes via shared helper |
| Test tooling | Vitest (unit) + Playwright (E2E, role boundaries & responsive) |
