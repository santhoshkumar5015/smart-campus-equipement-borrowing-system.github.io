# 🎓 SmartCampus EquipBorrow

> **A student-focused college equipment borrowing, approval, loan tracking, return, and maintenance management system built with Python 3 REST API, SQLite database, modern glassmorphic web UI, IoT locker simulator, and automated BR-01 to BR-20 business rule testing.**

---

## 🌟 Key Features

1. **Student College Portal**:
   - Register account with College Email (`jeeva@college.edu`), Register Number (`RA2311003050340`), Department (CSE, ECE, Robotics), Year, and Semester.
   - Equipment catalog search & category filters (*Computing*, *AV & Cinema*, *VR & AR*, *Robotics*, *IoT & Hardware*, *Lab Tools*).
   - Digital QR Code Borrowing Pass generator.

2. **6-Card Dashboard Metrics Overview**:
   - 📦 **Total Inventory**: All equipment units in college.
   - 🟢 **Available Now**: Equipment available for students.
   - 🔵 **Active Loans**: Issued equipment.
   - 🟡 **Pending Approvals**: Requests awaiting admin review.
   - 🔴 **In Maintenance**: Gear under damage/repair/inspection.
   - ⚠️ **Overdue Gear**: Instant visibility into non-returned equipment.

3. **Strict Business Rule Engine (BR-01 to BR-20)**:
   - Enforces student registration, past date checks, date sequence validation, overlapping booking prevention, **max 2 active loans limit**, overdue student restriction, admin-only role authorization (`X-User-Role`), mandatory rejection reasons, return condition checks (`EXCELLENT`, `GOOD`, `MINOR_DAMAGE`, `MAJOR_DAMAGE`, `MISSING_PARTS`), and automatic routing of damaged returns to the Maintenance pipeline.

4. **Maintenance Management Pipeline**:
   - Damaged equipment returns automatically trigger a maintenance ticket (`REPORTED` -> `IN_PROGRESS` -> `COMPLETED`) and lock the gear from being borrowed until repaired.

5. **IoT Locker Simulator & Security Audit Trail**:
   - 10-bay physical locker bank (Lockers A-01 to B-04) with solenoid door unlock animations, RFID ID card tap simulator, and real-time security audit log stream.

---

## 📁 Repository Structure

```text
smart_campus_equipment/
├── server.py               # Python REST API Server (BR-01..BR-20 Engine)
├── database/
│   ├── schema.sql          # 10 Relational Tables DDL Schema
│   └── seed.sql            # College Student & Inventory Seed Data
├── test_business_rules.py  # Automated Test Suite (BR-01 to BR-20)
├── static/
│   ├── index.html          # Single Page Web Application
│   ├── styles.css          # Glassmorphism UI Design System
│   └── app.js              # Client Application Logic & API Layer
├── docs/
│   ├── architecture.md     # System Architecture Specification
│   ├── design.md           # Database Schema & Business Rules Specification
│   ├── user-guide.md       # User Manual & API Guide
│   └── ai-change-log.md    # Stage 3 AI Build-Test-Fix Evidence Log
├── Procfile                # Heroku / Render Deployment Config
├── netlify.toml            # Netlify Deployment Config
├── vercel.json             # Vercel Deployment Config
├── render.yaml             # Render Blueprint Config
└── README.md               # Project Overview & Setup Guide
```

---

## 🚀 How to Run

### 1. Launch Backend REST Server
```bash
python3 server.py
```
Open **http://localhost:8080** in your browser!

### 2. Run Automated Business Rule Test Suite
```bash
python3 test_business_rules.py
```
Outputs `OK` for all 11 Business Rule tests!
