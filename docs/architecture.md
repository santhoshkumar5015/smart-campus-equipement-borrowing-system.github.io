# Smart Campus Equipment Borrowing System - System Architecture

## Architecture Overview

The **Smart Campus Equipment Borrowing System** follows a decoupled 3-tier RESTful Web Application architecture:

```
┌─────────────────────────────────────────────────────────┐
│              Single Page Application (SPA)              │
│       (HTML5 / Modern Glassmorphism CSS3 / JS)          │
│   • Student Catalog & Borrowing Portal                 │
│   • IoT Smart Locker & Kiosk Simulator                  │
│   • Lab Admin Management & Analytics Portal             │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Python 3 REST API Server                  │
│   • Business Rule Engine (BR-01 to BR-10 Enforcer)      │
│   • Role-Based Access Control (RBAC) Security           │
│   • Audit Logging & Telemetry Engine                    │
└────────────────────────────┬────────────────────────────┘
                             │ SQL Queries
                             ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite Relational Database                 │
│   • users, equipment, borrow_requests, returns, logs    │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Stack & Dependencies

- **Frontend**: Standard HTML5, Modular CSS3 (Custom Variables, Flexbox/Grid, Glassmorphism, Micro-animations), Vanilla JavaScript ES6+, Lucide SVG Icons, HTML5 Canvas QR Generator.
- **Backend API**: Python 3 HTTP Server (`http.server` & custom REST router). Zero external framework dependencies required for runtime.
- **Database**: SQLite3 relational database (`smart_campus.db`).
- **Test Automation**: Standard `unittest` suite (`test_business_rules.py`).

---

## Security Architecture (15% Assessment Requirement)

1. **Role-Based Authorization (RBAC)**:
   - Evaluates incoming request headers (`X-User-Role`).
   - Admin-only routes (`PUT /api/borrow-requests/:id/approve`, `PUT /api/borrow-requests/:id/reject`, `POST /api/equipment`) return `403 Forbidden` if invoked by student role (enforces **BR-07**).

2. **Input Sanitation & Error Responses**:
   - Rejects malformed dates, invalid IDs, missing required fields with structured `400 Bad Request` or `404 Not Found` JSON payloads (**BR-09**).

3. **Audit Trail Logging**:
   - All state-changing transactions (Creation, Approval, Rejection, Locker Pickup, Return) write immutable audit records to `audit_logs` table.
