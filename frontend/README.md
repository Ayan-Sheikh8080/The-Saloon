# The-Saloon

**The-Saloon** is a full-stack Salon Management SaaS application designed to help salons manage their daily operations, customers, staff, appointments, services, sales, payments, inventory, memberships, loyalty programs, and customer retention.

The project is currently focused on building the core salon-management platform, with **WhatsApp communication, retention automation, and AI-powered features planned as the next major development stages**.

---

## Project Status

The current implementation covers approximately **60–65% of the complete product blueprint**.

The core salon-management functionality is already implemented, including:

* Authentication
* Multi-tenant salon structure
* Customer management
* Staff management
* Services
* Appointments
* Appointment availability
* Sales and checkout
* Payments
* Inventory
* Loyalty points
* Memberships
* Marketing templates
* Customer retention foundation
* Dashboard and business statistics

The next major development milestone is **WhatsApp integration**, followed by automated reminders, retention automation, and AI-powered functionality.

---

# Features

## Authentication & Multi-Tenancy

The system supports multiple salons with users associated with their respective salons.

### User Roles

* Owner
* Manager
* Staff

The application uses Django REST Framework authentication and associates users with their salon through their profile.

---

## Customer Management

Salon owners and staff can manage customer information through the customer management module.

### Available functionality

* Create customers
* View customers
* Edit customer information
* Delete customers
* Customer search
* Phone number
* Email
* Date of birth
* Notes
* Marketing consent
* Customer appointments
* Customer sales
* Loyalty information
* Membership information

Customers act as a central entity connecting appointments, sales, loyalty, and memberships.

---

## Staff Management

The staff module allows salons to maintain their staff records.

### Staff information

* Name
* Title
* Phone
* Email
* Active/inactive status
* Salon association

Frontend routes include:

```text
/staff
/staff/new
/staff/[id]
```

---

## Services

Salon services can be created and managed from the application.

### Service information

* Service name
* Category
* Price
* Duration
* Active/inactive status
* Search

Services are connected with appointments and sales.

Frontend routes:

```text
/services
/services/new
/services/[id]
```

---

## Appointment Management

Appointments are one of the main components of the application.

Each appointment contains:

* Customer
* Staff member
* Service
* Start time
* End time
* Status
* Notes

### Appointment statuses

```text
pending
confirmed
checked_in
in_progress
completed
cancelled
no_show
```

The system also includes appointment availability checking.

Service duration is used to determine the appointment end time, and staff availability is checked to reduce appointment conflicts.

Frontend routes:

```text
/appointments
/appointments/new
/appointments/[id]
```

---

## Sales & Checkout

The project includes a complete foundation for salon sales and checkout.

The sales structure consists of:

```text
Sale
├── Customer
├── Appointment
├── Sale Items
├── Discount
├── Payments
└── Status
```

### Sale statuses

```text
open
paid
void
```

The application supports the workflow:

```text
Appointment
      ↓
Create Sale
      ↓
Add Service
      ↓
Checkout
      ↓
Payment
      ↓
Sale Completed
```

The checkout system calculates:

```text
Subtotal
- Discount
= Total
```

and tracks the amount paid through payment records.

### Payment methods

* Cash
* Card
* Other

---

## Inventory Management

The application includes product and inventory management.

### Products

Products contain information such as:

* Name
* SKU
* Price
* Cost
* Reorder level
* Active/inactive status

### Inventory transactions

The system supports inventory transaction types including:

```text
received
used
sold
correction
damaged
```

Current stock is calculated from inventory transactions, and low-stock conditions can be identified using the product reorder level.

Frontend routes:

```text
/inventory
/inventory/new
/inventory/[id]
```

---

## Loyalty System

The project includes a transaction-based customer loyalty system.

Loyalty transactions support:

```text
earned
redeemed
adjustment
expired
```

Customer loyalty information is connected with the sales system.

The application also contains functionality for awarding loyalty points after eligible sales.

---

## Memberships

Customers can be associated with membership plans.

### Membership plans include

* Name
* Description
* Discount percentage
* Duration
* Price
* Active/inactive status

The system can determine whether a customer's membership is currently active based on its expiry date.

Frontend route:

```text
/memberships
```

---

## Marketing & Customer Retention

The project currently contains the foundation for customer retention and marketing.

A message template system is available with supported placeholders such as:

```text
{customer_name}
{salon_name}
```

Frontend routes:

```text
/retention
/retention/templates
```

The current implementation provides the foundation for future automated retention campaigns.

The complete automated retention workflow is planned for a later development stage.

---

## Dashboard

The dashboard retrieves real backend data and provides an overview of salon activity.

Currently available information includes:

* Today's revenue
* Today's appointments
* Total customers
* Recent appointments

The dashboard is connected to the backend rather than relying solely on static frontend data.

---

# Frontend

The frontend is built using **Next.js**.

Major application routes include:

