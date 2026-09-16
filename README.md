# The-Saloon

A multi-tenant SaaS platform for salons, barbershops, and beauty businesses — appointments, customers, staff, payments, and AI/WhatsApp-assisted retention, built as a modular Django monolith with a Next.js frontend.

## Project Structure

- `frontend/` — Next.js 16 (App Router, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query)
- `backend/` — Django REST Framework API (modular monolith)
- `docs/` — API documentation and project docs

## Current Status

**Implemented:**
- Token-based authentication (register, login, current-user endpoint)
- Multi-tenant salon architecture with role-based access (owner / manager / staff)
- Backend-enforced tenant isolation — every request is scoped to the authenticated user's salon, verified with cross-tenant access tests
- Customer, Staff, and Service CRUD — create, list, search, update, delete — all tenant-isolated
- Full dashboard UI: sidebar navigation, list views with live counts, avatars, status badges, empty states, and add/edit/delete forms for all three modules

**Planned next:** Appointments (with availability logic), POS/Payments, Dashboard/analytics, Retention automation, WhatsApp and AI integration. See `docs/API.md` for the full endpoint contract and the product blueprint in `docs/` for the complete roadmap.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL (SQLite in local development) |
| Auth | DRF Token Authentication |

## Getting Started

### Backend

```bash
cd backend
source venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Runs at `http://127.0.0.1:8000`. API is served under `/api/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`. Requires the backend running for API calls to succeed.

## API Documentation

Full endpoint reference — methods, request/response bodies, auth requirements, and error cases — is maintained in [`docs/API.md`](./docs/API.md).

## Multi-Tenancy

Every salon-owned record (customers, and future modules) belongs to exactly one salon via a `salon` foreign key. All queries are automatically filtered to the authenticated user's own salon at the backend — a user from one salon can never read, edit, or delete another salon's data, even by guessing record IDs directly.

## Git Workflow

- `main` is always stable
- One feature = one branch = one Pull Request
- Feature branches: `feature/<name>`