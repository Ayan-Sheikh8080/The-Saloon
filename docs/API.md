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