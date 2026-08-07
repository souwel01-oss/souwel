# Contract: Server Actions & Route Handlers

**Feature**: 001-b2b-textile-portal-crm

The interface between client components and the data layer. There is no separate REST API for application data — Next.js server actions are the contract. Two route handlers exist where actions are unsuitable (auth callbacks, file streaming).

## Universal Rules

Every action in this document MUST:

1. Call `requireRole(...)` (or `requireSession()`) **first**, before reading input. The returned session is the only trusted source of the caller's identity and role — a `userId` or `role` arriving in the payload is always ignored.
2. Validate input with a Zod schema. Reject on parse failure.
3. Scope customer-facing reads by the session's own `customerProfileId` — never by an id supplied by the client.
4. Write an `ActivityLog` entry in the same transaction as any mutation that changes customer-visible state.
5. Return a discriminated result rather than throwing for expected failures:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' }
```

---

## Authorization Helpers — `lib/auth/guards.ts`

| Helper | Behavior |
|---|---|
| `requireSession()` | Returns the session, or throws `UNAUTHORIZED`. |
| `requireRole(...roles: Role[])` | Returns the session if `session.user.role` is in `roles`; otherwise throws `FORBIDDEN`. |
| `requireCustomer()` | `requireRole('CUSTOMER')` + resolves and returns the caller's `customerProfileId`. |
| `requireStaff()` | `requireRole('ADMIN', 'SALES')`. |
| `requireAdmin()` | `requireRole('ADMIN')`. |

These are the security boundary (FR-020–FR-022). Middleware and layout checks are UX conveniences layered on top.

---

## Quote Actions — `lib/actions/quote-actions.ts`

### `submitQuoteRequest`
- **Auth**: none required — public (FR-005)
- **Input**: `{ items: [{ productId, quantity, customerNotes? }], customerMessage?, guestContact?: { name, email, company, phone? } }`
- **Rules**: at least one item; if no session, `guestContact` is required; if a `CUSTOMER` session exists, links to their profile and ignores `guestContact`.
- **Returns**: `{ quoteId, reference }`
- **Side effects**: creates `Quote` + `QuoteItem[]` (prices null); `ActivityLog(QUOTE_REQUESTED)` if attributable to a customer; notification email.

### `respondToQuote`
- **Auth**: `requireStaff()` (FR-015)
- **Input**: `{ quoteId, items: [{ quoteItemId, unitPrice }], staffResponse?, validUntil? }`
- **Rules**: quote must be `REQUESTED`; every item priced; `unitPrice >= 0`.
- **Effect**: sets prices + `lineTotal`, status → `QUOTED`, stamps `quotedAt`; `ActivityLog(QUOTE_RESPONDED)`.

### `acceptQuote` / `declineQuote`
- **Auth**: `requireCustomer()` — and the quote MUST belong to that profile
- **Input**: `{ quoteId }` (decline also accepts `reason?`)
- **Rules**: quote must be `QUOTED`.
- **Effect**: status → `ACCEPTED` / `DECLINED`; `ActivityLog(QUOTE_ACCEPTED | QUOTE_DECLINED)`.

### `listMyQuotes` / `getMyQuote`
- **Auth**: `requireCustomer()`
- **Rules**: scoped to caller's profile. `staffNotes` never selected. Prices selected only when `status != REQUESTED`.

### `listQuotes` / `getQuote` (CRM)
- **Auth**: `requireStaff()`
- **Input**: `{ status?, search?, page, pageSize }`
- **Rules**: full visibility across all customers (no per-rep assignment).

### `linkGuestQuoteToCustomer`
- **Auth**: `requireStaff()`
- **Input**: `{ quoteId, customerProfileId }`
- **Rules**: quote must currently have a null `customerProfileId`. Explicit staff action — never automatic on email match (`research.md` §1).
- **Effect**: sets owner, clears guest fields; `ActivityLog`.

---

## Order Actions — `lib/actions/order-actions.ts`

### `convertQuoteToOrder`
- **Auth**: `requireStaff()` (FR-016)
- **Input**: `{ quoteId, notes? }`
- **Rules**: quote MUST be `ACCEPTED` (reject `REQUESTED`/`QUOTED`/`DECLINED`/`FULFILLED` with `CONFLICT`); quote MUST have a `customerProfileId`; no existing order for the quote.
- **Effect**: creates `Order` with `totalAmount` snapshotted from quote items; `ActivityLog(ORDER_CREATED)`.

### `updateOrderStatus`
- **Auth**: `requireStaff()`
- **Input**: `{ orderId, status }`
- **Effect**: updates status; when `COMPLETED`, sets the source quote to `FULFILLED`; `ActivityLog(ORDER_STATUS_CHANGED)`.

### `listMyOrders` / `getMyOrder`
- **Auth**: `requireCustomer()`, scoped to own profile (FR-010)

### `listOrders` / `getOrder` (CRM)
- **Auth**: `requireStaff()`

---

## Document Actions — `lib/actions/document-actions.ts`

### `createDocumentRecord`
- **Auth**: `requireStaff()` (FR-018)
- **Input**: `{ type, fileName, cloudinaryPublicId, mimeType, fileSizeBytes, customerProfileId?, quoteId?, orderId? }`
- **Rules**: at least one attachment target; MIME type in allowlist; size under limit.
- **Effect**: creates `Document`; `ActivityLog(DOCUMENT_UPLOADED)`.

### `deleteDocument`
- **Auth**: `requireStaff()` — removes the Cloudinary asset and the record.

### `listMyDocuments`
- **Auth**: `requireCustomer()` — returns documents resolving to the caller's own profile, quotes, or orders (FR-011). Returns metadata only; never a URL.

### `listDocumentsFor` (CRM)
- **Auth**: `requireStaff()` — by customer, quote, or order.

---

## Customer & Note Actions — `lib/actions/customer-actions.ts`

| Action | Auth | Notes |
|---|---|---|
| `getMyProfile` / `updateMyProfile` | `requireCustomer()` | Own profile only (FR-012); update writes `ActivityLog(PROFILE_UPDATED)` |
| `searchCustomers` | `requireStaff()` | By company name, contact name, email (FR-014) |
| `getCustomerDetail` | `requireStaff()` | Unified history: profile + quotes + orders + documents + activity log + notes (FR-017) |
| `updateCustomerProfile` | `requireStaff()` | Any profile |
| `addInternalNote` | `requireStaff()` | Never customer-visible (FR-019); writes `ActivityLog(NOTE_ADDED)` |
| `listInternalNotes` | `requireStaff()` | Staff-only read |
| `getCustomerActivityLog` | `requireStaff()` | Chronological, paginated |

---

## User Management — `lib/actions/user-actions.ts`

**Every action here requires `requireAdmin()`.** Sales staff attempting any of these receive `FORBIDDEN` (FR-022, SC-008).

| Action | Notes |
|---|---|
| `listUsers` | Paginated, filterable by role |
| `createStaffUser` | Creates `ADMIN` or `SALES` user |
| `updateUserRole` | Changing a user to/from `CUSTOMER` must reconcile the `CustomerProfile` 1:1 rule |
| `deactivateUser` / `reactivateUser` | Sets Better Auth `banned`; historical records retained (spec edge case) |

---

## Route Handlers

### `POST /api/uploads/sign`
- **Auth**: `requireStaff()`
- **Returns**: `{ signature, timestamp, apiKey, folder, uploadPreset }` for a direct browser→Cloudinary upload. Documents are signed for `type: authenticated`; product images for public delivery.
- **Rationale**: keeps large files off Vercel serverless request bodies (`research.md` §5).

### `GET /api/documents/[id]/download`
- **Auth**: `requireSession()`
- **Rules**: loads the document, resolves its owning customer via profile/quote/order, then permits if the caller is `ADMIN`/`SALES` **or** the resolved owner. Otherwise `403`.
- **Returns**: `302` redirect to a short-lived Cloudinary signed URL (expiry ~5 min).
- **Never** returns a raw or permanent Cloudinary URL.

### `ALL /api/auth/[...all]`
- Better Auth handler (sign-up, sign-in, sign-out, session, admin plugin endpoints). Public registration always yields `role = CUSTOMER`.

---

## Public Data Access — `lib/db/public.ts`

The **only** data module the `(marketing)` route group may import. Enforced by convention and code review; a lint rule restricting imports in `app/(marketing)/**` is recommended.

| Function | Returns |
|---|---|
| `getCategories()` | All categories, ordered |
| `getCategoryBySlug(slug)` | Category + published products |
| `getPublishedProducts(categoryId?)` | Published products only |
| `getProductBySlug(slug)` | Published product detail |
| `getProductsForSitemap()` | Slugs + `updatedAt` |

**Invariant**: no function in this module selects `unitPrice`, `lineTotal`, `staffNotes`, or any `Quote`/`Order`/`Document`/`InternalNote`/`ActivityLog` field. Every query uses an explicit `select`, never a bare model fetch (FR-004, FR-024, SC-003).
