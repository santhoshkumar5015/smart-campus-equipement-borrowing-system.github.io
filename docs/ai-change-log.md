# AI Change-Loop Log (Stage 3 Assessment Document)

This log documents the **AI-Assisted Development → Red Run (Failing Test) → AI Self-Diagnosis → Self-Correction → Green Run** verification loop.

---

## 1. Initial Implementation & Test Suite Generation
- AI generated Python backend REST API server (`server.py`) enforcing Business Rules BR-01 to BR-10.
- AI generated automated test verifier (`test_business_rules.py`).

---

## 2. Green Run Verification
- Executed `python3 test_business_rules.py`.
- **Result**: All 10 Business Rule tests passed cleanly.

---

## 3. Deliberate Bug Injection (Red Run Simulation)

### Bug Introduced in `server.py`:
Changed `MAX_ACTIVE_BORROWINGS = 2` to `MAX_ACTIVE_BORROWINGS = 5` (breaking BR-05 rule constraint limit of 2 active borrowings).

### Test Suite Output (RED RUN):
```text
FAIL: test_br05_max_two_active_borrowings_limit (__main__.TestBusinessRules)
----------------------------------------------------------------------
AssertionError: 200 != 400
Expected: 400 Bad Request (Limit Exceeded)
Actual: 200 OK (Third item allowed unexpectedly!)
```

---

## 4. AI Diagnosis & Self-Correction

### AI Prompt Given:
> *"The borrowing limit test `test_br05_max_two_active_borrowings_limit` is failing with 200 OK instead of 400 Bad Request. A student with 2 active borrowings must not be allowed to borrow a third item. Diagnose the root cause and restore the constraint."*

### AI Diagnosis:
> *"The system constant `MAX_ACTIVE_BORROWINGS` was mutated from 2 to 5. The business logic check `active_count >= MAX_ACTIVE_BORROWINGS` did not trigger on the 3rd item."*

### AI Fix Applied:
Restored `MAX_ACTIVE_BORROWINGS = 2` in `server.py`.

---

## 5. Re-Test Verification (GREEN RUN)

### Final Test Output:
```text
test_br01_equipment_availability ... ok
test_br02_past_borrow_date ... ok
test_br03_return_before_borrow_date ... ok
test_br04_overlapping_bookings ... ok
test_br05_max_two_active_borrowings_limit ... ok
test_br06_overdue_student_restriction ... ok
test_br07_admin_only_approval ... ok
test_br08_return_resets_equipment_availability ... ok
test_br09_invalid_input_validation ... ok
test_br10_duplicate_request_prevention ... ok

----------------------------------------------------------------------
Ran 10 tests in 0.042s

OK
```
