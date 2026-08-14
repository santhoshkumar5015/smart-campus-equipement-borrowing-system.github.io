# User Guide & Manual - SmartCampus EquipBorrow

## System Workflows

### 👨‍🎓 Student User Flow
1. **Student Registration / Switch Profile**: Select student profile (e.g. Jeeva Kumar, Alex Rivera) or register a new college account with Register Number, Department (CSE, ECE, Robotics), Year, and Semester.
2. **Search & Check Availability**: Use search bar or category chips (*Computing*, *AV*, *VR/AR*, *Robotics*, *IoT & Hardware*, *Lab Tools*).
3. **Submit Borrow Request**:
   - Click **"Request Equipment"**.
   - Select Borrow Date and Expected Return Date.
   - Enter **Purpose** (e.g. *Final Year IoT Capstone Project*).
   - System validates business rules (BR-01..BR-08).
4. **Digital Pass & Pickup**:
   - View approved digital QR pass under **"My Requests & Loans"**.
   - Scan at IoT Kiosk or present at Lab Desk for instant issue.

### 🛠️ Lab Manager / Admin User Flow
1. **6-Metric Dashboard**: Inspect Total Inventory, Available Now, Active Loans, Pending Approvals, In Maintenance, and Overdue Gear.
2. **Review Pending Requests**: Approve requests or reject with a mandatory reason (BR-16..BR-18).
3. **Process Returns with Condition Check**:
   - Inspect gear upon return: `EXCELLENT`, `GOOD`, `MINOR_DAMAGE`, `MAJOR_DAMAGE`, `MISSING_PARTS` (BR-19).
   - Good gear auto-resets to `AVAILABLE` (BR-15).
   - Damaged gear auto-transitions to `MAINTENANCE` and logs a maintenance ticket (BR-14).
4. **Maintenance Management**: View reported issues, mark repair as `IN_PROGRESS`, or complete repair to restore to `AVAILABLE`.
5. **Security Audit Stream**: View real-time security audit logs (BR-20).
