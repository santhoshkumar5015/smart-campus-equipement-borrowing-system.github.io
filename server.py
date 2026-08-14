#!/usr/bin/env python3
"""
SmartCampus EquipBorrow - Backend REST API Server
Tailored for College Equipment Borrowing, Approval, Tracking, Return & Maintenance.
Enforces Business Rules BR-01 to BR-20.
"""

import os
import json
import sqlite3
import datetime
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, "static"))
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "smart_campus.db"))

try:
    with open(DB_PATH, "a"): pass
except Exception:
    DB_PATH = "/tmp/smart_campus.db"

DEFAULT_PORTS = [8080, 8000, 5000, 8888, 3000]
MAX_ACTIVE_LOANS = 5  # BR-06 (Extended borrowing limit)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Execute DDL Schema
    schema_path = os.path.join(BASE_DIR, "database", "schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path, "r") as f:
            cursor.executescript(f.read())
    else:
        # Fallback DDL if file not found
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'STUDENT',
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL UNIQUE,
            register_number TEXT NOT NULL UNIQUE,
            department TEXT NOT NULL,
            year INTEGER NOT NULL,
            semester INTEGER NOT NULL,
            section TEXT NOT NULL,
            phone TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL UNIQUE,
            description TEXT,
            is_active INTEGER DEFAULT 1
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            serial_number TEXT NOT NULL UNIQUE,
            description TEXT,
            specifications TEXT,
            location TEXT NOT NULL,
            condition TEXT DEFAULT 'GOOD',
            status TEXT DEFAULT 'AVAILABLE',
            purchase_date TEXT,
            locker_id TEXT NOT NULL,
            requires_approval INTEGER DEFAULT 0,
            image_icon TEXT DEFAULT 'box',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(category_id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS borrow_requests (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            equipment_id INTEGER NOT NULL,
            borrow_date TEXT NOT NULL,
            expected_return_date TEXT NOT NULL,
            purpose TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            rejection_reason TEXT,
            approved_by TEXT,
            qr_code_token TEXT NOT NULL,
            pickup_locker TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (equipment_id) REFERENCES equipment(id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS loans (
            loan_id TEXT PRIMARY KEY,
            request_id TEXT NOT NULL UNIQUE,
            student_id TEXT NOT NULL,
            equipment_id INTEGER NOT NULL,
            issued_at TEXT NOT NULL,
            due_at TEXT NOT NULL,
            returned_at TEXT,
            status TEXT DEFAULT 'ACTIVE',
            issued_by TEXT NOT NULL,
            FOREIGN KEY (request_id) REFERENCES borrow_requests(id),
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (equipment_id) REFERENCES equipment(id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS returns (
            return_id INTEGER PRIMARY KEY AUTOINCREMENT,
            loan_id TEXT NOT NULL UNIQUE,
            returned_at TEXT NOT NULL,
            condition TEXT NOT NULL,
            missing_accessories TEXT,
            damage_description TEXT,
            remarks TEXT,
            processed_by TEXT NOT NULL,
            FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS maintenance (
            maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id INTEGER NOT NULL,
            issue TEXT NOT NULL,
            reported_at TEXT NOT NULL,
            reported_by TEXT NOT NULL,
            status TEXT DEFAULT 'REPORTED',
            resolution TEXT,
            completed_at TEXT,
            FOREIGN KEY (equipment_id) REFERENCES equipment(id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            details TEXT NOT NULL
        )
        """)

    # Seed data if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        seed_path = os.path.join(BASE_DIR, "database", "seed.sql")
        if os.path.exists(seed_path):
            with open(seed_path, "r") as f:
                cursor.executescript(f.read())

    conn.commit()
    conn.close()


class SmartCampusRequestHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {args[0]}")

    def send_json_response(self, data, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-User-Role, X-User-Id")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-User-Role, X-User-Id")
        self.end_headers()

    def get_auth_role(self):
        return self.headers.get("X-User-Role", "STUDENT").upper()

    def get_auth_user_id(self):
        return self.headers.get("X-User-Id", "STU-88210")

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path.startswith("/api/"):
            self.handle_api_get(path, urllib.parse.parse_qs(parsed_url.query))
        else:
            self.handle_static_file(path)

    def handle_static_file(self, path):
        clean_path = path.split("?")[0].split("#")[0]
        if clean_path in ("/", "", "/index", "/index.html"):
            rel_file = "index.html"
        else:
            rel_file = clean_path.lstrip("/")

        file_path = os.path.abspath(os.path.join(STATIC_DIR, rel_file))
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            file_path = os.path.abspath(os.path.join(BASE_DIR, rel_file))
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            file_path = os.path.join(STATIC_DIR, "index.html")

        ext = os.path.splitext(file_path)[1].lower()
        mime_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml"
        }
        content_type = mime_types.get(ext, "text/html; charset=utf-8")

        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def handle_api_get(self, path, query_params):
        conn = get_db()
        cursor = conn.cursor()

        if path == "/api/equipment":
            category = query_params.get("category", [None])[0]
            status = query_params.get("status", [None])[0]
            search = query_params.get("search", [None])[0]

            sql = """
            SELECT e.*, c.category_name 
            FROM equipment e
            LEFT JOIN categories c ON e.category_id = c.category_id
            WHERE 1=1
            """
            params = []

            if category and category != "All":
                sql += " AND (c.category_name = ? OR e.category_id = ?)"
                params.extend([category, category])
            if status and status != "All":
                sql += " AND e.status = ?"
                params.append(status.upper())
            if search:
                sql += " AND (e.name LIKE ? OR e.specifications LIKE ? OR e.location LIKE ? OR e.serial_number LIKE ?)"
                pattern = f"%{search}%"
                params.extend([pattern, pattern, pattern, pattern])

            sql += " ORDER BY e.id DESC"
            cursor.execute(sql, params)
            items = [dict(row) for row in cursor.fetchall()]
            self.send_json_response({"success": True, "data": items})

        elif path.startswith("/api/equipment/"):
            eq_id = path.split("/")[3]
            cursor.execute("SELECT e.*, c.category_name FROM equipment e LEFT JOIN categories c ON e.category_id = c.category_id WHERE e.id = ?", (eq_id,))
            item = cursor.fetchone()
            if item:
                self.send_json_response({"success": True, "data": dict(item)})
            else:
                self.send_json_response({"error": "Equipment not found"}, 404)

        elif path == "/api/borrow-requests":
            user_id = query_params.get("user_id", [None])[0]
            status = query_params.get("status", [None])[0]

            sql = """
            SELECT r.*, e.name as equipment_name, e.serial_number, e.image_icon, e.location,
                   s.register_number, s.department, s.year
            FROM borrow_requests r
            JOIN equipment e ON r.equipment_id = e.id
            LEFT JOIN students s ON r.student_id = s.user_id
            WHERE 1=1
            """
            params = []
            if user_id:
                sql += " AND r.student_id = ?"
                params.append(user_id)
            if status:
                sql += " AND r.status = ?"
                params.append(status.upper())

            sql += " ORDER BY r.created_at DESC"
            cursor.execute(sql, params)
            reqs = [dict(row) for row in cursor.fetchall()]
            self.send_json_response({"success": True, "data": reqs})

        elif path == "/api/loans":
            user_id = query_params.get("user_id", [None])[0]
            status = query_params.get("status", [None])[0]

            sql = """
            SELECT l.*, e.name as equipment_name, e.serial_number, e.location, e.locker_id,
                   u.name as student_name, s.register_number, s.department
            FROM loans l
            JOIN equipment e ON l.equipment_id = e.id
            JOIN users u ON l.student_id = u.id
            LEFT JOIN students s ON l.student_id = s.user_id
            WHERE 1=1
            """
            params = []
            if user_id:
                sql += " AND l.student_id = ?"
                params.append(user_id)
            if status:
                sql += " AND l.status = ?"
                params.append(status.upper())

            sql += " ORDER BY l.issued_at DESC"
            cursor.execute(sql, params)
            loans_list = [dict(row) for row in cursor.fetchall()]
            self.send_json_response({"success": True, "data": loans_list})

        elif path == "/api/analytics":
            cursor.execute("SELECT COUNT(*) FROM equipment")
            total = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM equipment WHERE status = 'AVAILABLE'")
            available = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM loans WHERE status = 'ACTIVE'")
            active_loans = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM borrow_requests WHERE status = 'PENDING'")
            pending = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM equipment WHERE status = 'MAINTENANCE'")
            maintenance = cursor.fetchone()[0]

            # Overdue loan check
            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("SELECT COUNT(*) FROM loans WHERE status = 'ACTIVE' AND due_at < ?", (now_str,))
            overdue = cursor.fetchone()[0]

            cursor.execute("SELECT c.category_name, COUNT(e.id) as count FROM categories c LEFT JOIN equipment e ON c.category_id = e.category_id GROUP BY c.category_id")
            categories = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT * FROM audit_logs ORDER BY log_id DESC LIMIT 15")
            logs = [dict(row) for row in cursor.fetchall()]

            self.send_json_response({
                "success": True,
                "metrics": {
                    "total_inventory": total,
                    "available_now": available,
                    "active_loans": active_loans,
                    "pending_approvals": pending,
                    "in_maintenance": maintenance,
                    "overdue": overdue
                },
                "categories": categories,
                "recent_logs": logs
            })

        elif path == "/api/maintenance":
            role = self.get_auth_role()
            if role != "ADMIN":
                conn.close()
                self.send_json_response({"error": "BR-09: Authorization failed. Admin access required."}, 403)
                return

            cursor.execute("""
            SELECT m.*, e.name as equipment_name, e.serial_number, e.location, u.name as reporter_name
            FROM maintenance m
            JOIN equipment e ON m.equipment_id = e.id
            LEFT JOIN users u ON m.reported_by = u.id
            ORDER BY m.reported_at DESC
            """)
            items = [dict(row) for row in cursor.fetchall()]
            self.send_json_response({"success": True, "data": items})

        elif path == "/api/audit-logs":
            role = self.get_auth_role()
            if role != "ADMIN":
                conn.close()
                self.send_json_response({"error": "BR-09: Authorization failed. Admin access required."}, 403)
                return

            cursor.execute("SELECT * FROM audit_logs ORDER BY log_id DESC LIMIT 50")
            logs = [dict(row) for row in cursor.fetchall()]
            self.send_json_response({"success": True, "data": logs})

        else:
            self.send_json_response({"error": "Endpoint not found"}, 404)

        conn.close()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}

        conn = get_db()
        cursor = conn.cursor()

        role = self.get_auth_role()
        auth_user_id = self.get_auth_user_id()

        # Registration API
        if path == "/api/auth/register":
            name = body.get("name", "").strip()
            email = body.get("email", "").strip()
            reg_num = body.get("register_number", "").strip()
            dept = body.get("department", "CSE").strip()
            year = int(body.get("year", 4))
            sem = int(body.get("semester", 7))
            sec = body.get("section", "A").strip()
            phone = body.get("phone", "").strip()

            if not name or not email or not reg_num:
                conn.close()
                self.send_json_response({"error": "Missing required registration details"}, 400)
                return

            import uuid
            user_id = f"STU-{uuid.uuid4().hex[:6].upper()}"
            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            try:
                cursor.execute("""
                INSERT INTO users (id, name, email, password_hash, role, is_active, created_at)
                VALUES (?, ?, ?, 'pbkdf2:sha256:student_hash', 'STUDENT', 1, ?)
                """, (user_id, name, email, now_str))

                cursor.execute("""
                INSERT INTO students (student_id, user_id, register_number, department, year, semester, section, phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (f"S-{user_id[4:]}", user_id, reg_num, dept, year, sem, sec, phone))

                cursor.execute("""
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
                VALUES (?, 'STUDENT_REGISTER', 'STUDENT', ?, ?, ?)
                """, (user_id, user_id, now_str, f"Registered student {name} ({reg_num}, Dept: {dept})"))

                conn.commit()
                conn.close()

                self.send_json_response({
                    "success": True,
                    "user_id": user_id,
                    "name": name,
                    "email": email,
                    "register_number": reg_num,
                    "message": f"Welcome {name}! Registration successful."
                })
                return
            except sqlite3.IntegrityError as e:
                conn.close()
                self.send_json_response({"error": "Email or Register Number already exists."}, 400)
                return

        # Borrow Request Submission (BR-01 to BR-12)
        elif path == "/api/borrow-requests":
            if role != "STUDENT" and role != "ADMIN":
                conn.close()
                self.send_json_response({"error": "BR-01: Only registered students can submit requests."}, 403)
                return

            equipment_id = body.get("equipment_id")
            user_id = body.get("user_id") or auth_user_id
            user_name = body.get("user_name", "Student")
            borrow_date_str = body.get("borrow_date")
            expected_return_str = body.get("expected_return_date") or body.get("return_date")
            purpose = body.get("purpose", "").strip()

            if equipment_id is None or not borrow_date_str or not expected_return_str or not purpose:
                conn.close()
                self.send_json_response({"error": "Missing required fields (equipment_id, dates, or purpose)"}, 400)
                return

            try:
                borrow_dt = datetime.datetime.strptime(borrow_date_str.replace("T", " ")[:16], "%Y-%m-%d %H:%M")
                return_dt = datetime.datetime.strptime(expected_return_str.replace("T", " ")[:16], "%Y-%m-%d %H:%M")
            except ValueError:
                conn.close()
                self.send_json_response({"error": "Invalid date format. Use YYYY-MM-DD HH:MM"}, 400)
                return

            # BR-02: User exists check
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            if not user:
                conn.close()
                self.send_json_response({"error": "BR-01: Only registered students can submit requests."}, 400)
                return

            # BR-03, BR-10, BR-11: Equipment check
            cursor.execute("SELECT * FROM equipment WHERE id = ?", (equipment_id,))
            eq = cursor.fetchone()
            if not eq:
                conn.close()
                self.send_json_response({"error": "Equipment ID does not exist."}, 404)
                return

            if eq["status"] == "MAINTENANCE":
                conn.close()
                self.send_json_response({"error": "BR-10: Equipment is under MAINTENANCE and cannot be requested."}, 400)
                return

            if eq["status"] == "RETIRED":
                conn.close()
                self.send_json_response({"error": "BR-11: Retired equipment cannot be requested."}, 400)
                return

            now = datetime.datetime.now()

            # BR-04: Past borrow date check
            if borrow_dt < (now - datetime.timedelta(minutes=15)):
                conn.close()
                self.send_json_response({"error": "BR-04: Borrow date cannot be in the past."}, 400)
                return

            # BR-05: Return date after borrow date & Max 1 Month (30 Days)
            if return_dt <= borrow_dt:
                conn.close()
                self.send_json_response({"error": "BR-05: Expected return date must be strictly after borrow date."}, 400)
                return

            if (return_dt - borrow_dt).days > 90:
                conn.close()
                self.send_json_response({"error": "BR-05: Loan duration cannot exceed 3 months (90 days)."}, 400)
                return

            # BR-07: Overdue student check
            now_str = now.strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("SELECT COUNT(*) FROM loans WHERE student_id = ? AND status = 'ACTIVE' AND due_at < ?", (user_id, now_str))
            if cursor.fetchone()[0] > 0:
                conn.close()
                self.send_json_response({"error": "BR-07: Student has overdue equipment borrowings. Please return overdue items first."}, 400)
                return

            # BR-06: 2 Active Loans limit check
            cursor.execute("SELECT COUNT(*) FROM loans WHERE student_id = ? AND status = 'ACTIVE'", (user_id,))
            active_loans_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM borrow_requests WHERE student_id = ? AND status IN ('PENDING', 'APPROVED')", (user_id,))
            active_req_count = cursor.fetchone()[0]

            if (active_loans_count + active_req_count) >= MAX_ACTIVE_LOANS:
                conn.close()
                self.send_json_response({"error": f"BR-06: Borrowing limit reached. Maximum allowed active borrowings is {MAX_ACTIVE_LOANS}."}, 400)
                return

            # BR-08, BR-12: Overlapping bookings check
            cursor.execute("SELECT * FROM borrow_requests WHERE equipment_id = ? AND status IN ('PENDING', 'APPROVED')", (equipment_id,))
            existing_reqs = cursor.fetchall()

            for req in existing_reqs:
                ex_borrow = datetime.datetime.strptime(req["borrow_date"][:16], "%Y-%m-%d %H:%M")
                ex_return = datetime.datetime.strptime(req["expected_return_date"][:16], "%Y-%m-%d %H:%M")

                if req["student_id"] == user_id:
                    conn.close()
                    self.send_json_response({"error": "BR-08: You already have an active request for this equipment."}, 400)
                    return

                if not (return_dt <= ex_borrow or borrow_dt >= ex_return):
                    conn.close()
                    self.send_json_response({"error": "BR-12: Equipment is already booked for an overlapping period."}, 400)
                    return

            import uuid
            req_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"
            qr_token = f"QR-{req_id}-{user_id}"
            initial_status = "PENDING" if eq["requires_approval"] else "APPROVED"

            cursor.execute("""
            INSERT INTO borrow_requests (id, student_id, equipment_id, borrow_date, expected_return_date, purpose, status, qr_code_token, pickup_locker, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (req_id, user_id, equipment_id, borrow_date_str.replace("T", " "), expected_return_str.replace("T", " "), purpose, initial_status, qr_token, eq["locker_id"], now_str, now_str))

            if initial_status == "APPROVED":
                cursor.execute("UPDATE equipment SET status = 'RESERVED', updated_at = ? WHERE id = ?", (now_str, equipment_id))

            cursor.execute("""
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
            VALUES (?, 'SUBMIT_REQUEST', 'BORROW_REQUEST', ?, ?, ?)
            """, (user_id, req_id, now_str, f"Submitted request {req_id} for equipment '{eq['name']}'. Status: {initial_status}"))

            conn.commit()
            conn.close()

            self.send_json_response({
                "success": True,
                "request_id": req_id,
                "status": initial_status,
                "qr_code_token": qr_token,
                "pickup_locker": eq["locker_id"],
                "message": "Borrow request submitted for Admin approval." if initial_status == "PENDING" else "Borrow request approved automatically!"
            })

        # Add Equipment (BR-09, BR-13, BR-20)
        elif path == "/api/equipment":
            if role != "ADMIN":
                conn.close()
                self.send_json_response({"error": "BR-09: Authorization failed. Only Admin can add equipment."}, 403)
                return

            name = body.get("name", "").strip()
            cat_id = body.get("category_id", 1)
            serial = body.get("serial_number", "").strip() or f"SN-{cat_id}-{int(datetime.datetime.now().timestamp()) % 10000}"
            specs = body.get("specifications", "")
            location = body.get("location", "Main Lab")
            locker = body.get("locker_id", "A-01")
            requires_appr = 1 if body.get("requires_approval") else 0
            icon = body.get("image_icon", "box")

            if not name:
                conn.close()
                self.send_json_response({"error": "Equipment name is required."}, 400)
                return

            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            try:
                cursor.execute("""
                INSERT INTO equipment (category_id, name, serial_number, description, specifications, location, condition, status, purchase_date, locker_id, requires_approval, image_icon, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'GOOD', 'AVAILABLE', ?, ?, ?, ?, ?, ?)
                """, (cat_id, name, serial, specs, specs, location, now_str[:10], locker, requires_appr, icon, now_str, now_str))

                eq_id = cursor.lastrowid
                cursor.execute("""
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
                VALUES (?, 'ADD_EQUIPMENT', 'EQUIPMENT', ?, ?, ?)
                """, (auth_user_id, str(eq_id), now_str, f"Admin added '{name}' (SN: {serial}) in Locker {locker}"))

                conn.commit()
                conn.close()
                self.send_json_response({"success": True, "id": eq_id, "message": "New equipment registered successfully!"})
            except sqlite3.IntegrityError:
                conn.close()
                self.send_json_response({"error": "BR-13: Serial number must be unique across all equipment."}, 400)

        # Locker Actuator / Quick Issue API
        elif path == "/api/locker/unlock":
            token = body.get("qr_code_token")
            user_id = body.get("user_id")

            sql = """
            SELECT r.*, e.name as equipment_name, e.locker_id 
            FROM borrow_requests r 
            JOIN equipment e ON r.equipment_id = e.id 
            WHERE 1=1
            """
            params = []
            if token:
                sql += " AND r.qr_code_token = ?"
                params.append(token)
            elif user_id:
                sql += " AND r.student_id = ? AND r.status IN ('APPROVED', 'CHECKEDOUT')"
                params.append(user_id)
            else:
                conn.close()
                self.send_json_response({"error": "Provide valid QR token or User ID"}, 400)
                return

            cursor.execute(sql, params)
            req = cursor.fetchone()

            if not req:
                conn.close()
                self.send_json_response({"error": "No active reservation matching token/user ID found"}, 404)
                return

            req = dict(req)
            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            if req["status"] == "APPROVED":
                import uuid
                loan_id = f"LOAN-{uuid.uuid4().hex[:6].upper()}"

                cursor.execute("""
                INSERT INTO loans (loan_id, request_id, student_id, equipment_id, issued_at, due_at, status, issued_by)
                VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 'ADM-00001')
                """, (loan_id, req["id"], req["student_id"], req["equipment_id"], now_str, req["expected_return_date"]))

                cursor.execute("UPDATE borrow_requests SET status = 'CHECKEDOUT', updated_at = ? WHERE id = ?", (now_str, req["id"]))
                cursor.execute("UPDATE equipment SET status = 'BORROWED', updated_at = ? WHERE id = ?", (now_str, req["equipment_id"]))

                cursor.execute("""
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
                VALUES (?, 'IOT_PICKUP', 'LOAN', ?, ?, ?)
                """, (req["student_id"], loan_id, now_str, f"Unlocked Locker {req['locker_id']} - Equipment '{req['equipment_name']}' issued."))

                conn.commit()
                conn.close()
                self.send_json_response({
                    "success": True,
                    "action": "PICKUP",
                    "locker_id": req["locker_id"],
                    "equipment_name": req["equipment_name"],
                    "message": f"Locker {req['locker_id']} Unlocked! Please collect your {req['equipment_name']}."
                })

            else:
                conn.close()
                self.send_json_response({"error": f"Request status '{req['status']}' is not ready for pickup."}, 400)

        else:
            conn.close()
            self.send_json_response({"error": "Invalid POST endpoint"}, 404)

    def do_PUT(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}

        conn = get_db()
        cursor = conn.cursor()

        role = self.get_auth_role()
        auth_user_id = self.get_auth_user_id()
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Admin Approve Request (BR-16, BR-20)
        if path.startswith("/api/admin/requests/") and path.endswith("/approve"):
            if role != "ADMIN":
                conn.close()
                self.send_json_response({"error": "BR-16: Only Admin can approve borrow requests."}, 403)
                return

            req_id = path.split("/")[4]
            cursor.execute("SELECT * FROM borrow_requests WHERE id = ?", (req_id,))
            req = cursor.fetchone()
            if not req:
                conn.close()
                self.send_json_response({"error": "Borrow request not found"}, 404)
                return

            cursor.execute("UPDATE borrow_requests SET status = 'APPROVED', approved_by = ?, updated_at = ? WHERE id = ?", (auth_user_id, now_str, req_id))
            cursor.execute("UPDATE equipment SET status = 'RESERVED', updated_at = ? WHERE id = ?", (now_str, req["equipment_id"]))

            # Auto create loan record if not exists
            cursor.execute("SELECT * FROM loans WHERE request_id = ?", (req_id,))
            loan_row = cursor.fetchone()
            if not loan_row:
                import uuid
                loan_id = f"LOAN-{uuid.uuid4().hex[:6].upper()}"
                cursor.execute("""
                INSERT INTO loans (loan_id, request_id, student_id, equipment_id, issued_at, due_at, status, issued_by)
                VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
                """, (loan_id, req_id, req["student_id"], req["equipment_id"], now_str, req["expected_return_date"], auth_user_id))
            else:
                loan_id = loan_row["loan_id"]

            cursor.execute("""
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
            VALUES (?, 'ADMIN_APPROVE', 'BORROW_REQUEST', ?, ?, ?)
            """, (auth_user_id, req_id, now_str, f"Admin approved request {req_id}. Active Loan {loan_id} issued."))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": f"Borrow request {req_id} approved. Equipment reserved!"})

        # Admin Reject Request (BR-17, BR-18, BR-20)
        elif path.startswith("/api/admin/requests/") and path.endswith("/reject"):
            if role != "ADMIN":
                conn.close()
                self.send_json_response({"error": "BR-17: Only Admin can reject borrow requests."}, 403)
                return

            req_id = path.split("/")[4]
            reason = body.get("reason", "").strip()

            if not reason:
                conn.close()
                self.send_json_response({"error": "BR-18: Admin must provide a mandatory rejection reason."}, 400)
                return

            cursor.execute("SELECT * FROM borrow_requests WHERE id = ?", (req_id,))
            req = cursor.fetchone()
            if not req:
                conn.close()
                self.send_json_response({"error": "Borrow request not found"}, 404)
                return

            cursor.execute("UPDATE borrow_requests SET status = 'REJECTED', rejection_reason = ?, updated_at = ? WHERE id = ?", (reason, now_str, req_id))
            cursor.execute("UPDATE equipment SET status = 'AVAILABLE', updated_at = ? WHERE id = ?", (now_str, req["equipment_id"]))

            cursor.execute("""
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
            VALUES (?, 'ADMIN_REJECT', 'BORROW_REQUEST', ?, ?, ?)
            """, (auth_user_id, req_id, now_str, f"Admin rejected request {req_id}. Reason: {reason}"))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": f"Borrow request {req_id} rejected."})

        # Admin Return Processing (BR-14, BR-15, BR-19, BR-20)
        elif path.startswith("/api/admin/loans/") and path.endswith("/return"):
            loan_id = path.split("/")[4]
            cond = body.get("condition", "GOOD").upper()
            missing = body.get("missing_accessories", "").strip()
            damage_desc = body.get("damage_description", "").strip()
            remarks = body.get("remarks", "Returned at lab desk").strip()

            cursor.execute("SELECT * FROM loans WHERE loan_id = ?", (loan_id,))
            loan = cursor.fetchone()
            if not loan:
                conn.close()
                self.send_json_response({"error": "Loan record not found"}, 404)
                return

            cursor.execute("UPDATE loans SET status = 'RETURNED', returned_at = ? WHERE loan_id = ?", (now_str, loan_id))

            # Record Return details
            cursor.execute("""
            INSERT INTO returns (loan_id, returned_at, condition, missing_accessories, damage_description, remarks, processed_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (loan_id, now_str, cond, missing, damage_desc, remarks, auth_user_id))

            # BR-14 & BR-15 Condition check routing
            if cond in ("MINOR_DAMAGE", "MAJOR_DAMAGE", "MISSING_PARTS"):
                # Transition to MAINTENANCE (BR-14)
                cursor.execute("UPDATE equipment SET status = 'MAINTENANCE', condition = ?, updated_at = ? WHERE id = ?", (cond, now_str, loan["equipment_id"]))

                issue_text = f"Damage on return: {damage_desc or cond}. Missing: {missing or 'None'}"
                cursor.execute("""
                INSERT INTO maintenance (equipment_id, issue, reported_at, reported_by, status)
                VALUES (?, ?, ?, ?, 'REPORTED')
                """, (loan["equipment_id"], issue_text, now_str, auth_user_id))

                log_details = f"Processed return for Loan {loan_id}. Condition: {cond}. Equipment transitioned to MAINTENANCE."

            else:
                # BR-15 Reset to AVAILABLE
                cursor.execute("UPDATE equipment SET status = 'AVAILABLE', condition = ?, updated_at = ? WHERE id = ?", (cond, now_str, loan["equipment_id"]))
                log_details = f"Processed return for Loan {loan_id}. Condition: {cond}. Equipment reset to AVAILABLE."

            cursor.execute("""
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
            VALUES (?, 'PROCESS_RETURN', 'LOAN', ?, ?, ?)
            """, (auth_user_id, loan_id, now_str, log_details))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": log_details})

        # Edit Request / Loan Dates (BR-05 Max 30 Days / 1 Month)
        elif path.startswith("/api/borrow-requests/") and path.endswith("/dates"):
            req_id = path.split("/")[3]
            borrow_str = body.get("borrow_date")
            return_str = body.get("expected_return_date") or body.get("return_date")

            if not borrow_str or not return_str:
                conn.close()
                self.send_json_response({"error": "Borrow date and expected return date are required."}, 400)
                return

            try:
                borrow_dt = datetime.datetime.strptime(borrow_str.replace("T", " ")[:16], "%Y-%m-%d %H:%M")
                return_dt = datetime.datetime.strptime(return_str.replace("T", " ")[:16], "%Y-%m-%d %H:%M")
            except ValueError:
                conn.close()
                self.send_json_response({"error": "Invalid date format"}, 400)
                return

            if return_dt <= borrow_dt:
                conn.close()
                self.send_json_response({"error": "BR-05: Expected return date must be strictly after borrow date."}, 400)
                return

            if (return_dt - borrow_dt).days > 90:
                conn.close()
                self.send_json_response({"error": "BR-05: Loan duration cannot exceed 3 months (90 days)."}, 400)
                return

            cursor.execute("UPDATE borrow_requests SET borrow_date = ?, expected_return_date = ?, updated_at = ? WHERE id = ?", (borrow_str.replace("T", " "), return_str.replace("T", " "), now_str, req_id))
            cursor.execute("UPDATE loans SET due_at = ? WHERE request_id = ?", (return_str.replace("T", " "), req_id))

            cursor.execute("""
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
            VALUES (?, 'EDIT_DATES', 'BORROW_REQUEST', ?, ?, ?)
            """, (auth_user_id, req_id, now_str, f"Updated dates for request {req_id} ({borrow_str} to {return_str})"))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": "Borrowing dates updated successfully! Return date extended up to 1 month."})

        # Admin Maintenance Pipeline Update
        elif path.startswith("/api/admin/maintenance/") and (path.endswith("/progress") or path.endswith("/complete")):
            if role != "ADMIN":
                conn.close()
                self.send_json_response({"error": "BR-09: Authorization failed. Admin access required."}, 403)
                return

            maint_id = path.split("/")[4]
            resolution = body.get("resolution", "Repaired and recalibrated").strip()

            cursor.execute("SELECT * FROM maintenance WHERE maintenance_id = ?", (maint_id,))
            m = cursor.fetchone()
            if not m:
                conn.close()
                self.send_json_response({"error": "Maintenance item not found"}, 404)
                return

            if path.endswith("/complete"):
                cursor.execute("UPDATE maintenance SET status = 'COMPLETED', resolution = ?, completed_at = ? WHERE maintenance_id = ?", (resolution, now_str, maint_id))
                cursor.execute("UPDATE equipment SET status = 'AVAILABLE', condition = 'GOOD', updated_at = ? WHERE id = ?", (now_str, m["equipment_id"]))
                msg = f"Maintenance ticket #{maint_id} completed! Equipment is back AVAILABLE."
            else:
                cursor.execute("UPDATE maintenance SET status = 'IN_PROGRESS', resolution = ? WHERE maintenance_id = ?", (resolution, maint_id))
                msg = f"Maintenance ticket #{maint_id} set to IN_PROGRESS."

            cursor.execute("""
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details)
            VALUES (?, 'MAINTENANCE_UPDATE', 'MAINTENANCE', ?, ?, ?)
            """, (auth_user_id, str(maint_id), now_str, msg))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": msg})

        else:
            conn.close()
            self.send_json_response({"error": "Invalid PUT endpoint"}, 404)


def run_server():
    init_db()
    
    env_port = os.environ.get("PORT")
    if env_port:
        ports = [int(env_port)]
    else:
        ports = DEFAULT_PORTS

    server = None
    selected_port = None

    for port in ports:
        for host in ["0.0.0.0", "127.0.0.1", ""]:
            try:
                server = HTTPServer((host, port), SmartCampusRequestHandler)
                selected_port = port
                break
            except Exception:
                continue
        if server:
            break

    if not server:
        print("ERROR: Could not bind to any port.")
        return

    print("==================================================")
    print("  SmartCampus EquipBorrow REST API Server Online  ")
    print(f"  Server listening at: http://localhost:{selected_port}   ")
    print("==================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()


if __name__ == "__main__":
    run_server()
