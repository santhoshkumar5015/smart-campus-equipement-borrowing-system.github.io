-- ====================================================================
-- SmartCampus EquipBorrow - Relational Database Schema (10 Core Tables)
-- Compatible with SQLite3 and MySQL
-- ====================================================================

-- 1. Users Table (Authentication & Role Credentials)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT', -- 'STUDENT' or 'ADMIN'
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 2. Students Table (College Academic Registration Profile)
CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    register_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    section TEXT NOT NULL,
    phone TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Categories Table (Equipment Classification)
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active INTEGER DEFAULT 1
);

-- 4. Equipment Table (College Inventory & Status)
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    description TEXT,
    specifications TEXT,
    location TEXT NOT NULL,
    condition TEXT DEFAULT 'GOOD', -- 'EXCELLENT', 'GOOD', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'MISSING_PARTS'
    status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'BORROWED', 'MAINTENANCE', 'RETIRED'
    purchase_date TEXT,
    equipment_value INTEGER DEFAULT 40000, -- ₹40,000 Equipment Security Valuation
    locker_id TEXT NOT NULL,
    requires_approval INTEGER DEFAULT 0,
    image_icon TEXT DEFAULT 'box',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 5. Borrow Requests Table (Student Equipment Reservations)
CREATE TABLE IF NOT EXISTS borrow_requests (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    equipment_id INTEGER NOT NULL,
    borrow_date TEXT NOT NULL,
    expected_return_date TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
    rejection_reason TEXT,
    approved_by TEXT,
    qr_code_token TEXT NOT NULL,
    pickup_locker TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 6. Loans Table (Active Issued Equipment Tracking)
CREATE TABLE IF NOT EXISTS loans (
    loan_id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL,
    equipment_id INTEGER NOT NULL,
    issued_at TEXT NOT NULL,
    due_at TEXT NOT NULL,
    returned_at TEXT,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'RETURNED', 'OVERDUE'
    issued_by TEXT NOT NULL,
    FOREIGN KEY (request_id) REFERENCES borrow_requests(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (issued_by) REFERENCES users(id)
);

-- 7. Returns Table (Inspection & Condition Assessment)
CREATE TABLE IF NOT EXISTS returns (
    return_id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id TEXT NOT NULL UNIQUE,
    returned_at TEXT NOT NULL,
    condition TEXT NOT NULL, -- 'EXCELLENT', 'GOOD', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'MISSING_PARTS'
    missing_accessories TEXT,
    damage_description TEXT,
    remarks TEXT,
    processed_by TEXT NOT NULL,
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- 8. Maintenance Table (Damaged Equipment Repair Pipeline)
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    issue TEXT NOT NULL,
    reported_at TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    status TEXT DEFAULT 'REPORTED', -- 'REPORTED', 'IN_PROGRESS', 'COMPLETED'
    resolution TEXT,
    completed_at TEXT,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- 9. Notifications Table (Student & Admin In-App Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'INFO', 'SUCCESS', 'WARNING', 'ALERT'
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. Audit Logs Table (Security & Administrative Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    details TEXT NOT NULL
);