```text
/login

/dashboard

/customers
/customers/new
/customers/[id]

/staff
/staff/new
/staff/[id]

/services
/services/new
/services/[id]

/appointments
/appointments/new
/appointments/[id]

/inventory
/inventory/new
/inventory/[id]

/memberships

/retention
/retention/templates

/checkout/[id]
```

---

# Backend

The backend is built using **Django + Django REST Framework**.

The backend provides APIs for the major salon-management modules and connects the frontend application with the database.

The general architecture is:

```text
                THE-SALOON
                     │
          ┌──────────┴──────────┐
          │                     │
       Frontend              Backend
       Next.js             Django / DRF
          │                     │
          ├── Dashboard         │
          ├── Customers ────────┤
          ├── Staff ────────────┤
          ├── Services ─────────┤
          ├── Appointments ─────┤
          ├── Checkout ─────────┤
          ├── Inventory ────────┤
          ├── Memberships ──────┤
          └── Retention ────────┤
                                │
                             Database
```

---

# Core Data Relationships

The major business entities are interconnected.

```text
Customer
   │
   ├── Appointments
   │       ├── Service
   │       └── Staff
   │
   ├── Sales
   │       └── Payments
   │
   ├── Loyalty
   │
   └── Membership
```

This allows the application to maintain customer history across different salon operations.

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* CSS / frontend styling

## Backend

* Python
* Django
* Django REST Framework

## Database

* Relational database
* Development configuration may use SQLite
* PostgreSQL can be used for production deployment

## Authentication

* Django REST Framework authentication

---

# Running the Frontend

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Running the Backend

Navigate to the backend directory and activate your Python environment.

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend API will normally be available at:

```text
http://127.0.0.1:8000/
```

---

# Current Product Roadmap

The project is being developed according to the Salon SaaS product blueprint.

The current implementation has largely covered the **foundation, core operations, and revenue-management stages**.

## Completed / Mostly Completed

```text
Foundation
    ↓
Authentication
Multi-tenancy
Customers
Staff
Services

Core Operations
    ↓
Appointments
Availability
Customer Management

Revenue Operations
    ↓
Sales
Checkout
Payments
Inventory
Loyalty
Memberships
Dashboard
```

---

# Next Development Stage

The next major feature planned for The-Saloon is:

## WhatsApp Integration

The first WhatsApp milestone will focus on normal automated communication rather than AI.

Planned functionality includes:

```text
Appointment Created
        ↓
WhatsApp Confirmation
        ↓
Scheduled Reminder
        ↓
WhatsApp Reminder
```

Future WhatsApp functionality will include:

* Appointment confirmations
* Appointment reminders
* Cancellation notifications
* Rescheduling communication
* Rebooking messages
* Customer communication
* Promotional campaigns

---

# Future Roadmap

After the initial WhatsApp integration, development will proceed toward:

```text
1. WhatsApp Integration
          ↓
2. Background Jobs
   Redis + Celery
          ↓
3. Automated Appointment Reminders
          ↓
4. Retention Automation
          ↓
5. AI Message Generation
          ↓
6. AI Receptionist
          ↓
7. AI Business Advisor
```

### AI Receptionist

The planned AI receptionist will eventually be able to assist customers through WhatsApp with tasks such as:

```text
Customer Request
       ↓
AI
       ↓
Understand Request
       ↓
Check Availability
       ↓
Suggest Available Slots
       ↓
Customer Confirmation
       ↓
Create Appointment
```

The AI layer will use controlled backend operations rather than directly modifying the database.

---

# Project Progress

Approximate feature-level progress against the complete product blueprint:

| Area                 | Status         |
| -------------------- | -------------- |
| Authentication       | 🟢 Implemented |
| Multi-tenancy        | 🟢 Implemented |
| Customers / CRM      | 🟢 Implemented |
| Staff                | 🟢 Implemented |
| Services             | 🟢 Implemented |
| Appointments         | 🟢 Implemented |
| Availability         | 🟢 Implemented |
| Sales / POS          | 🟢 Implemented |
| Payments             | 🟢 Implemented |
| Inventory            | 🟢 Implemented |
| Loyalty              | 🟢 Implemented |
| Memberships          | 🟢 Implemented |
| Dashboard            | 🟢 Implemented |
| Marketing Templates  | 🟢 Implemented |
| Retention Automation | 🟡 Partial     |
| WhatsApp             | 🔴 Planned     |
| Background Jobs      | 🔴 Planned     |
| AI Receptionist      | 🔴 Planned     |
| AI Rebooking         | 🔴 Planned     |
| AI Business Advisor  | 🔴 Planned     |

**Overall feature progress: approximately 60–65%.**

This percentage represents progress toward the complete product blueprint and is not a measure of code quality or production readiness.

---

# Project Goal

The long-term goal of **The-Saloon** is to provide salons with a unified SaaS platform for:

```text
Salon Operations
       +
Customer Management
       +
Appointments
       +
Sales & Payments
       +
Inventory
       +
Loyalty & Memberships
       +
WhatsApp Communication
       +
Customer Retention
       +
AI-powered Assistance
```

The project is currently focused on completing the communication and retention layer on top of the already-established salon operations platform.
