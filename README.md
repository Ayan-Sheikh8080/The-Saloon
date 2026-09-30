# The-Saloon

A multi-tenant platform for salons, barbershops, and beauty businesses. The current application includes authentication, salon-scoped customer, staff, and service management, and a Next.js dashboard. Appointments, payments, analytics, retention automation, WhatsApp, and AI features are planned.

## Project Structure

- `frontend/` — Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and TanStack Query
- `backend/` — Django REST Framework modular monolith
- `docs/` — API reference and product documentation

## Current Status

**Implemented:**
- Token-based registration, login, and current-user endpoint
- Multi-tenant salon structure with owner, manager, and staff roles
- Backend tenant isolation, including cross-tenant access tests
- Tenant-scoped CRUD and search for customers, staff, and services
- Dashboard navigation and list views for customers, staff, and services
- Live counts, avatars, status badges, empty states, and add/edit/delete forms

**Not yet implemented:**
- Appointments and availability
- POS and payments
- Dashboard analytics
- Retention automation
- WhatsApp and AI integrations

See [`docs/API.md`](./docs/API.md) for the current API contract and the project documentation in `docs/` for the roadmap.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL; SQLite for local development |
| Authentication | DRF Token Authentication |

## Getting Started

### Backend

From the repository root, run these commands in PowerShell:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000` under `/api/`.

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and requires the backend to be running for API requests.

## Multi-Tenancy

Customers, staff, and services are associated with a salon. Backend queries are scoped to the authenticated user's salon, preventing users from accessing another salon's records, including by guessing record IDs.

## Git Workflow

- Keep `main` stable.
- Use one feature branch and pull request per feature.
- Name feature branches `feature/<name>`.