# Feature Specification: B2B Textile Company Website with Customer Portal & Internal CRM

**Feature Branch**: `[001-b2b-textile-portal-crm]`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Build a B2B textile company website with a customer portal and an internal CRM. This is not a public e-commerce store — no pricing is shown to visitors and there is no payment gateway anywhere in the system. There are three user roles: Admin, Sales staff, and Customer. [full brief covering public site, homepage layout, brand identity, customer portal, admin CRM, role differences, and non-functional requirements]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Products & Request a Quote (Priority: P1)

A visitor arrives at the site, learns about the company, browses one of the four product categories (Hospitality, Health-Care, Institutional/Laundry, Commercial/Automotive), opens a product detail page, and submits a "Request a Quote" for one or more products — without needing to create an account first.

**Why this priority**: This is the core lead-generation function of the site. Without it, the company has no way to convert site visitors into sales opportunities, and every other capability (CRM, customer portal) has nothing to operate on.

**Independent Test**: Can be fully tested by browsing to a product from a category listing, adding it to a quote request (alone or alongside other products), submitting it with contact details, and confirming the visitor receives acknowledgment that the request was received — all without logging in and without any pricing ever being shown.

**Acceptance Scenarios**:

1. **Given** a visitor is on the homepage, **When** they select a product category, **Then** they see a catalog of products in that category with no pricing displayed.
2. **Given** a visitor is viewing a product detail page, **When** they choose to request a quote, **Then** they can add that product to a quote request and submit it without being required to log in.
3. **Given** a visitor has added multiple products across one or more categories to a quote request, **When** they submit it, **Then** the system captures all selected products as a single quote request and confirms submission to the visitor.
4. **Given** a quote request has been submitted, **When** the visitor checks the page afterward, **Then** no price or payment information is shown anywhere on the public site.

---

### User Story 2 - Staff Respond to Quote Requests (Priority: P2)

A Sales staff member or Admin opens a newly submitted quote request in the CRM, reviews the requested products, and responds with pricing and an updated status. The requesting customer is then able to see that their quote has been priced.

**Why this priority**: A quote request has no business value until someone responds to it. This closes the loop between lead capture (P1) and an actual sales conversation, and is the second-most critical function after capturing the request itself.

**Independent Test**: Can be fully tested by opening a newly requested quote in the CRM as Sales staff or Admin, attaching pricing and moving it to "quoted," saving the response, and confirming the pricing and status are visible only to internal staff and the requesting customer — never on any public page.

**Acceptance Scenarios**:

1. **Given** a new quote request exists, **When** Sales staff or Admin opens it, **Then** they can see all requested products and the requester's contact details.
2. **Given** Sales staff or Admin is viewing a quote request, **When** they add pricing and set a status, **Then** the response is saved and is visible only to internal staff and the requesting customer.
3. **Given** a quote has been responded to, **When** an unauthenticated visitor or unrelated customer attempts to view it, **Then** access is denied.

---

### User Story 3 - Customer Registration & Self-Service Portal (Priority: P3)

A visitor signs up for a customer account (or logs into an existing one) and reaches a personal dashboard where they can track the status of their quote requests, review their order history, and view and download their documents.

**Why this priority**: This gives returning customers a reason to register and turns one-off quote requesters into an ongoing relationship, but the business can still function (via P1 + P2) before this exists.

**Independent Test**: Can be fully tested by registering a new customer account, logging in, and confirming the dashboard shows that customer's own quote statuses, order history, and documents — and nothing belonging to any other customer.

**Acceptance Scenarios**:

1. **Given** a visitor without an account, **When** they sign up with their details, **Then** a customer account is created and they can log in.
2. **Given** a logged-in customer, **When** they open their dashboard, **Then** they see the status (requested, quoted, accepted, declined, or fulfilled) of every quote request they have submitted, and can accept or decline any quote currently in "quoted" status.
3. **Given** a logged-in customer, **When** they view their order history, **Then** they see only orders associated with their own account.
4. **Given** a logged-in customer, **When** they open their documents area, **Then** they can view and download their own quotations, invoices, contracts, and spec sheets.
5. **Given** a logged-in customer, **When** they edit their profile, **Then** the changes are saved to their account.

