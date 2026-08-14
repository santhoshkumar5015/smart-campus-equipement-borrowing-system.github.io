# Database & Business Rules Design Document - SmartCampus EquipBorrow

## Database Schema (10 Core Relational Tables)

The database schema is defined in [database/schema.sql](file:///Users/apple/Documents/student%20performance%20predection/smart_campus_equipment/database/schema.sql):

- `users` (id, name, email, password_hash, role, is_active, created_at)
- `students` (student_id, user_id, register_number, department, year, semester, section, phone)
- `categories` (category_id, category_name, description, is_active)
- `equipment` (id, category_id, name, serial_number, description, specifications, location, condition, status, purchase_date, locker_id, requires_approval, image_icon, created_at, updated_at)
- `borrow_requests` (id, student_id, equipment_id, borrow_date, expected_return_date, purpose, status, rejection_reason, approved_by, qr_code_token, pickup_locker, created_at, updated_at)
- `loans` (loan_id, request_id, student_id, equipment_id, issued_at, due_at, returned_at, status, issued_by)
- `returns` (return_id, loan_id, returned_at, condition, missing_accessories, damage_description, remarks, processed_by)
- `maintenance` (maintenance_id, equipment_id, issue, reported_at, reported_by, status, resolution, completed_at)
- `notifications` (notification_id, user_id, title, message, type, is_read, created_at)
- `audit_logs` (log_id, user_id, action, entity_type, entity_id, timestamp, details)

---

## 20 Core Business Rules (BR-01 to BR-20)

| Rule ID | Category | Constraint Description | HTTP Status |
|---|---|---|---|
| **BR-01** | Student | Only registered students can submit borrow requests. | `403 / 400` |
| **BR-02** | Student | Student must be authenticated with valid role. | `400` |
| **BR-03** | Student | Student cannot borrow unavailable equipment. | `400` |
| **BR-04** | Student | Borrow date cannot be in the past. | `400` |
| **BR-05** | Student | Expected return date must be strictly after borrow date. | `400` |
| **BR-06** | Student | Maximum **2 active loans** per student (`ACTIVE` / `APPROVED` / `PENDING`). | `400` |
| **BR-07** | Student | Student with any overdue equipment cannot submit new requests. | `400` |
| **BR-08** | Student | Student cannot create duplicate requests for the same item & overlapping period. | `400` |
| **BR-09** | Student | Student role cannot invoke administrative endpoints. | `403` |
| **BR-10** | Equipment | Equipment under `MAINTENANCE` status cannot be requested or issued. | `400` |
| **BR-11** | Equipment | `RETIRED` equipment cannot be requested or issued. | `400` |
| **BR-12** | Equipment | Same equipment cannot have overlapping approved/active bookings. | `400` |
| **BR-13** | Equipment | Every equipment unit must possess a unique serial number. | `400` |
| **BR-14** | Equipment | Equipment returned with damage (`MINOR_DAMAGE`, `MAJOR_DAMAGE`, `MISSING_PARTS`) automatically transitions to `MAINTENANCE` status and creates a maintenance record. | `200` |
| **BR-15** | Equipment | Equipment returned in `GOOD` or `EXCELLENT` condition automatically resets to `AVAILABLE` status. | `200` |
| **BR-16** | Admin | Only users with `ADMIN` role can approve borrow requests. | `403` |
| **BR-17** | Admin | Only users with `ADMIN` role can reject borrow requests. | `403` |
| **BR-18** | Admin | Admin must provide a mandatory rejection reason when rejecting a request. | `400` |
| **BR-19** | Admin | Admin records exact equipment condition and damage notes during return processing. | `200` |
| **BR-20** | Admin | Every administrative action (approval, rejection, return, maintenance state change) is recorded in immutable audit logs. | `200` |
