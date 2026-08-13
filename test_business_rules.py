#!/usr/bin/env python3
"""
Automated Test Suite for Smart Campus Equipment Borrowing System
Direct Memory & API Business Rule Verifier (BR-01 to BR-10).
Run with: python3 test_business_rules.py
"""

import os
import json
import unittest
import datetime
from io import BytesIO

from server import init_db, get_db, DB_PATH, SmartCampusRequestHandler


class DummyWFile:
    def __init__(self):
        self.bytes = bytearray()

    def write(self, b):
        self.bytes.extend(b)

    def get_json(self):
        return json.loads(self.bytes.decode("utf-8"))


class MockSmartCampusHandler(SmartCampusRequestHandler):
    def __init__(self, method, path, headers=None, body=None):
        self.method = method
        self.path = path
        self.headers = headers or {}
        
        body_bytes = json.dumps(body).encode("utf-8") if body is not None else b""
        self.headers["Content-Length"] = str(len(body_bytes))
        
        self.rfile = BytesIO(body_bytes)
        self.wfile = DummyWFile()
        self.response_code = 200
        self.response_headers = {}

    def send_response(self, code, message=None):
        self.response_code = code

    def send_header(self, keyword, value):
        self.response_headers[keyword] = value

    def end_headers(self):
        pass


def call_api(method, path, headers=None, body=None):
    handler = MockSmartCampusHandler(method, path, headers, body)
    if method == "GET":
        handler.do_GET()
    elif method == "POST":
        handler.do_POST()
    elif method == "PUT":
        handler.do_PUT()
    return handler.response_code, handler.wfile.get_json()