---

### User Story 4 - Convert Quotes to Orders & Manage Documents (Priority: P4)

Once a customer's quote has been accepted, Sales staff or Admin convert it into an order, and staff can upload and manage documents (quotations, invoices, contracts, spec sheets) tied to a specific customer, quote, or order.

**Why this priority**: This extends the quote lifecycle (P2) into fulfillment record-keeping, which is necessary for a complete CRM but depends on quotes already existing.

**Independent Test**: Can be fully tested by taking a quote request with status "accepted," converting it to an order as Sales staff or Admin, uploading a document against that order, and confirming the order and document appear correctly in the customer's portal (P3) and in the CRM.

**Acceptance Scenarios**:

1. **Given** a quote request has status "accepted," **When** Sales staff or Admin converts it, **Then** a new order is created and linked to that customer and quote.
2. **Given** a quote request has not been accepted, **When** staff attempt to convert it, **Then** the system prevents the conversion.
3. **Given** Sales staff or Admin is viewing a customer, quote, or order, **When** they upload a document, **Then** the document is stored and associated with the correct customer, quote, or order.
4. **Given** a document has been uploaded against a customer's order, **When** that customer logs into their portal, **Then** they can view and download it.

---

### User Story 5 - Complete Customer Relationship History (Priority: P5)

Sales staff or Admin search for a customer and see that customer's complete history in one place: profile information, every quotation, every order, every document, and a log of past interactions — with the ability to add internal notes.

**Why this priority**: This is the depth feature of the CRM — valuable for ongoing account management, but the business can operate with the essentials (P1–P4) before this consolidated view exists.

**Independent Test**: Can be fully tested by searching for a customer in the CRM and confirming their profile, quotes, orders, documents, and activity log all appear together, and that an internal note added to their record is saved and stays invisible to the customer.

**Acceptance Scenarios**:

1. **Given** Sales staff or Admin searches for a customer, **When** results are returned, **Then** they can open a single view containing that customer's profile, quotes, orders, documents, and activity log.
2. **Given** Sales staff or Admin is viewing a customer record, **When** they add an internal note, **Then** the note is saved to the record and is never visible to the customer.
3. **Given** a customer interacts with the system (submits a quote, is quoted, gets an order), **When** staff later view that customer's activity log, **Then** those interactions appear in chronological order.

---

### User Story 6 - Role-Based Access Enforcement (Priority: P6)

The system enforces that Admins have full access including user and role management, Sales staff can manage customers/quotes/orders/documents but cannot manage user accounts or roles, and Customers can only ever see their own data.

**Why this priority**: Access boundaries are a cross-cutting safety requirement. It is listed last only because it constrains capabilities delivered by earlier stories rather than adding a new one — but it must hold from the first release that includes staff accounts.

**Independent Test**: Can be fully tested by attempting, as each role, to perform an action outside that role's permissions (e.g., Sales staff trying to create a user account, a Customer trying to open another customer's dashboard) and confirming every such attempt is blocked.

**Acceptance Scenarios**:

1. **Given** a logged-in Admin, **When** they access user/role management, **Then** they can create, modify, deactivate, or change the role of any user account.
2. **Given** a logged-in Sales staff member, **When** they attempt to access user/role management, **Then** the system denies access.
3. **Given** a logged-in Customer, **When** they attempt to access any other customer's quotes, orders, documents, or profile, **Then** the system denies access.
4. **Given** a logged-in Sales staff member, **When** they access customers, quotes, orders, and documents, **Then** they can view and manage them per their role's permissions.

---

### Edge Cases

- What happens when an anonymous visitor submits a quote request and later registers a customer account using the same email address — is the earlier request linked to the new account?
- What happens when a quote request references a product that is later removed or discontinued from the catalog before staff respond to it?
- How does the system handle a single quote request containing products from more than one category?
- What happens when Sales staff or Admin attempts to convert a quote that is still "requested" or has been "declined" into an order?
- What happens when an uploaded document exceeds an allowed file size or is an unsupported file type?
- What happens when an Admin deactivates a Sales staff account that has open quote requests or notes assigned to it?
- How does the system behave when two staff members view or edit the same customer record at the same time?

