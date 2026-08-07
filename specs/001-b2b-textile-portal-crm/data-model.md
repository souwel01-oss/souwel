# Phase 1 Data Model: B2B Textile Portal & CRM

**Feature**: 001-b2b-textile-portal-crm
**Date**: 2026-08-06
**Storage**: PostgreSQL (Supabase) via Prisma

---

## Entity Overview

```text
User ──1:1── CustomerProfile ──1:N── Quote ──1:N── QuoteItem ──N:1── Product ──N:1── Category
 │                  │                   │                                    
 │                  │                   └──1:1── Order ──1:N── Document
 │                  ├──1:N── Document
 │                  ├──1:N── ActivityLog
 │                  └──1:N── InternalNote
 └──(actor)── ActivityLog / InternalNote
```

Better Auth additionally manages `Session`, `Account`, and `Verification` tables through its Prisma adapter. Those are auth-infrastructure tables, not application entities, and are not detailed here.

---

## User

Authentication identity and role assignment. Managed by Better Auth (admin plugin) through the Prisma adapter.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `email` | String | Unique |
| `emailVerified` | Boolean | Better Auth managed |
| `name` | String | |
| `image` | String? | |
| `role` | Role enum | `ADMIN` \| `SALES` \| `CUSTOMER`. Default `CUSTOMER`. |
| `banned` | Boolean | Better Auth admin plugin — used for staff deactivation |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: optional 1:1 `CustomerProfile` (only for `CUSTOMER` role); 1:N `ActivityLog` as actor; 1:N `InternalNote` as author.

**Validation rules**:
- Only `ADMIN` may create, modify, deactivate, or change the `role` of any User (FR-021).
- A `CUSTOMER`-role user MUST have exactly one `CustomerProfile`; `ADMIN`/`SALES` MUST have none.
- Registration via the public site always creates `role = CUSTOMER`; the role field is never accepted from client input.

---

## CustomerProfile

Business identity of a customer account. Separated from `User` so auth concerns and CRM data stay independent.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | String | FK → User, unique (1:1) |
| `companyName` | String | |
| `contactName` | String | |
| `phone` | String? | |
| `addressLine1` / `addressLine2` | String? | |
| `city` / `state` / `postalCode` / `country` | String? | |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: 1:N `Quote`, `Order`, `Document`, `ActivityLog`, `InternalNote`.

**Validation rules**:
- A customer may read/update only their own profile (FR-012, FR-013).
- `ADMIN` and `SALES` may read and update any profile (FR-014).
- Deleting a profile is not exposed; deactivation is handled on `User`.

---

## Category

The four fixed product lines. Seeded, not user-created.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `slug` | String | Unique — `hospitality`, `health-care`, `institutional-laundry`, `commercial-automotive` |
| `name` | String | Display name |
| `description` | String? | |
| `heroImageUrl` | String? | Cloudinary public URL |
| `sortOrder` | Int | Carousel/nav ordering |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: 1:N `Product`.

**Validation rules**: exactly four seeded rows (FR-002); slug immutable once published (SEO/URL stability).

---

## Product

Catalog item. **Contains no price field of any kind** — see `research.md` §4.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `slug` | String | Unique, URL identifier |
| `name` | String | |
| `description` | String | Detail-page body |
| `shortDescription` | String? | Card/listing summary |
| `specifications` | Json? | Material, weight, size, composition, etc. |
| `heroImageUrl` | String | Cloudinary — rendered on white bg with thin gold frame (FR-008) |
| `galleryImageUrls` | String[] | Additional Cloudinary images |
| `categoryId` | String | FK → Category |
| `isPublished` | Boolean | Unpublished products are excluded from all public queries |
| `sortOrder` | Int | |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: N:1 `Category`; 1:N `QuoteItem`.

**Validation rules**:
- No price attribute exists on this model (FR-004, FR-024) — pricing is per-quote only.
- Public queries filter `isPublished = true` and select only public fields via `lib/db/public.ts`.
- Only `ADMIN`/`SALES` may create, edit, publish, or unpublish products.
- A product referenced by an existing `QuoteItem` is soft-handled: unpublish rather than delete, so historical quotes stay intact (spec edge case).

---

## Quote

