# 🎓 Smart Campus Equipment Borrowing & Return Platform

> **A rule-driven, full-stack Smart Campus Equipment Borrowing Platform built with Python 3 REST API, SQLite database, modern glassmorphism web UI, IoT locker simulator, and automated AI business rule testing.**

---

## 🌟 Key Features

1. **Equipment Catalog & Smart Search**:
   - Filter by categories (*Computing & Laptops*, *AV & Cinema*, *VR & AR*, *Robotics & Drones*, *IoT & Electronics*, *Lab Tools*).
   - Real-time battery indicator, specs, location, and availability status.

2. **Strict Business Rule Engine (BR-01 to BR-10)**:
   - **BR-01**: Block borrowing items under maintenance.
   - **BR-02**: Block past borrow dates.
   - **BR-03**: Return date must be strictly after borrow date.
   - **BR-04**: Prevent overlapping date reservations for the same equipment.
   - **BR-05**: Strict borrowing limit (**Max 2 active borrowings per student**).
   - **BR-06**: Overdue restriction (students with overdue gear cannot borrow new items).
   - **BR-07**: Role-based authorization (**Admin-only approvals & rejections**).
   - **BR-08**: Automatic status reset to `'Available'` upon item return.
   - **BR-09**: Input validation for missing fields and invalid IDs.
   - **BR-10**: Prevent duplicate active requests for the same user & equipment.

3. **Digital Equipment Pass & QR Code Verification**:
   - Automatic HTML5 canvas QR pass generator for instant counter pickup.

4. **IoT Smart Locker Bank Simulator**:
   - Interactive 10-bay locker grid (Lockers A-01 to B-04) with solenoid door unlock animations and RFID Student ID badge tap simulation.

5. **Lab Manager & Admin Analytics Portal**:
   - Role switcher (`Student` vs `Lab Admin`).
   - 1-click Request Approval & Rejection with mandatory reason logging.
   - Real-time security audit logs.

---

## 📁 Repository Structure

```text
smart_campus_equipment/
├── server.py               # Backend Python REST API Server & DB Initializer
├── smart_campus.db         # SQLite Database Store
├── test_business_rules.py  # Automated Test Suite (BR-01 to BR-10)
├── static/
│   ├── index.html          # Single Page Web Application
│   ├── styles.css          # Dark Mode Glassmorphism Styling System
│   └── app.js              # Client Application Logic & API Layer
├── docs/
│   ├── architecture.md     # System Architecture Specification
│   ├── design.md           # Database Schema & Business Rules Specification
│   ├── user-guide.md       # User Manual & API Guide
│   └── ai-change-log.md    # Stage 3 AI Build-Test-Fix Evidence Log
└── README.md               # Project Overview & Setup Guide
```

---

## 🚀 How to Run

### 1. Launch Backend Server
```bash
python3 server.py
```
Open your browser at `http://localhost:8080`

### 2. Run Automated Test Suite (BR-01 to BR-10)
```bash
python3 test_business_rules.py
```
Outputs `OK` for all 10 Business Rule tests!
