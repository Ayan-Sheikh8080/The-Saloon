# Salon SaaS API

## Backend

- Framework: Django REST Framework
- Base URL: http://127.0.0.1:8000/api/

## Frontend

- Framework: Next.js
- Development URL: http://localhost:3000

## Current Modules

- Accounts
- Salons

## Planned Modules

- Customers
- Staff
- Services
- Appointments
- Sales
- Payments
- Dashboard
- Retention
- AI

## Authentication Endpoints

All request/response bodies are JSON. Base URL: `http://127.0.0.1:8000/api/`

### POST /auth/register/

Creates a new User, a new Salon, and a UserProfile with role `owner`, in one transaction.

**Authentication required:** No

**Request body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string (min 8 chars)",
  "salon_name": "string"
}
```

**Success response — 201 Created:**
```json
{
  "token": "string",
  "user": { "id": 1, "username": "string", "email": "string" },
  "salon": { "id": 1, "name": "string" },
  "role": "owner"
}
```

**Error responses:**
- `400 Bad Request` — validation errors (e.g. `{"username": ["This username is already taken."]}`, `{"email": ["This email is already registered."]}`, or missing/invalid fields)

---

### POST /auth/login/

Authenticates an existing user and returns their token.

**Authentication required:** No

**Request body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success response — 200 OK:**
```json
{
  "token": "string",
  "user": { "id": 1, "username": "string", "email": "string" },
  "salon": { "id": 1, "name": "string" },
  "role": "owner"
}
```

**Error responses:**
- `400 Bad Request` — `{"detail": "Username and password are required."}`
- `401 Unauthorized` — `{"detail": "Invalid credentials."}`

---

### GET /auth/me/

Returns the currently authenticated user's profile, salon, and role.

**Authentication required:** Yes — header `Authorization: Token <token>`

**Success response — 200 OK:**
```json
{
  "user": { "id": 1, "username": "string", "email": "string" },
  "salon": { "id": 1, "name": "string" },
  "role": "owner"
}
```

**Error responses:**
- `401 Unauthorized` — `{"detail": "Authentication credentials were not provided."}`

---

**Auth header format for all protected endpoints:**

## Customer Endpoints

All endpoints require `Authorization: Token <token>`. All results are automatically scoped to the authenticated user's salon — a request can never see, edit, or delete another salon's customers.

### GET /customers/

List all customers belonging to the authenticated user's salon.

**Query params:** `?search=<text>` — filters by name or phone (partial match)

**Success response — 200 OK:**
```json
[
  {
    "id": 1,
    "salon": 1,
    "name": "string",
    "phone": "string",
    "email": "string",
    "date_of_birth": "YYYY-MM-DD or null",
    "notes": "string",
    "created_at": "ISO datetime",
    "updated_at": "ISO datetime"
  }
]
```

### POST /customers/

Create a customer under the authenticated user's salon. `salon` is set automatically — do not send it.

**Request body:**
```json
{
  "name": "string (required)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "date_of_birth": "YYYY-MM-DD (optional)",
  "notes": "string (optional)"
}
```

**Success response — 201 Created:** same shape as list item above.

**Error responses:**
- `400 Bad Request` — validation errors (e.g. missing `name`)
- `401 Unauthorized` — no/invalid token

### GET /customers/{id}/

Retrieve a single customer. Returns `404` if the customer doesn't exist **or** belongs to a different salon (tenant isolation — never reveals existence of other salons' data).

### PUT/PATCH /customers/{id}/

Update a customer. Same tenant rules as above — `404` if not owned by your salon.

**Request body (PATCH, partial):**
```json
{ "phone": "string" }
```

### DELETE /customers/{id}/

Delete a customer. Same tenant rules — `404` if not owned by your salon.

**Success response:** `204 No Content`

## Staff Endpoints

Same auth/tenant rules as Customers (see above).

### GET /staff/
List staff for the authenticated user's salon. `?search=<text>` filters by name or title.

### POST /staff/
```json
{
  "name": "string (required)",
  "title": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "is_active": "boolean (optional, default true)"
}
```

### GET/PUT/PATCH/DELETE /staff/{id}/
Same tenant rules as Customers — `404` if not owned by your salon.

## Service Endpoints

Same auth/tenant rules as Customers.

### GET /services/
List services for the authenticated user's salon. `?search=<text>` filters by name.

### POST /services/
```json
{
  "name": "string (required)",
  "category": "string (optional)",
  "price": "decimal string, e.g. \"1200.00\" (required)",
  "duration_minutes": "integer (required)",
  "is_active": "boolean (optional, default true)"
}
```

### GET/PUT/PATCH/DELETE /services/{id}/
Same tenant rules as Customers.

## Appointment Endpoints

Same auth/tenant rules as Customers.

### GET /appointments/availability/?staff=<id>&service=<id>&date=YYYY-MM-DD

Returns available start times for a staff member + service on a given date, respecting business hours, existing bookings, and buffer time.

**Success response — 200 OK:**
```json
{ "slots": ["2026-09-20T09:00:00+00:00", "2026-09-20T09:15:00+00:00", "..."] }
```

### GET /appointments/
List appointments for the authenticated user's salon. `?date=YYYY-MM-DD` and `?staff=<id>` filter results.

### POST /appointments/
```json
{
  "customer": "id (required)",
  "staff": "id (required)",
  "service": "id (required)",
  "start_at": "ISO datetime (required)",
  "notes": "string (optional)"
}
```
`end_at` is computed automatically from the service's duration. The server re-checks availability at creation time — returns `409 Conflict` if the slot was taken between checking availability and booking.

**Error responses:**
- `400 Bad Request` — missing fields, invalid staff/service ID
- `409 Conflict` — slot no longer available

### GET/PATCH/DELETE /appointments/{id}/
Same tenant rules as Customers. PATCH can update `status` (e.g. to `confirmed`, `completed`, `cancelled`, `no_show`), `notes`, or reschedule via `start_at`.

## Sale / Payment Endpoints

Same auth/tenant rules as Customers.

### POST /sales/from-appointment/
Creates a Sale pre-filled from a completed appointment's service (idempotent — calling again for the same appointment returns the existing sale).
```json
{ "appointment": "id (required)" }
```

### POST /sales/{id}/pay/
Records a payment against a sale. Marks the sale `paid` once payments cover the total.
```json
{ "method": "cash | card | other", "amount": "decimal string" }
```

### GET /sales/
List sales for the salon. `?date=YYYY-MM-DD` filters by creation date.

### GET /sales/{id}/
Full sale detail including items, payments, subtotal, total, amount_paid.

## Dashboard Endpoint

### GET /dashboard/
Returns today's revenue, today's appointment count, total customers, and the 5 most recent appointments — scoped to the authenticated user's salon.

## Inventory Endpoints

Same auth/tenant rules as Customers.

### GET /products/
List products for the salon. `?search=<text>` filters by name. `?low_stock=true` returns only products at or below their reorder level.

### POST /products/
```json
{
  "name": "string (required)",
  "sku": "string (optional)",
  "price": "decimal string (required)",
  "cost": "decimal string (optional, default 0)",
  "reorder_level": "integer (optional, default 5)",
  "initial_quantity": "integer (optional) — creates an initial 'received' transaction"
}
```

### GET/PUT/PATCH/DELETE /products/{id}/
Same tenant rules as Customers. Response includes computed `stock_quantity` and `is_low_stock`.

### GET /products/{id}/transactions/
Full transaction history for a product (audit trail).

### POST /products/{id}/transactions/
Records a stock adjustment — the only way stock quantity changes.
```json
{
  "quantity_delta": "integer, positive for stock in, negative for stock out (required)",
  "reason": "received | used | sold | correction | damaged (required)",
  "notes": "string (optional)"
}
## Retention Endpoints

### GET /customers/due-for-rebooking/

Returns customers who are overdue for a repeat visit, based on their historical average interval between completed appointments. Requires at least 2 completed appointments to calculate a pattern.

**Query params:** `?template=<id>` — attaches a rendered `draft_message` to each result using the given MessageTemplate.

**Success response — 200 OK:**
```json
[
  {
    "customer_id": 5,
    "customer_name": "string",
    "last_visit": "YYYY-MM-DD",
    "days_since_last_visit": 64,
    "average_interval_days": 20.0,
    "is_due": true,
    "days_overdue": 44,
    "draft_message": "string (only present if ?template= was passed)"
  }
]
```

## Message Template Endpoints

Same auth/tenant rules as Customers.

### GET/POST /marketing/templates/
List or create message templates. `body` supports `{customer_name}` and `{salon_name}` placeholders.

### GET/PUT/PATCH/DELETE /marketing/templates/{id}/
Standard CRUD, tenant-isolated.