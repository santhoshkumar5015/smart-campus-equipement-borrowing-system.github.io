# AI Change-Loop Log (Stage 3 Assessment Evidence Document)

This log documents the **AI-Assisted Development → Red Run (Failing Test) → AI Self-Diagnosis → Self-Correction → Green Run** verification loop for **SmartCampus EquipBorrow**.

---

## 1. Initial Implementation & Test Suite Generation
- AI generated Python backend REST API server (`server.py`) enforcing Business Rules BR-01 to BR-20.
- AI generated automated test verifier (`test_business_rules.py`).

---

## 2. Deliberate Bug Injection (Red Run Simulation)

### Bug Introduced in `server.py`:
Changed `MAX_ACTIVE_LOANS = 2` to `MAX_ACTIVE_LOANS = 5` (violating BR-06 borrowing limit constraint).

### Test Suite Output (RED RUN):
```text
FAIL: test_br06_max_two_active_loans_limit (__main__.TestBusinessRules)
----------------------------------------------------------------------
AssertionError: 200 != 400
Expected: 400 Bad Request (Borrowing Limit Exceeded)
Actual: 200 OK (Third item allowed unexpectedly!)
```

---

## 3. AI Diagnosis & Self-Correction

### AI Prompt:
> *"The borrowing limit test `test_br06_max_two_active_loans_limit` failed with 200 OK instead of 400 Bad Request. A student with 2 active loans must not be allowed to borrow a 3rd item. Diagnose the root cause and restore the constraint."*

### AI Diagnosis:
> *"The system constant `MAX_ACTIVE_LOANS` was mutated from 2 to 5. The business logic check `active_loans_count + active_req_count >= MAX_ACTIVE_LOANS` did not trigger on the 3rd item."*

### AI Fix Applied:
Restored `MAX_ACTIVE_LOANS = 2` in `server.py`.

---

## 4. Re-Test Verification (GREEN RUN)

### Final Test Output:
```text
test_br01_br02_registered_students_only ... ok
test_br03_br10_maintenance_equipment_block ... ok
test_br04_past_borrow_date ... ok
test_br05_return_date_sequence ... ok
test_br06_max_two_active_loans_limit ... ok
test_br07_overdue_student_restriction ... ok
test_br08_br12_overlapping_bookings ... ok
test_br09_br16_br17_admin_authorization ... ok
test_br14_damaged_return_routes_to_maintenance ... ok
test_br15_good_return_resets_availability ... ok
test_br18_mandatory_rejection_reason ... ok

----------------------------------------------------------------------
Ran 11 tests in 0.072s

OK
```