The central business object. Submittable by anonymous visitors or authenticated customers.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `reference` | String | Unique human-readable ref (e.g. `Q-2026-0042`) |
| `customerProfileId` | String? | **Nullable** — null for anonymous submissions |
| `guestName` | String? | Anonymous submissions only |
| `guestEmail` | String? | Anonymous submissions only |
| `guestCompany` | String? | Anonymous submissions only |
| `guestPhone` | String? | Anonymous submissions only |
| `status` | QuoteStatus enum | `REQUESTED` \| `QUOTED` \| `ACCEPTED` \| `DECLINED` \| `FULFILLED` |
| `customerMessage` | String? | Free-text from requester |
| `staffResponse` | String? | Staff-authored response body (internal + customer visible) |
| `quotedAt` / `respondedAt` | DateTime? | |
| `validUntil` | DateTime? | Quote expiry |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: N:1 `CustomerProfile` (optional); 1:N `QuoteItem`; 1:1 `Order` (optional); 1:N `Document`.

**Validation rules**:
- Either `customerProfileId` is set, **or** the guest contact fields are populated — never neither (FR-005).
- A quote must contain at least one `QuoteItem`.
- Customers may read only their own quotes (FR-013); anonymous quotes are staff-only until linked.
- `staffResponse` and all `QuoteItem` pricing are never exposed on public routes (FR-015).

### State transitions

```text
REQUESTED ──(staff attaches pricing)──> QUOTED
QUOTED ──(customer accepts)──> ACCEPTED
QUOTED ──(customer declines)──> DECLINED
ACCEPTED ──(staff converts to order)──> [Order created]
ACCEPTED ──(order completed)──> FULFILLED
```

- Only `ADMIN`/`SALES` may move `REQUESTED → QUOTED` (FR-015).
- Only the owning customer may move `QUOTED → ACCEPTED | DECLINED`.
- Order conversion is permitted **only** from `ACCEPTED` (FR-016); attempts from any other status are rejected (spec edge case).
- `DECLINED` and `FULFILLED` are terminal.
- Every transition writes an `ActivityLog` entry in the same transaction.

---

## QuoteItem

Line item on a quote. **The only place pricing exists in the system.**

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `quoteId` | String | FK → Quote (cascade delete) |
| `productId` | String | FK → Product |
| `quantity` | Int | > 0 |
| `customerNotes` | String? | Requester's per-item notes |
| `unitPrice` | Decimal? | **Staff-only.** Null until quoted. |
| `lineTotal` | Decimal? | **Staff-only.** Null until quoted. |
| `staffNotes` | String? | **Internal only** — never customer-visible |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: N:1 `Quote`; N:1 `Product`.

**Validation rules**:
- `quantity >= 1`.
- `unitPrice` / `lineTotal` readable by `ADMIN`/`SALES` always, and by the owning customer only once `status >= QUOTED`.
- `staffNotes` readable by `ADMIN`/`SALES` only — never returned in customer-facing queries.
- Never selected by any query in `lib/db/public.ts`.

---

## Order

Created exclusively by converting an `ACCEPTED` quote.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `reference` | String | Unique (e.g. `ORD-2026-0017`) |
| `quoteId` | String | FK → Quote, unique (1:1) |
| `customerProfileId` | String | FK → CustomerProfile (required) |
| `status` | OrderStatus enum | `PENDING` \| `IN_PRODUCTION` \| `SHIPPED` \| `COMPLETED` \| `CANCELLED` |
| `totalAmount` | Decimal | Snapshot from quote items at conversion |
| `notes` | String? | |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: 1:1 `Quote`; N:1 `CustomerProfile`; 1:N `Document`.

**Validation rules**:
- Creatable only from a quote in `ACCEPTED` status (FR-016).
- One order per quote (enforced by unique `quoteId`).
- `customerProfileId` is required — an anonymous quote must be linked to a registered customer before conversion.
- Customers read only their own orders (FR-010, FR-013).
- Only `ADMIN`/`SALES` may change order status.

---

## Document

File attached to a customer, quote, or order. Stored in Cloudinary with authenticated delivery.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `type` | DocumentType enum | `QUOTATION` \| `INVOICE` \| `CONTRACT` \| `SPEC_SHEET` |
| `fileName` | String | Original display name |
| `cloudinaryPublicId` | String | Used to mint short-lived signed URLs |
| `mimeType` | String | |
| `fileSizeBytes` | Int | |
| `customerProfileId` | String? | FK — at least one target required |
| `quoteId` | String? | FK |
| `orderId` | String? | FK |
| `uploadedById` | String | FK → User (staff uploader) |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: optional N:1 to `CustomerProfile`, `Quote`, `Order`; N:1 `User` (uploader).

**Validation rules**:
- At least one of `customerProfileId` / `quoteId` / `orderId` MUST be set (FR-018).
- Only `ADMIN`/`SALES` may upload, replace, or delete documents.
- A customer may download a document only if it resolves to their own profile/quote/order (FR-011, FR-013).
- Raw Cloudinary URLs are never persisted or returned to clients — only `cloudinaryPublicId` is stored, and delivery goes through the ownership-checked download route.
- Allowed MIME types and a max file size are enforced at upload (spec edge case).