class TestBusinessRules(unittest.TestCase):

    def setUp(self):
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
        init_db()

    def test_br01_equipment_availability(self):
        """BR-01: A student cannot request equipment under Maintenance."""
        call_api("PUT", "/api/equipment/9/maintenance", headers={"X-User-Role": "admin"}, body={"status": "Maintenance"})

        now = datetime.datetime.now()
        tomorrow = (now + datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
        next_day = (now + datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M")

        payload = {
            "equipment_id": 9,
            "user_id": "STU-99012",
            "user_name": "Jordan Smith",
            "borrow_date": tomorrow,
            "return_date": next_day,
            "purpose": "Robotics Competition"
        }

        code, resp = call_api("POST", "/api/borrow-requests", body=payload)
        self.assertEqual(code, 400)
        self.assertIn("BR-01", resp.get("error", ""))

    def test_br02_past_borrow_date(self):
        """BR-02: Borrow date cannot be in the past."""
        payload = {
            "equipment_id": 1,
            "user_id": "STU-99012",
            "borrow_date": "2020-01-01 10:00",
            "return_date": "2026-12-31 10:00",
            "purpose": "Past date test"
        }

        code, resp = call_api("POST", "/api/borrow-requests", body=payload)
        self.assertEqual(code, 400)
        self.assertIn("BR-02", resp.get("error", ""))

    def test_br03_return_before_borrow_date(self):
        """BR-03: Return date must be strictly after the borrow date."""
        now = datetime.datetime.now()
        future1 = (now + datetime.timedelta(days=5)).strftime("%Y-%m-%d %H:%M")
        future2 = (now + datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M")

        payload = {
            "equipment_id": 1,
            "user_id": "STU-99012",
            "borrow_date": future1,
            "return_date": future2,
            "purpose": "Invalid date order test"
        }

        code, resp = call_api("POST", "/api/borrow-requests", body=payload)
        self.assertEqual(code, 400)
        self.assertIn("BR-03", resp.get("error", ""))

    def test_br04_overlapping_bookings(self):
        """BR-04: Equipment cannot be approved for overlapping booking periods."""
        now = datetime.datetime.now()
        d1 = (now + datetime.timedelta(days=10)).strftime("%Y-%m-%d %H:%M")
        d2 = (now + datetime.timedelta(days=15)).strftime("%Y-%m-%d %H:%M")

        payload1 = {
            "equipment_id": 2,
            "user_id": "STU-99012",
            "user_name": "Jordan Smith",
            "borrow_date": d1,
            "return_date": d2,
            "purpose": "Film Production A"
        }
        code1, _ = call_api("POST", "/api/borrow-requests", body=payload1)
        self.assertEqual(code1, 200)

        d_overlap_start = (now + datetime.timedelta(days=12)).strftime("%Y-%m-%d %H:%M")
        d_overlap_end = (now + datetime.timedelta(days=18)).strftime("%Y-%m-%d %H:%M")

        payload2 = {
            "equipment_id": 2,
            "user_id": "STU-88210",
            "user_name": "Alex Rivera",
            "borrow_date": d_overlap_start,
            "return_date": d_overlap_end,
            "purpose": "Film Production B (Overlapping)"
        }
        code2, resp2 = call_api("POST", "/api/borrow-requests", body=payload2)
        self.assertEqual(code2, 400)
        self.assertIn("BR-04", resp2.get("error", ""))

    def test_br05_max_two_active_borrowings_limit(self):
        """BR-05: A student can have a maximum of 2 active equipment borrowings."""
        now = datetime.datetime.now()
        d1 = (now + datetime.timedelta(days=20)).strftime("%Y-%m-%d %H:%M")
        d2 = (now + datetime.timedelta(days=22)).strftime("%Y-%m-%d %H:%M")

        test_user = "STU-LIMIT-USER"

        call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 3, "user_id": test_user, "user_name": "Limit Tester", "borrow_date": d1, "return_date": d2, "purpose": "Item 1"
        })

        call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 4, "user_id": test_user, "user_name": "Limit Tester", "borrow_date": d1, "return_date": d2, "purpose": "Item 2"
        })

        code3, resp3 = call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 5, "user_id": test_user, "user_name": "Limit Tester", "borrow_date": d1, "return_date": d2, "purpose": "Item 3 (Should fail)"
        })

        self.assertEqual(code3, 400)
        self.assertIn("BR-05", resp3.get("error", ""))

    def test_br06_overdue_student_restriction(self):
        """BR-06: Student with overdue borrowings cannot create new requests."""
        conn = get_db()
        cursor = conn.cursor()

        overdue_user = "STU-OVERDUE"
        past1 = "2026-01-01 10:00"
        past2 = "2026-01-05 10:00"
        cursor.execute("""
        INSERT INTO borrow_requests (id, equipment_id, user_id, user_name, user_email, borrow_date, return_date, purpose, status, qr_code_token, pickup_locker, created_at)
        VALUES ('REQ-OVERDUE-01', 6, ?, 'Overdue Tester', 'overdue@campus.edu', ?, ?, 'Overdue Test', 'Overdue', 'QR-OVERDUE', 'A-06', ?)
        """, (overdue_user, past1, past2, past1))
        conn.commit()
        conn.close()

        now = datetime.datetime.now()
        d1 = (now + datetime.timedelta(days=30)).strftime("%Y-%m-%d %H:%M")
        d2 = (now + datetime.timedelta(days=32)).strftime("%Y-%m-%d %H:%M")

        code, resp = call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 8, "user_id": overdue_user, "borrow_date": d1, "return_date": d2, "purpose": "Blocked request"
        })

        self.assertEqual(code, 400)
        self.assertIn("BR-06", resp.get("error", ""))

    def test_br07_admin_only_approval(self):
        """BR-07: Student cannot approve/reject requests (Admin required)."""
        code, resp = call_api("PUT", "/api/borrow-requests/REQ-10492/approve", headers={"X-User-Role": "student"})
        self.assertEqual(code, 403)
        self.assertIn("BR-07", resp.get("error", ""))

        code_admin, resp_admin = call_api("PUT", "/api/borrow-requests/REQ-10492/approve", headers={"X-User-Role": "admin"})
        self.assertEqual(code_admin, 200)
        self.assertTrue(resp_admin.get("success"))

    def test_br08_return_resets_equipment_availability(self):
        """BR-08: After equipment is returned, its status becomes Available again."""
        code, _ = call_api("PUT", "/api/borrow-requests/REQ-10492/return", body={"condition": "Good", "remarks": "Returned on time"})
        self.assertEqual(code, 200)

        eq_code, eq_resp = call_api("GET", "/api/equipment/7")
        self.assertEqual(eq_code, 200)
        self.assertEqual(eq_resp["data"]["status"], "Available")

    def test_br09_invalid_input_validation(self):
        """BR-09: Invalid inputs (missing fields, nonexistent IDs) must be rejected."""
        # Missing purpose
        code1, resp1 = call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 1, "borrow_date": "2026-10-10 10:00", "return_date": "2026-10-12 10:00"
        })
        self.assertEqual(code1, 400)
        self.assertIn("BR-09", resp1.get("error", ""))

        # Nonexistent equipment ID
        now = datetime.datetime.now()
        d1 = (now + datetime.timedelta(days=10)).strftime("%Y-%m-%d %H:%M")
        d2 = (now + datetime.timedelta(days=12)).strftime("%Y-%m-%d %H:%M")

        code2, resp2 = call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 99999, "borrow_date": d1, "return_date": d2, "purpose": "Testing"
        })
        self.assertEqual(code2, 404)
        self.assertIn("BR-09", resp2.get("error", ""))

    def test_br10_duplicate_request_prevention(self):
        """BR-10: Student cannot create duplicate active requests for the same equipment."""
        now = datetime.datetime.now()
        d1 = (now + datetime.timedelta(days=40)).strftime("%Y-%m-%d %H:%M")
        d2 = (now + datetime.timedelta(days=42)).strftime("%Y-%m-%d %H:%M")

        call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 10, "user_id": "STU-DUP-USER", "borrow_date": d1, "return_date": d2, "purpose": "Raspberry Pi Project"
        })

        code, resp = call_api("POST", "/api/borrow-requests", body={
            "equipment_id": 10, "user_id": "STU-DUP-USER", "borrow_date": d1, "return_date": d2, "purpose": "Duplicate Raspberry Pi Request"
        })

        self.assertEqual(code, 400)
        self.assertIn("BR-10", resp.get("error", ""))


if __name__ == "__main__":
    unittest.main(verbosity=2)
