# Database & Business Rules Design Document

## Database Schema (Relational ER Model)

```sql
-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student'
);

-- Equipment Table
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    specifications TEXT,
    serial_number TEXT UNIQUE,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available',
    condition TEXT DEFAULT 'Excellent',
    battery_level INTEGER DEFAULT 100,
    locker_id TEXT NOT NULL,
    requires_approval INTEGER DEFAULT 0,
    image_icon TEXT DEFAULT 'box'
);

-- Borrow Requests Table
CREATE TABLE borrow_requests (
    id TEXT PRIMARY KEY,
    equipment_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    borrow_date TEXT NOT NULL,
    return_date TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    rejection_reason TEXT,
    qr_code_token TEXT NOT NULL,
    pickup_locker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Returns Table
CREATE TABLE returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT NOT NULL,
    returned_at TEXT NOT NULL,
    condition TEXT NOT NULL,
    remarks TEXT,
    FOREIGN KEY (request_id) REFERENCES borrow_requests(id)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_info TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL
);
```

---

## 10 Core Business Rules (BR-01 to BR-10)

| Rule ID | Name | Constraint Description | HTTP Response Code |
|---|---|---|---|
| **BR-01** | Equipment Availability | Students cannot request equipment with status `'Maintenance'`. | `400 Bad Request` |
| **BR-02** | Date Validation | `borrow_date` cannot be in the past (before current time). | `400 Bad Request` |
| **BR-03** | Return Date Sequence | `return_date` must be strictly after `borrow_date`. | `400 Bad Request` |
| **BR-04** | Overlapping Bookings | Equipment cannot be reserved/borrowed for overlapping date ranges. | `400 Bad Request` |
| **BR-05** | Borrowing Limit | A student can have at most **2 active borrowings** (`Pending`, `Approved`, `CheckedOut`). | `400 Bad Request` |
| **BR-06** | Overdue Restriction | A student with any `Overdue` borrowing is barred from submitting new requests. | `400 Bad Request` |
| **BR-07** | Authorization Rule | Only users with `X-User-Role: admin` can approve, reject, or add equipment. | `403 Forbidden` |
| **BR-08** | Return Availability Reset | Upon returning equipment, equipment status resets to `'Available'`. | `200 OK` |
| **BR-09** | Input Validation | Rejects missing fields (purpose, dates) or non-existent equipment IDs. | `400 / 404` |
| **BR-10** | Duplicate Prevention | A student cannot create multiple active requests for the exact same item. | `400 Bad Request` |