---

## ActivityLog

Append-only chronological history per customer (FR-017).

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `customerProfileId` | String | FK → CustomerProfile |
| `actorId` | String? | FK → User. Null for system/anonymous events. |
| `action` | ActivityAction enum | `QUOTE_REQUESTED` \| `QUOTE_RESPONDED` \| `QUOTE_ACCEPTED` \| `QUOTE_DECLINED` \| `ORDER_CREATED` \| `ORDER_STATUS_CHANGED` \| `DOCUMENT_UPLOADED` \| `NOTE_ADDED` \| `PROFILE_UPDATED` |
| `description` | String | Human-readable summary |
| `metadata` | Json? | Related entity ids, before/after values |
| `createdAt` | DateTime | |

**Relations**: N:1 `CustomerProfile`; N:1 `User` (actor, optional).

**Validation rules**:
- Append-only — no update or delete operation is exposed.
- Written inside the same transaction as the mutation that triggers it (`research.md` §8).
- Readable by `ADMIN`/`SALES` only.
- Indexed on `(customerProfileId, createdAt DESC)` for the history timeline.

---

## InternalNote

Staff-authored note on a customer record. **Never visible to customers** (FR-019).

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `customerProfileId` | String | FK → CustomerProfile |
| `authorId` | String | FK → User (staff) |
| `body` | String | |
| `createdAt` / `updatedAt` | DateTime | |

**Relations**: N:1 `CustomerProfile`; N:1 `User` (author).

**Validation rules**:
- Readable and writable by `ADMIN`/`SALES` only.
- Never included in any customer-facing query or serialized response.
- Creating a note writes an `ActivityLog` entry (`NOTE_ADDED`).

---

## Enums

| Enum | Values |
|---|---|
| `Role` | `ADMIN`, `SALES`, `CUSTOMER` |
| `QuoteStatus` | `REQUESTED`, `QUOTED`, `ACCEPTED`, `DECLINED`, `FULFILLED` |
| `OrderStatus` | `PENDING`, `IN_PRODUCTION`, `SHIPPED`, `COMPLETED`, `CANCELLED` |
| `DocumentType` | `QUOTATION`, `INVOICE`, `CONTRACT`, `SPEC_SHEET` |
| `ActivityAction` | `QUOTE_REQUESTED`, `QUOTE_RESPONDED`, `QUOTE_ACCEPTED`, `QUOTE_DECLINED`, `ORDER_CREATED`, `ORDER_STATUS_CHANGED`, `DOCUMENT_UPLOADED`, `NOTE_ADDED`, `PROFILE_UPDATED` |

---

## Indexes

| Table | Index | Purpose |
|---|---|---|
| `Product` | `(categoryId, isPublished, sortOrder)` | Category catalog listing |
| `Product` | `slug` unique | Detail page lookup |
| `Quote` | `(customerProfileId, createdAt DESC)` | Customer dashboard |
| `Quote` | `(status, createdAt DESC)` | CRM queue |
| `Quote` | `reference` unique | Staff/customer lookup |
| `Order` | `(customerProfileId, createdAt DESC)` | Order history |
| `Document` | `customerProfileId`, `quoteId`, `orderId` | Attachment lookups |
| `ActivityLog` | `(customerProfileId, createdAt DESC)` | Customer history timeline |
| `CustomerProfile` | `companyName`, `contactName` | CRM search (FR-014) |

---

## Field-Level Visibility Matrix

Which fields each role may read. This is the contract the data-access layer enforces.

| Field | Public | Customer (own) | Sales | Admin |
|---|---|---|---|---|
| `Product.*` (published) | ✅ | ✅ | ✅ | ✅ |
| `Product.*` (unpublished) | ❌ | ❌ | ✅ | ✅ |
| `QuoteItem.unitPrice` / `lineTotal` | ❌ | ✅ once `QUOTED` | ✅ | ✅ |
| `QuoteItem.staffNotes` | ❌ | ❌ | ✅ | ✅ |
| `Quote.staffResponse` | ❌ | ✅ once `QUOTED` | ✅ | ✅ |
| Another customer's `Quote`/`Order`/`Document` | ❌ | ❌ | ✅ | ✅ |
| `InternalNote.*` | ❌ | ❌ | ✅ | ✅ |
| `ActivityLog.*` | ❌ | ❌ | ✅ | ✅ |
| `User` list / role management | ❌ | ❌ | ❌ | ✅ |
