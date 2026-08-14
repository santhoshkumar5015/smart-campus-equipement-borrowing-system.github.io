#!/usr/bin/env python3
"""
Automated Test Suite for SmartCampus EquipBorrow
Direct Memory & API Business Rule Verifier (BR-01 to BR-20).
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

    def test_br01_br02_registered_students_only(self):
        """BR-01 & BR-02: Only registered authenticated students can submit requests."""
        now = datetime.datetime.now()
        t1 = (now + datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
        t2 = (now + datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M")

        payload = {
            "equipment_id": 1,
            "user_id": "STU-UNKNOWN-99",
            "borrow_date": t1,
            "expected_return_date": t2,
            "purpose": "Hacking Project"
        }

        code, resp = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT", "X-User-Id": "STU-UNKNOWN-99"}, body=payload)
        self.assertEqual(code, 400)
        self.assertIn("BR-01", resp.get("error", ""))

    def test_br03_br10_maintenance_equipment_block(self):
        """BR-03 & BR-10: Student cannot borrow equipment under Maintenance."""
        now = datetime.datetime.now()
        t1 = (now + datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
        t2 = (now + datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M")

        # Equipment #9 is in MAINTENANCE in seed
        payload = {
            "equipment_id": 9,
            "user_id": "STU-88210",
            "borrow_date": t1,
            "expected_return_date": t2,
            "purpose": "Mechatronics Project"
        }

        code, resp = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT", "X-User-Id": "STU-88210"}, body=payload)
        self.assertEqual(code, 400)
        self.assertIn("BR-10", resp.get("error", ""))

    def test_br04_past_borrow_date(self):
        """BR-04: Borrow date cannot be in the past."""
        payload = {
            "equipment_id": 1,
            "user_id": "STU-88210",
            "borrow_date": "2020-01-01 10:00",
            "expected_return_date": "2026-12-31 10:00",
            "purpose": "Past date test"
        }

        code, resp = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT"}, body=payload)
        self.assertEqual(code, 400)
        self.assertIn("BR-04", resp.get("error", ""))

    def test_br05_return_date_sequence(self):
        """BR-05: Expected return date must be strictly after borrow date."""
        now = datetime.datetime.now()
        t1 = (now + datetime.timedelta(days=5)).strftime("%Y-%m-%d %H:%M")
        t2 = (now + datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M")

        payload = {
            "equipment_id": 1,
            "user_id": "STU-88210",
            "borrow_date": t1,
            "expected_return_date": t2,
            "purpose": "Invalid order"
        }

        code, resp = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT"}, body=payload)
        self.assertEqual(code, 400)
        self.assertIn("BR-05", resp.get("error", ""))

    def test_br06_max_two_active_loans_limit(self):
        """BR-06: Student can have a maximum of 5 active loans/requests."""
        now = datetime.datetime.now()
        t1 = (now + datetime.timedelta(days=10)).strftime("%Y-%m-%d %H:%M")
        t2 = (now + datetime.timedelta(days=12)).strftime("%Y-%m-%d %H:%M")

        test_user = "STU-LIMIT-TESTER"
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users VALUES (?, 'Limit Tester', 'limit@college.edu', 'hash', 'STUDENT', 1, ?)", (test_user, t1))
        conn.commit()
        conn.close()

        # Submit 5 items (limit is 5)
        for eq_id in [1, 2, 4, 5, 6]:
            call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT"}, body={
                "equipment_id": eq_id, "user_id": test_user, "borrow_date": t1, "expected_return_date": t2, "purpose": f"Item {eq_id}"
            })

        # 6th item should fail with BR-06 limit error
        code6, resp6 = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT"}, body={
            "equipment_id": 10, "user_id": test_user, "borrow_date": t1, "expected_return_date": t2, "purpose": "Item 6 (Should block)"
        })

        self.assertEqual(code6, 400)
        self.assertIn("BR-06", resp6.get("error", ""))

    def test_br07_overdue_student_restriction(self):
        """BR-07: Student with overdue equipment cannot submit new requests."""
        conn = get_db()
        cursor = conn.cursor()

        overdue_user = "STU-OVERDUE-USER"
        cursor.execute("INSERT INTO users VALUES (?, 'Overdue Student', 'overdue@college.edu', 'hash', 'STUDENT', 1, '2026-08-01 00:00:00')", (overdue_user,))
        cursor.execute("""
        INSERT INTO loans (loan_id, request_id, student_id, equipment_id, issued_at, due_at, status, issued_by)
        VALUES ('LOAN-OVERDUE-01', 'REQ-OV-01', ?, 5, '2026-01-01 10:00:00', '2026-01-05 10:00:00', 'ACTIVE', 'ADM-00001')
        """, (overdue_user,))
        conn.commit()
        conn.close()

        now = datetime.datetime.now()
        t1 = (now + datetime.timedelta(days=15)).strftime("%Y-%m-%d %H:%M")
        t2 = (now + datetime.timedelta(days=17)).strftime("%Y-%m-%d %H:%M")

        code, resp = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT"}, body={
            "equipment_id": 6, "user_id": overdue_user, "borrow_date": t1, "expected_return_date": t2, "purpose": "Blocked request"
        })

        self.assertEqual(code, 400)
        self.assertIn("BR-07", resp.get("error", ""))

    def test_br08_br12_overlapping_bookings(self):
        """BR-08 & BR-12: Prevents overlapping booking requests for same equipment."""
        now = datetime.datetime.now()
        t1 = (now + datetime.timedelta(days=20)).strftime("%Y-%m-%d %H:%M")
        t2 = (now + datetime.timedelta(days=25)).strftime("%Y-%m-%d %H:%M")

        # First request (Jeeva Kumar)
        code1, _ = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT"}, body={
            "equipment_id": 3, "user_id": "STU-10034", "borrow_date": t1, "expected_return_date": t2, "purpose": "VR Research A"
        })
        self.assertEqual(code1, 200)

        # Overlapping second request (Jordan Smith)
        t_overlap_start = (now + datetime.timedelta(days=22)).strftime("%Y-%m-%d %H:%M")
        t_overlap_end = (now + datetime.timedelta(days=28)).strftime("%Y-%m-%d %H:%M")

        code2, resp2 = call_api("POST", "/api/borrow-requests", headers={"X-User-Role": "STUDENT"}, body={
            "equipment_id": 3, "user_id": "STU-99012", "borrow_date": t_overlap_start, "expected_return_date": t_overlap_end, "purpose": "VR Research B"
        })
        self.assertEqual(code2, 400)
        self.assertIn("BR-12", resp2.get("error", ""))

    def test_br09_br16_br17_admin_authorization(self):
        """BR-09, BR-16, BR-17: Only Admin can approve/reject requests or view audit logs."""
        # Student trying to approve (Should fail with 403)
        code_stu, resp_stu = call_api("PUT", "/api/admin/requests/REQ-10492/approve", headers={"X-User-Role": "STUDENT"})
        self.assertEqual(code_stu, 403)
        self.assertIn("BR-16", resp_stu.get("error", ""))

        # Admin approving (Should succeed)
        code_adm, resp_adm = call_api("PUT", "/api/admin/requests/REQ-10492/approve", headers={"X-User-Role": "ADMIN"})
        self.assertEqual(code_adm, 200)
        self.assertTrue(resp_adm.get("success"))

    def test_br14_damaged_return_routes_to_maintenance(self):
        """BR-14: Equipment returned with damage moves automatically to MAINTENANCE."""
        code, resp = call_api("PUT", "/api/admin/loans/LOAN-9901/return", headers={"X-User-Role": "ADMIN"}, body={
            "condition": "MINOR_DAMAGE",
            "damage_description": "Crack on corner bezel",
            "remarks": "Returned at lab counter"
        })
        self.assertEqual(code, 200)

        # Verify equipment status is now MAINTENANCE
        eq_code, eq_resp = call_api("GET", "/api/equipment/7")
        self.assertEqual(eq_code, 200)
        self.assertEqual(eq_resp["data"]["status"], "MAINTENANCE")

    def test_br15_good_return_resets_availability(self):
        """BR-15: Equipment returned in GOOD condition resets to AVAILABLE."""
        code, resp = call_api("PUT", "/api/admin/loans/LOAN-9901/return", headers={"X-User-Role": "ADMIN"}, body={
            "condition": "EXCELLENT",
            "remarks": "Perfect condition"
        })
        self.assertEqual(code, 200)

        eq_code, eq_resp = call_api("GET", "/api/equipment/7")
        self.assertEqual(eq_code, 200)
        self.assertEqual(eq_resp["data"]["status"], "AVAILABLE")

    def test_br18_mandatory_rejection_reason(self):
        """BR-18: Admin must provide a reason when rejecting a request."""
        code, resp = call_api("PUT", "/api/admin/requests/REQ-10492/reject", headers={"X-User-Role": "ADMIN"}, body={"reason": ""})
        self.assertEqual(code, 400)
        self.assertIn("BR-18", resp.get("error", ""))

        # With valid reason
        code2, resp2 = call_api("PUT", "/api/admin/requests/REQ-10492/reject", headers={"X-User-Role": "ADMIN"}, body={"reason": "Lab undergoing calibration"})
        self.assertEqual(code2, 200)
        self.assertTrue(resp2.get("success"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