## Requirements *(mandatory)*

### Functional Requirements

**Public Site**

- **FR-001**: System MUST allow unauthenticated visitors to view company profile pages: Home, About, and Contact.
- **FR-002**: System MUST allow visitors to browse four product categories: Hospitality, Health-Care, Institutional/Laundry, and Commercial/Automotive.
- **FR-003**: System MUST present a product catalog within each category, with an individual detail page per product.
- **FR-004**: System MUST NOT display pricing information anywhere on public, unauthenticated pages.
- **FR-005**: System MUST allow any visitor, with or without an account, to submit a "Request a Quote" covering one or more products in a single submission.
- **FR-006**: System MUST allow a visitor to sign up for a customer account and to log in.
- **FR-007**: The homepage MUST present, in order: (a) a dark-background header/hero containing the logo, navigation links to each product category plus About and Contact, a "Register" link, a hero heading with short intro text, and a "Get Started" call-to-action; (b) a content showcase section with an intro line above a grid of visual tiles that each link to a category or catalog page; (c) a horizontally scrollable category carousel with previous/next controls, one card per product category; (d) a video section presenting two videos side by side (company/product overview and manufacturing process); (e) a coverage/reach section pairing descriptive text with a map graphic; (f) a footer with logo, a short company blurb, and link columns for Categories, Useful Links, and Manufacturing.
- **FR-008**: Product detail pages MUST present the product's hero image on a white background with a thin gold frame, consistent with the site's premium brand identity (warm ivory/navy base, blue as the primary action color, gold and burgundy as premium accents, and maroon/olive/cognac/forest-green/oxblood as supporting accent tones).

**Customer Portal**

- **FR-009**: System MUST allow an authenticated customer to view the status (requested, quoted, accepted, declined, or fulfilled) of each of their own quote requests, and to accept or decline any quote currently in "quoted" status.
- **FR-010**: System MUST allow an authenticated customer to view their own full order history.
- **FR-011**: System MUST allow an authenticated customer to view and download their own documents (quotations, invoices, contracts, spec sheets).
- **FR-012**: System MUST allow an authenticated customer to view and update their own profile information.
- **FR-013**: System MUST restrict a customer to only ever seeing their own quotes, orders, documents, and profile — never another customer's data.

**Admin / Sales CRM**

- **FR-014**: System MUST allow Admin and Sales staff to view and search across all customers, quotes, and orders.
- **FR-015**: System MUST allow Admin and Sales staff to respond to a quote request with pricing and an updated status; this pricing and response MUST be visible only to the requesting customer and internal staff, and MUST NEVER be exposed on any public page.
- **FR-016**: System MUST allow Admin and Sales staff to convert an accepted quote request into an order.
- **FR-017**: System MUST maintain, for every customer, a complete history consisting of their profile information, every quotation, every order, every document, and a chronological activity log of interactions with that customer.
- **FR-018**: System MUST allow Admin and Sales staff to upload and manage documents tied to a specific customer, quote, or order.
- **FR-019**: System MUST allow Admin and Sales staff to add internal notes to a customer record; internal notes MUST NOT be visible to the customer.

**Roles & Access**

- **FR-020**: System MUST support three distinct roles — Admin, Sales staff, and Customer — each restricted to a defined set of permitted actions.
- **FR-021**: Only Admin MUST be able to create, modify, deactivate, or change the role of a user account.
- **FR-022**: Sales staff MUST be able to manage customers, quotes, orders, and documents, and MUST NOT be able to manage user accounts or roles.
- **FR-023**: System MUST NOT provide any payment gateway, checkout flow, or payment-processing capability anywhere.
- **FR-024**: System MUST NOT display pricing to unauthenticated or public visitors under any circumstance.

**Non-Functional**

