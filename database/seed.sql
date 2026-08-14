-- ====================================================================
-- SmartCampus EquipBorrow - Initial Seed Data (College Context)
-- ====================================================================

-- Seed Categories
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Computing & Laptops', 'Laptops, tablets, single-board computers, and workstations'),
(2, 'AV & Cinema', 'Projectors, cameras, microphones, tripods, and audio interfaces'),
(3, 'VR & AR', 'Virtual & Augmented Reality headsets, sensors, and controllers'),
(4, 'Robotics', 'Robot kits, actuators, LiDAR sensors, and ROS 2 platforms'),
(5, 'IoT & Hardware', 'ESP32, ESP8266, Arduino boards, sensor modules, and breadboards'),
(6, 'Lab Tools', 'Digital oscilloscopes, multimeters, DC power supplies, and soldering stations');

-- Seed Users (14 Students + 3 Admins = 17 Roles)
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
('STU-10034', 'Jeeva Kumar', 'jeeva@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-88210', 'Alex Rivera', 'arivera@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-99012', 'Jordan Smith', 'jsmith@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10055', 'Priya Sharma', 'psharma@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10078', 'Karthik Raja', 'kraja@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10092', 'Ananya Patel', 'apatel@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10114', 'Rohan Verma', 'rverma@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10135', 'Sneha Reddy', 'sreddy@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10156', 'Vikram Sengupta', 'vgupta@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10178', 'Meera Krishnan', 'mkrishnan@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10201', 'Arjun Das', 'adas@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10223', 'Divya Nair', 'dnair@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10245', 'Siddharth Menon', 'smenon@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('STU-10267', 'Kavya Subramanian', 'ksubra@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
('ADM-00001', 'Dr. Sarah Vance (Lab Manager)', 'svance@college.edu', 'pbkdf2:sha256:admin_hash', 'ADMIN', '2026-08-01 09:00:00'),
('ADM-00002', 'Prof. Robert Lang (Robotics Director)', 'rlang@college.edu', 'pbkdf2:sha256:admin_hash', 'ADMIN', '2026-08-01 09:00:00'),
('ADM-00003', 'Ramesh Babu (Hardware Tech)', 'rbabu@college.edu', 'pbkdf2:sha256:admin_hash', 'ADMIN', '2026-08-01 09:00:00');

-- Seed Student Academic Profiles
INSERT INTO students (student_id, user_id, register_number, department, year, semester, section, phone) VALUES
('S-3050371', 'STU-3050371', 'RA2311003050371', 'CSE', 4, 7, 'A', '+91 9876543299'),
('S-10034', 'STU-10034', 'RA2311003050340', 'CSE', 4, 7, 'A', '+91 9876543212'),
('S-88210', 'STU-88210', 'RA2311003050112', 'ECE', 4, 7, 'A', '+91 9876543210'),
('S-99012', 'STU-99012', 'RA2311003050882', 'Robotics Engineering', 3, 5, 'B', '+91 9876543211'),
('S-10055', 'STU-10055', 'RA2311003050055', 'AI & Data Science', 3, 5, 'A', '+91 9876543213'),
('S-10078', 'STU-10078', 'RA2311003050078', 'Information Tech (IT)', 4, 7, 'C', '+91 9876543214'),
('S-10092', 'STU-10092', 'RA2311003050092', 'Cybersecurity', 2, 3, 'B', '+91 9876543215'),
('S-10114', 'STU-10114', 'RA2311003050114', 'Mechanical Engg', 4, 7, 'A', '+91 9876543216'),
('S-10135', 'STU-10135', 'RA2311003050135', 'EEE', 3, 5, 'B', '+91 9876543217'),
('S-10156', 'STU-10156', 'RA2311003050156', 'Aerospace Engg', 4, 7, 'A', '+91 9876543218'),
('S-10178', 'STU-10178', 'RA2311003050178', 'Biotechnology', 3, 5, 'A', '+91 9876543219'),
('S-10201', 'STU-10201', 'RA2311003050201', 'Civil Engg', 2, 3, 'C', '+91 9876543220'),
('S-10223', 'STU-10223', 'RA2311003050223', 'Chemical Engg', 3, 5, 'B', '+91 9876543221'),
('S-10245', 'STU-10245', 'RA2311003050245', 'Mechatronics', 4, 7, 'A', '+91 9876543222'),
('S-10267', 'STU-10267', 'RA2311003050267', 'VLSI & Microelectronics', 1, 1, 'A', '+91 9876543223');

-- Seed Equipment Units (with ₹40,000 Security Loan Value)
INSERT INTO equipment (id, category_id, name, serial_number, description, specifications, location, condition, status, purchase_date, equipment_value, locker_id, requires_approval, image_icon, created_at, updated_at) VALUES
(1, 1, 'MacBook Pro M3 Max 16"', 'SN-MBP-9021', 'High performance workstation laptop', 'Apple M3 Max 36GB RAM, 1TB SSD', 'CS Innovation Lab 201', 'EXCELLENT', 'AVAILABLE', '2025-06-10', 40000, 'A-01', 0, 'laptop', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(2, 2, 'Sony FX3 Cinema Camera Kit', 'SN-AV-4482', 'Full frame cinema camera for video shoots', 'Full-frame 4K, 24-70mm GM II lens, XLR handle', 'Media Studio B', 'GOOD', 'AVAILABLE', '2025-07-15', 40000, 'A-02', 1, 'camera', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(3, 3, 'Meta Quest 3 VR Headset (512GB)', 'SN-VR-8812', 'Standalone VR headset for spatial apps', 'Includes Touch Plus controllers & Link Cable', 'Spatial Computing Hub', 'EXCELLENT', 'AVAILABLE', '2025-08-20', 40000, 'A-03', 0, 'glasses', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(4, 4, 'DJI Mavic 3 Pro Cine Drone', 'SN-DRONE-304', 'Professional aerial filming drone', 'Tri-camera system, Apple ProRes, Smart Controller', 'Autonomous Systems Lab', 'EXCELLENT', 'AVAILABLE', '2025-09-01', 40000, 'A-04', 1, 'drone', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(5, 5, 'ESP32 IoT Development Starter Kit', 'SN-ESP32-001', 'Wi-Fi & Bluetooth IoT dev board bundle', 'ESP32 NodeMCU, OLED display, DHT11, Relays', 'IoT Hardware Lab 102', 'GOOD', 'AVAILABLE', '2025-10-05', 40000, 'A-05', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(6, 6, 'Rigol 100MHz Digital Oscilloscope', 'SN-SCOPE-110', '4-Channel digital storage oscilloscope', '100MHz bandwidth, 1GSa/s sampling rate, Probes', 'Circuit Design Lab', 'GOOD', 'AVAILABLE', '2025-11-12', 40000, 'A-06', 0, 'activity', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(7, 1, 'iPad Pro 12.9 M2 + Pencil', 'SN-IPAD-551', 'Tablet for design & UI prototyping', '256GB Wi-Fi, Apple Pencil v2, Magic Keyboard', 'Design Innovation Studio', 'GOOD', 'BORROWED', '2025-12-01', 40000, 'B-01', 0, 'tablet', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(8, 2, 'Shure SM7B + Focusrite Podcasting Kit', 'SN-AUDIO-992', 'Broadcast quality voice recording bundle', 'Broadcast Mic, Cloudlifter CL-1, Scarlett 2i2', 'Podcast Studio 2', 'EXCELLENT', 'AVAILABLE', '2026-01-10', 40000, 'B-02', 0, 'mic', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(9, 4, 'TurtleBot 4 ROS 2 Mobile Robot', 'SN-BOT-004', 'ROS 2 autonomous navigation research platform', 'iRobot Create 3 base, OAK-D Pro camera, LiDAR', 'Mechatronics Lab', 'MINOR_DAMAGE', 'MAINTENANCE', '2026-02-14', 40000, 'B-03', 1, 'bot', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(10, 5, 'Raspberry Pi 5 Lab Starter Bundle', 'SN-RPI-505', 'Embedded Linux computing platform', '8GB RAM, NVMe Base, Touchscreen, Sensors', 'Embedded Systems Room', 'GOOD', 'AVAILABLE', '2026-03-01', 40000, 'B-04', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00');

-- Seed Borrow Requests & Active Loans (₹40,000 Security Loan Value for half of the students, 1-Month Return Window)
INSERT INTO borrow_requests (id, student_id, equipment_id, borrow_date, expected_return_date, purpose, status, approved_by, qr_code_token, pickup_locker, created_at, updated_at) VALUES
('REQ-30501', 'STU-3050371', 8, '2026-08-10 09:00', '2026-09-08 17:00', 'Final Year Capstone Project ML Model Training', 'APPROVED', 'ADM-00001', 'QR-REQ-30501-STU-3050371', 'B-02', '2026-08-09 10:00:00', '2026-08-09 10:30:00'),
('REQ-10492', 'STU-88210', 7, '2026-08-10 10:00', '2026-09-09 17:00', 'UI Capstone Prototyping Demo', 'APPROVED', 'ADM-00001', 'QR-REQ-10492-STU-88210', 'B-01', '2026-08-09 14:00:00', '2026-08-09 14:30:00');

INSERT INTO loans (loan_id, request_id, student_id, equipment_id, issued_at, due_at, status, issued_by) VALUES
('LOAN-30501', 'REQ-30501', 'STU-3050371', 8, '2026-08-10 09:15:00', '2026-09-08 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-9901', 'REQ-10492', 'STU-88210', 7, '2026-08-10 10:15:00', '2026-09-09 17:00:00', 'ACTIVE', 'ADM-00001');

-- Seed Maintenance Item
INSERT INTO maintenance (equipment_id, issue, reported_at, reported_by, status, resolution) VALUES
(9, 'Right wheel drive motor gear slipping & LiDAR cable loose', '2026-08-05 11:20:00', 'ADM-00001', 'IN_PROGRESS', 'Replacement motor assembly ordered from supplier');

-- Seed Audit Log Entry
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details) VALUES
('SYSTEM', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'SYS-01', '2026-08-01 09:00:00', 'SmartCampus EquipBorrow database initialized with 6 categories, 17 user roles, and 10 equipment units.');
