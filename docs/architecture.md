# SmartCampus EquipBorrow - System Architecture

## Architecture Overview

**SmartCampus EquipBorrow** is a student-focused college equipment borrowing, approval, loan tracking, return, and maintenance management platform following a decoupled 3-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                 Single Page Application                 │
│         (HTML5 / Modern Glassmorphism CSS3 / JS)        │
│   • Student Portal: Auth, Catalog, Borrow Form, Pass QR │
│   • Admin Portal: 6-Metric Dashboard, Approvals, Loans, │
│     Returns, Maintenance Pipeline, Security Audit Stream│
└────────────────────────────┬────────────────────────────┘
                             │ HTTP REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Python REST API Server (server.py)           │
│   • Business Rule Engine (BR-01 to BR-20 Validation)    │
│   • RBAC Authorization & Security Auditing              │
│   • Damaged Return -> Maintenance Automation Pipeline   │
└────────────────────────────┬────────────────────────────┘
                             │ SQL Queries
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Relational SQLite / SQL Database           │
│   • users, students, categories, equipment, requests,   │
│     loans, returns, maintenance, notifications, logs    │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Stack & Dependencies

- **Frontend**: Standard HTML5, Modular CSS3 (Custom Variables, Flexbox/Grid, Glassmorphism, Solenoid Animations), Vanilla JavaScript ES6+, Lucide SVG Icons, Canvas 2D QR Code Generator.
- **Backend REST API**: Python 3 Server (`http.server` & custom REST router). Zero external dependencies required.
- **Database**: SQLite3 relational database (`smart_campus.db`).
- **Test Automation**: Standard `unittest` suite (`test_business_rules.py`).