- **FR-025**: All public pages (home, about, contact, category, catalog, and product detail pages) MUST be structured for search-engine discoverability (crawlable content, descriptive titles and headings).
- **FR-026**: The public site (including the homepage layout and category carousel), the customer portal, and the admin CRM dashboard MUST all render correctly and remain fully usable on mobile, tablet, and desktop screen sizes.

### Key Entities

- **Visitor**: An unauthenticated person browsing the public site; may submit a quote request without registering.
- **Customer**: A registered account holder, tied to one individual person, with a linked profile carrying their company name and contact details. Can submit quote requests and access the customer portal to see only their own quotes, orders, documents, and profile.
- **Admin**: Staff role with full system access, including user and role management.
- **Sales Staff**: Staff role that manages customers, quotes, orders, and documents but cannot manage user accounts or roles. Sales staff have full visibility across all customers/quotes/orders (no per-rep assignment/ownership restriction).
- **Product**: A catalog item belonging to exactly one Category, with descriptive detail-page content; never displays a price on public pages.
- **Category**: One of the four fixed product lines — Hospitality, Health-Care, Institutional/Laundry, Commercial/Automotive.
- **Quote Request**: A submission (from a Visitor or Customer) referencing one or more Products, carrying a status of requested, quoted, accepted, declined, or fulfilled. Once staff attach pricing ("quoted"), the requesting customer accepts or declines it in-portal; staff then mark it "fulfilled" once the resulting order is complete. Pricing and response details are visible only to staff and the requesting customer.
- **Order**: Created only by converting an accepted Quote Request; linked to the originating customer and quote.
- **Document**: A file (quotation, invoice, contract, or spec sheet) attached to a Customer, Quote Request, or Order; downloadable by the owning customer and by internal staff.
- **Activity Log Entry**: A record of an interaction or event tied to a Customer (e.g., quote submitted, quote responded to, order created, document uploaded, note added).
- **Internal Note**: A staff-authored note attached to a Customer record, visible only to Admin and Sales staff.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can find a product and submit a quote request in under 3 minutes without creating an account.
- **SC-002**: Staff can open a newly submitted quote request and save a priced response in under 5 minutes.
- **SC-003**: An audit of every publicly accessible page finds zero instances of pricing or payment-related content.
- **SC-004**: A logged-in customer can find the current status of any of their quote requests within 2 clicks of reaching their dashboard.
- **SC-005**: A logged-in customer can locate and download any of their documents within 3 clicks of reaching their dashboard.
- **SC-006**: Staff can pull up a customer's complete history (profile, quotes, orders, documents, activity log) from a single search in under 30 seconds.
- **SC-007**: The homepage, category carousel, customer portal, and admin CRM dashboard all render with full functionality across mobile, tablet, and desktop viewport widths.
- **SC-008**: 100% of attempts by Sales staff to reach user/role management are blocked.
- **SC-009**: 100% of attempts by a customer to view another customer's quotes, orders, documents, or profile are blocked.

## Assumptions

- Anonymous (non-account) quote requesters are notified of status/pricing updates by email, since in-portal status tracking requires a logged-in customer account.
- A quote request may contain multiple product line items, each optionally carrying a quantity and free-text notes; no other line-item detail was specified.
- Customer account registration is self-service (no manual Admin approval step) since none was mentioned in the brief.
- Authentication uses a standard email/password, session-based login; no SSO or third-party identity provider was requested.
- Uploaded documents are limited to common business file formats (e.g., PDF, Word, Excel, images) with a reasonable per-file size limit; exact formats/limits were not specified and are left to implementation policy.
- Activity log entries are generated automatically from system actions (quote submitted, quote responded to, order created, document uploaded, note added) rather than requiring staff to log every interaction manually.
- Product catalog content (categories, products, detail-page content, images) is authored and maintained by Admin/Sales staff; the specific catalog-authoring workflow was not detailed in the brief and is assumed to follow standard create/edit/publish patterns.
- No data retention period was specified; standard industry practice (retain customer, quote, order, and document records indefinitely unless removal is requested) applies.
- Multi-language support, public pricing, and payment processing are explicitly out of scope, per the brief.
