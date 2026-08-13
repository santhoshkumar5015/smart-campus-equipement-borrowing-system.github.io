# User Guide & Manual - Smart Campus Equipment System

## Quick Start Instructions

1. **Launch the System**:
   ```bash
   python3 server.py
   ```
2. **Access Web Application**:
   Open browser at: `http://localhost:8080`

3. **Run Automated Business Rule Test Suite**:
   ```bash
   python3 test_business_rules.py
   ```

---

## User Workflows

### 👨‍🎓 Student Workflow
1. **Browse Equipment**: Use search box or category filter chips (*Computing*, *AV*, *VR/AR*, *Robotics*).
2. **Submit Borrow Request**:
   - Click **"Request Equipment"**.
   - Select Pickup Date and Return Date.
   - Enter project **Purpose** (e.g. *Robotics Lab Project*).
   - Click **Submit Request**.
3. **Digital QR Pickup Pass**:
   - Navigate to **"My Requests & Pass"** tab.
   - Click **"Pass & QR"** to render your digital equipment pass.
4. **IoT Locker Pickup & Return**:
   - Open **"IoT Locker Kiosk"** tab.
   - Type your QR token or click **"Tap Alex Rivera's ID"** (RFID badge simulation).
   - Watch locker door unlock with visual solenoid door open animation!

### 🛠️ Lab Administrator Workflow
1. **Switch Active Role**: Select `🛠️ Lab Admin (Dr. Sarah Vance)` in top right navbar dropdown.
2. **Review Pending Requests**:
   - Navigate to **"Admin Portal"** tab.
   - Review pending student requests with purpose & dates.
   - Click **"Approve"** (reserves item and issues locker token) or **"Reject"** (requires entering rejection reason).
3. **Manage Equipment Inventory**:
   - Click **"+ Add New Equipment"**.
   - Fill in details, locker slot assignment, and admin approval setting.
4. **Inspect Audit Trail**:
   - View real-time security audit logs for all transactions.
