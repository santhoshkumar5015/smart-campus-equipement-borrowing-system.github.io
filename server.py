#!/usr/bin/env python3
"""
Smart Campus Equipment Borrowing System - Backend REST API Server
Strictly enforces Business Rules BR-01 to BR-10.
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

MAX_ACTIVE_BORROWINGS = 2  # BR-05


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student'
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS equipment (
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
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS borrow_requests (
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
        FOREIGN KEY (equipment_id) REFERENCES equipment (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL,
        returned_at TEXT NOT NULL,
        condition TEXT NOT NULL,
        remarks TEXT,
        FOREIGN KEY (request_id) REFERENCES borrow_requests (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        user_info TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        users_seed = [
            ("STU-88210", "Alex Rivera", "arivera@campus.edu", "pbkdf2:sha256:student_hash", "student"),
            ("STU-99012", "Jordan Smith", "jsmith@campus.edu", "pbkdf2:sha256:student_hash", "student"),
            ("ADM-00001", "Dr. Sarah Vance (Lab Manager)", "svance@campus.edu", "pbkdf2:sha256:admin_hash", "admin")
        ]
        cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?)", users_seed)

    cursor.execute("SELECT COUNT(*) FROM equipment")
    if cursor.fetchone()[0] == 0:
        equipment_seed = [
            ("MacBook Pro M3 Max 16\"", "Computing & Laptops", "Apple M3 Max 36GB RAM, 1TB SSD", "SN-MBP-9021", "CS Innovation Lab 201", "Available", "Excellent", 98, "A-01", 0, "laptop"),
            ("Sony FX3 Cinema Camera Kit", "AV & Cinema", "Full-frame 4K, 24-70mm GM II lens, XLR handle", "SN-AV-4482", "Media Studio B", "Available", "Excellent", 85, "A-02", 1, "camera"),
            ("Meta Quest 3 VR Headset (512GB)", "VR & AR", "Includes Touch Plus controllers & Link Cable", "SN-VR-8812", "Spatial Computing Hub", "Available", "Good", 92, "A-03", 0, "glasses"),
            ("DJI Mavic 3 Pro Cine Drone", "Robotics & Drones", "Tri-camera system, Apple ProRes, Smart Controller", "SN-DRONE-304", "Autonomous Systems Lab", "Available", "Excellent", 78, "A-04", 1, "drone"),
            ("NVIDIA Jetson Orin AGX Kit", "IoT & Electronics", "275 TOPS AI performance, 64GB RAM", "SN-NV-7719", "AI Hardware Lab", "Available", "New", 100, "A-05", 0, "cpu"),
            ("Rigol 100MHz Oscilloscope Kit", "Lab Tools", "4-Channel Digital Storage, Probes Included", "SN-SCOPE-110", "Circuit Design Lab", "Available", "Good", 100, "A-06", 0, "activity"),
            ("iPad Pro 12.9 M2 + Pencil", "Computing & Laptops", "256GB Wi-Fi, Apple Pencil v2, Magic Keyboard", "SN-IPAD-551", "Design Innovation Studio", "Borrowed", "Good", 65, "B-01", 0, "tablet"),
            ("Shure SM7B + Focusrite Audio Kit", "AV & Cinema", "Broadcast Mic, Cloudlifter CL-1, Scarlett 2i2", "SN-AUDIO-992", "Podcast Studio 2", "Available", "Excellent", 100, "B-02", 0, "mic"),
            ("TurtleBot 4 ROS 2 Mobile Robot", "Robotics & Drones", "iRobot Create 3 base, OAK-D Pro camera, LiDAR", "SN-BOT-004", "Mechatronics Lab", "Maintenance", "Fair", 40, "B-03", 1, "bot"),
            ("Raspberry Pi 5 Lab Starter Bundle", "IoT & Electronics", "8GB RAM, NVMe Base, Touchscreen, Sensors", "SN-RPI-505", "Embedded Systems Room", "Available", "New", 100, "B-04", 0, "cpu")
        ]
        cursor.executemany("""
        INSERT INTO equipment (name, category, specifications, serial_number, location, status, condition, battery_level, locker_id, requires_approval, image_icon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, equipment_seed)

        now = datetime.datetime.now()
        yesterday = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
        next_week = (now + datetime.timedelta(days=5)).strftime("%Y-%m-%d %H:%M")

        cursor.execute("""
        INSERT INTO borrow_requests (id, equipment_id, user_id, user_name, user_email, borrow_date, return_date, purpose, status, qr_code_token, pickup_locker, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("REQ-10492", 7, "STU-88210", "Alex Rivera", "arivera@campus.edu", yesterday, next_week, "UI Design Project Capstone", "CheckedOut", "QR-REQ-10492-STU-88210", "B-01", yesterday))

        cursor.execute("""
        INSERT INTO audit_logs (action, user_info, details, timestamp)
        VALUES (?, ?, ?, ?)
        """, ("INITIALIZATION", "System", "Campus Equipment Database seeded with initial inventory & business rules configuration.", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

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
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-User-Role")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-User-Role")
        self.end_headers()

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

            sql = "SELECT * FROM equipment WHERE 1=1"
            params = []

            if category and category != "All":
                sql += " AND category = ?"
                params.append(category)
            if status and status != "All":
                sql += " AND status = ?"
                params.append(status)
            if search:
                sql += " AND (name LIKE ? OR specifications LIKE ? OR location LIKE ? OR serial_number LIKE ?)"
                pattern = f"%{search}%"
                params.extend([pattern, pattern, pattern, pattern])

            sql += " ORDER BY id DESC"
            cursor.execute(sql, params)
            items = [dict(row) for row in cursor.fetchall()]
            self.send_json_response({"success": True, "data": items})

        elif path.startswith("/api/equipment/"):
            eq_id = path.split("/")[3]
            cursor.execute("SELECT * FROM equipment WHERE id = ?", (eq_id,))
            item = cursor.fetchone()
            if item:
                self.send_json_response({"success": True, "data": dict(item)})
            else:
                self.send_json_response({"error": "Equipment not found"}, 404)

        elif path == "/api/borrow-requests":
            user_id = query_params.get("user_id", [None])[0]
            status = query_params.get("status", [None])[0]

            sql = """
            SELECT r.*, e.name as equipment_name, e.category as equipment_category, e.image_icon, e.location
            FROM borrow_requests r
            JOIN equipment e ON r.equipment_id = e.id
            WHERE 1=1
            """
            params = []
            if user_id:
                sql += " AND r.user_id = ?"
                params.append(user_id)
            if status:
                sql += " AND r.status = ?"
                params.append(status)

            sql += " ORDER BY r.created_at DESC"
            cursor.execute(sql, params)
            reqs = [dict(row) for row in cursor.fetchall()]
            self.send_json_response({"success": True, "data": reqs})

        elif path == "/api/analytics":
            cursor.execute("SELECT COUNT(*) FROM equipment")
            total = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM equipment WHERE status = 'Available'")
            available = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM equipment WHERE status = 'Borrowed'")
            borrowed = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM equipment WHERE status = 'Maintenance'")
            maintenance = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM borrow_requests WHERE status = 'Pending'")
            pending = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM borrow_requests WHERE status = 'Overdue'")
            overdue = cursor.fetchone()[0]

            cursor.execute("SELECT category, COUNT(*) as count FROM equipment GROUP BY category")
            categories = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 15")
            logs = [dict(row) for row in cursor.fetchall()]

            self.send_json_response({
                "success": True,
                "metrics": {
                    "total_equipment": total,
                    "available": available,
                    "borrowed": borrowed,
                    "maintenance": maintenance,
                    "pending_approvals": pending,
                    "overdue": overdue
                },
                "categories": categories,
                "recent_logs": logs
            })

        elif path == "/api/audit-logs":
            cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50")
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

        if path == "/api/borrow-requests":
            equipment_id = body.get("equipment_id")
            user_id = body.get("user_id", "STU-88210")
            user_name = body.get("user_name", "Alex Rivera")
            user_email = body.get("user_email", "arivera@campus.edu")
            borrow_date_str = body.get("borrow_date")
            return_date_str = body.get("return_date")
            purpose = body.get("purpose", "").strip()

            if equipment_id is None or not borrow_date_str or not return_date_str or not purpose:
                conn.close()
                self.send_json_response({"error": "BR-09: Missing required fields (equipment_id, dates, or purpose)"}, 400)
                return

            try:
                borrow_dt = datetime.datetime.strptime(borrow_date_str.replace("T", " ")[:16], "%Y-%m-%d %H:%M")
                return_dt = datetime.datetime.strptime(return_date_str.replace("T", " ")[:16], "%Y-%m-%d %H:%M")
            except ValueError:
                conn.close()
                self.send_json_response({"error": "BR-09: Invalid date format"}, 400)
                return

            cursor.execute("SELECT * FROM equipment WHERE id = ?", (equipment_id,))
            eq = cursor.fetchone()
            if not eq:
                conn.close()
                self.send_json_response({"error": "BR-09: Equipment ID does not exist"}, 404)
                return

            now = datetime.datetime.now()

            if eq["status"] == "Maintenance":
                conn.close()
                self.send_json_response({"error": "BR-01: Equipment is under maintenance and unavailable"}, 400)
                return

            if borrow_dt < (now - datetime.timedelta(minutes=15)):
                conn.close()
                self.send_json_response({"error": "BR-02: Borrow date cannot be in the past"}, 400)
                return

            if return_dt <= borrow_dt:
                conn.close()
                self.send_json_response({"error": "BR-03: Return date must be strictly after borrow date"}, 400)
                return

            cursor.execute("SELECT COUNT(*) FROM borrow_requests WHERE user_id = ? AND status = 'Overdue'", (user_id,))
            if cursor.fetchone()[0] > 0:
                conn.close()
                self.send_json_response({"error": "BR-06: Student has overdue equipment borrowings. Clear overdue items before borrowing new equipment."}, 400)
                return

            cursor.execute("SELECT COUNT(*) FROM borrow_requests WHERE user_id = ? AND status IN ('Pending', 'Approved', 'CheckedOut')", (user_id,))
            active_count = cursor.fetchone()[0]
            if active_count >= MAX_ACTIVE_BORROWINGS:
                conn.close()
                self.send_json_response({"error": f"BR-05: Borrowing limit exceeded. Maximum allowed active borrowings is {MAX_ACTIVE_BORROWINGS}. Current active: {active_count}."}, 400)
                return

            cursor.execute("SELECT * FROM borrow_requests WHERE equipment_id = ? AND status IN ('Pending', 'Approved', 'CheckedOut')", (equipment_id,))
            existing_reqs = cursor.fetchall()

            for req in existing_reqs:
                ex_borrow = datetime.datetime.strptime(req["borrow_date"][:16], "%Y-%m-%d %H:%M")
                ex_return = datetime.datetime.strptime(req["return_date"][:16], "%Y-%m-%d %H:%M")

                if req["user_id"] == user_id:
                    conn.close()
                    self.send_json_response({"error": "BR-10: You already have an active or pending request for this equipment."}, 400)
                    return

                if not (return_dt <= ex_borrow or borrow_dt >= ex_return):
                    conn.close()
                    self.send_json_response({"error": f"BR-04: Equipment is already booked for an overlapping period."}, 400)
                    return

            import uuid
            req_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"
            qr_token = f"QR-{req_id}-{user_id}"
            initial_status = "Pending" if eq["requires_approval"] else "Approved"

            cursor.execute("""
            INSERT INTO borrow_requests (id, equipment_id, user_id, user_name, user_email, borrow_date, return_date, purpose, status, qr_code_token, pickup_locker, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (req_id, equipment_id, user_id, user_name, user_email, borrow_date_str.replace("T", " "), return_date_str.replace("T", " "), purpose, initial_status, qr_token, eq["locker_id"], now.strftime("%Y-%m-%d %H:%M:%S")))

            if initial_status == "Approved":
                cursor.execute("UPDATE equipment SET status = 'Reserved' WHERE id = ?", (equipment_id,))

            cursor.execute("""
            INSERT INTO audit_logs (action, user_info, details, timestamp)
            VALUES (?, ?, ?, ?)
            """, ("CREATE_REQUEST", f"{user_name} ({user_id})", f"Borrow request {req_id} for '{eq['name']}'. Status: {initial_status}", now.strftime("%Y-%m-%d %H:%M:%S")))

            conn.commit()
            conn.close()

            self.send_json_response({
                "success": True,
                "request_id": req_id,
                "status": initial_status,
                "qr_code_token": qr_token,
                "pickup_locker": eq["locker_id"],
                "message": "Borrow request submitted for Admin approval." if initial_status == "Pending" else "Borrow request approved! Locker ready for pickup."
            })

        elif path == "/api/equipment":
            role = self.headers.get("X-User-Role", "student")
            if role != "admin":
                conn.close()
                self.send_json_response({"error": "BR-07: Authorization failed. Only Administrators can add equipment."}, 403)
                return

            name = body.get("name")
            category = body.get("category")
            specs = body.get("specifications", "")
            serial = body.get("serial_number") or f"SN-{category[:3].upper()}-{int(datetime.datetime.now().timestamp()) % 10000}"
            location = body.get("location", "Main Lab")
            locker_id = body.get("locker_id", "A-01")
            requires_approval = 1 if body.get("requires_approval") else 0
            image_icon = body.get("image_icon", "box")

            cursor.execute("""
            INSERT INTO equipment (name, category, specifications, serial_number, location, status, condition, battery_level, locker_id, requires_approval, image_icon)
            VALUES (?, ?, ?, ?, ?, 'Available', 'Excellent', 100, ?, ?, ?)
            """, (name, category, specs, serial, location, locker_id, requires_approval, image_icon))

            eq_id = cursor.lastrowid
            cursor.execute("""
            INSERT INTO audit_logs (action, user_info, details, timestamp)
            VALUES (?, ?, ?, ?)
            """, ("ADD_EQUIPMENT", "Lab Admin", f"Added '{name}' (ID: {eq_id}) in Locker {locker_id}", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "id": eq_id, "message": "Equipment added successfully!"})

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
                sql += " AND r.user_id = ? AND r.status IN ('Approved', 'CheckedOut')"
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
            if req["status"] == "Approved":
                cursor.execute("UPDATE borrow_requests SET status = 'CheckedOut' WHERE id = ?", (req["id"],))
                cursor.execute("UPDATE equipment SET status = 'Borrowed' WHERE id = ?", (req["equipment_id"],))

                cursor.execute("""
                INSERT INTO audit_logs (action, user_info, details, timestamp)
                VALUES (?, ?, ?, ?)
                """, ("IOT_PICKUP", req["user_name"], f"Unlocked Locker {req['locker_id']} - Equipment '{req['equipment_name']}' picked up.", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

                conn.commit()
                conn.close()
                self.send_json_response({
                    "success": True,
                    "action": "PICKUP",
                    "locker_id": req["locker_id"],
                    "equipment_name": req["equipment_name"],
                    "message": f"Locker {req['locker_id']} Unlocked! Please collect your {req['equipment_name']}."
                })

            elif req["status"] == "CheckedOut":
                cursor.execute("UPDATE borrow_requests SET status = 'Returned' WHERE id = ?", (req["id"],))
                cursor.execute("UPDATE equipment SET status = 'Available' WHERE id = ?", (req["equipment_id"],))

                cursor.execute("""
                INSERT INTO returns (request_id, returned_at, condition, remarks)
                VALUES (?, ?, 'Good', 'Returned via Smart Locker')
                """, (req["id"], datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

                cursor.execute("""
                INSERT INTO audit_logs (action, user_info, details, timestamp)
                VALUES (?, ?, ?, ?)
                """, ("IOT_RETURN", req["user_name"], f"Unlocked Locker {req['locker_id']} - Equipment '{req['equipment_name']}' returned. Status reset to Available.", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

                conn.commit()
                conn.close()
                self.send_json_response({
                    "success": True,
                    "action": "RETURN",
                    "locker_id": req["locker_id"],
                    "equipment_name": req["equipment_name"],
                    "message": f"Locker {req['locker_id']} Unlocked! Equipment returned successfully. Status reset to Available."
                })
            else:
                conn.close()
                self.send_json_response({"error": f"Request state is '{req['status']}'. Cannot perform locker action."}, 400)

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

        role = self.headers.get("X-User-Role", "student")

        if path.startswith("/api/borrow-requests/") and path.endswith("/approve"):
            if role != "admin":
                conn.close()
                self.send_json_response({"error": "BR-07: Authorization failed. Only Administrators can approve requests."}, 403)
                return

            req_id = path.split("/")[3]
            cursor.execute("SELECT * FROM borrow_requests WHERE id = ?", (req_id,))
            req = cursor.fetchone()
            if not req:
                conn.close()
                self.send_json_response({"error": "Borrow request not found"}, 404)
                return

            cursor.execute("UPDATE borrow_requests SET status = 'Approved' WHERE id = ?", (req_id,))
            cursor.execute("UPDATE equipment SET status = 'Reserved' WHERE id = ?", (req["equipment_id"],))

            cursor.execute("""
            INSERT INTO audit_logs (action, user_info, details, timestamp)
            VALUES (?, ?, ?, ?)
            """, ("ADMIN_APPROVE", "Lab Admin", f"Approved request {req_id} for student {req['user_id']}", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": f"Request {req_id} approved."})

        elif path.startswith("/api/borrow-requests/") and path.endswith("/reject"):
            if role != "admin":
                conn.close()
                self.send_json_response({"error": "BR-07: Authorization failed. Only Administrators can reject requests."}, 403)
                return

            req_id = path.split("/")[3]
            reason = body.get("reason", "Not specified by Admin")

            cursor.execute("SELECT * FROM borrow_requests WHERE id = ?", (req_id,))
            req = cursor.fetchone()
            if not req:
                conn.close()
                self.send_json_response({"error": "Borrow request not found"}, 404)
                return

            cursor.execute("UPDATE borrow_requests SET status = 'Rejected', rejection_reason = ? WHERE id = ?", (reason, req_id))
            cursor.execute("UPDATE equipment SET status = 'Available' WHERE id = ?", (req["equipment_id"],))

            cursor.execute("""
            INSERT INTO audit_logs (action, user_info, details, timestamp)
            VALUES (?, ?, ?, ?)
            """, ("ADMIN_REJECT", "Lab Admin", f"Rejected request {req_id}. Reason: {reason}", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": f"Request {req_id} rejected."})

        elif path.startswith("/api/borrow-requests/") and path.endswith("/return"):
            req_id = path.split("/")[3]
            cond = body.get("condition", "Good")
            remarks = body.get("remarks", "Returned at lab desk")

            cursor.execute("SELECT * FROM borrow_requests WHERE id = ?", (req_id,))
            req = cursor.fetchone()
            if not req:
                conn.close()
                self.send_json_response({"error": "Borrow request not found"}, 404)
                return

            cursor.execute("UPDATE borrow_requests SET status = 'Returned' WHERE id = ?", (req_id,))
            cursor.execute("UPDATE equipment SET status = 'Available', condition = ? WHERE id = ?", (cond, req["equipment_id"]))

            cursor.execute("""
            INSERT INTO returns (request_id, returned_at, condition, remarks)
            VALUES (?, ?, ?, ?)
            """, (req_id, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), cond, remarks))

            cursor.execute("""
            INSERT INTO audit_logs (action, user_info, details, timestamp)
            VALUES (?, ?, ?, ?)
            """, ("RETURN_RECORDED", "Lab Staff", f"Recorded return for request {req_id}. Status set to Available.", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": f"Request {req_id} returned. Equipment is now Available."})

        elif path.startswith("/api/equipment/") and path.endswith("/maintenance"):
            if role != "admin":
                conn.close()
                self.send_json_response({"error": "BR-07: Authorization failed. Admin only."}, 403)
                return

            eq_id = path.split("/")[3]
            maint_status = body.get("status", "Maintenance")

            cursor.execute("UPDATE equipment SET status = ? WHERE id = ?", (maint_status, eq_id))
            cursor.execute("""
            INSERT INTO audit_logs (action, user_info, details, timestamp)
            VALUES (?, ?, ?, ?)
            """, ("MAINTENANCE_TOGGLE", "Lab Admin", f"Equipment ID {eq_id} status changed to {maint_status}", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "message": f"Equipment status updated to {maint_status}."})

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
    print("  Smart Campus Equipment Borrowing System Online  ")
    print(f"  Server listening at: http://localhost:{selected_port}   ")
    print("==================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()


if __name__ == "__main__":
    run_server()
