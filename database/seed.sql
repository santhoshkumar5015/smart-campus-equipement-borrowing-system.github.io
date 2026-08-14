-- ====================================================================
-- SmartCampus EquipBorrow - Seed Data (100 Equipment Items across 6 Categories)
-- ====================================================================

-- 1. Seed Categories (6 Major Academic Departments / Labs)
INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'VISCOM / Visual Communication', 'DSLRs, Cinema Cameras, Lenses, Lighting, Stabilizers, and Studio Gear'),
(2, 'CSE / IT', 'Laptops, MacBooks, Tablets, Microcontrollers, Displays, and Network Tools'),
(3, 'ECE / EEE', 'Oscilloscopes, Multimeters, Power Supplies, Soldering Stations, and Component Kits'),
(4, 'Robotics / IoT / Embedded', 'Sensors, Actuators, LiDAR, GPS, Motors, Modules, and Autonomous Kits'),
(5, 'Mechanical / Automobile', 'Vernier Calipers, Micrometers, 3D Printers, CNC Tooling, and Workshop Kits'),
(6, 'Civil / Architecture', 'Total Stations, Optical Auto Levels, Laser Meters, Drafting Tools, and Testing Kits');

-- 2. Seed Users (15 Students + 3 Admins = 18 Roles)
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
('STU-3050371', 'Santhosh Kumar S', 'santhosh@college.edu', 'pbkdf2:sha256:student_hash', 'STUDENT', '2026-08-01 09:00:00'),
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

-- 3. Seed Student Academic Profiles
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

-- 4. Seed 100 Equipment Units Across All 6 Categories
INSERT INTO equipment (id, category_id, name, serial_number, description, specifications, location, condition, status, purchase_date, equipment_value, locker_id, requires_approval, image_icon, created_at, updated_at) VALUES
-- VISCOM / Visual Communication (IDs 1-20)
(1, 1, 'DSLR Camera', 'SN-VIS-001', 'Canon EOS 90D 32.5MP DSLR Camera', '32.5MP CMOS, 4K Video, Dual Pixel AF', 'Media Studio 1', 'EXCELLENT', 'AVAILABLE', '2025-06-10', 40000, 'A-01', 0, 'camera', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(2, 1, 'Mirrorless Camera', 'SN-VIS-002', 'Sony Alpha A7 IV Full-frame Camera', '33MP BSI CMOS, 4K 60p, 10-bit 4:2:2', 'Media Studio 1', 'GOOD', 'AVAILABLE', '2025-07-15', 40000, 'A-02', 1, 'camera', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(3, 1, 'Cinema Camera', 'SN-VIS-003', 'RED Komodo 6K Cinema Camera Kit', '6K Super35, Global Shutter, RF Mount', 'Film Studio A', 'EXCELLENT', 'AVAILABLE', '2025-08-20', 40000, 'A-03', 1, 'video', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(4, 1, 'Action Camera', 'SN-VIS-004', 'GoPro HERO 12 Black 5.3K Action Cam', '5.3K 60fps, HyperSmooth 6.0, HDR', 'Media Studio 2', 'EXCELLENT', 'AVAILABLE', '2025-09-01', 40000, 'A-04', 0, 'video', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(5, 1, 'Camcorder', 'SN-VIS-005', 'Panasonic X2000 4K Professional Camcorder', '1/2.5" Sensor, 24x Zoom, XLR Audio', 'Broadcast Room', 'GOOD', 'AVAILABLE', '2025-10-05', 40000, 'A-05', 0, 'video', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(6, 1, 'Camera Tripod', 'SN-VIS-006', 'Manfrotto 504HD Fluid Head Video Tripod', '75mm Bowl, 12kg Load Capacity, Carbon', 'Studio Storage', 'GOOD', 'AVAILABLE', '2025-11-12', 40000, 'A-06', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(7, 1, 'Monopod', 'SN-VIS-007', 'iFootage Cobra 2 Carbon Fiber Monopod', 'Low-profile tripod base, quick release', 'Studio Storage', 'GOOD', 'BORROWED', '2025-12-01', 40000, 'B-01', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(8, 1, 'Gimbal Stabilizer', 'SN-VIS-008', 'DJI RS 3 Pro 3-Axis Gimbal Stabilizer', 'Automated Axis Locks, LiDAR Focusing', 'Media Studio 1', 'EXCELLENT', 'BORROWED', '2026-01-10', 40000, 'B-02', 0, 'rotate-cw', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(9, 1, 'Camera Slider', 'SN-VIS-009', 'Edelkrone Motorized SliderPLUS Pro Kit', 'Dual motion tracking, app controlled', 'Film Studio A', 'MINOR_DAMAGE', 'MAINTENANCE', '2026-02-14', 40000, 'B-03', 1, 'sliders', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(10, 1, 'Camera Shoulder Rig', 'SN-VIS-010', 'SmallRig Shoulder Mount Rig System', '15mm Rod System, Matte Box, Follow Focus', 'Studio Storage', 'GOOD', 'AVAILABLE', '2026-03-01', 40000, 'B-04', 0, 'box', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(11, 1, '24-70mm Lens', 'SN-VIS-011', 'Canon EF 24-70mm f/2.8L II USM Zoom Lens', 'Professional f/2.8 constant aperture', 'Lens Cabinet 1', 'EXCELLENT', 'AVAILABLE', '2025-06-15', 40000, 'B-05', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(12, 1, '50mm Prime Lens', 'SN-VIS-012', 'Sony FE 50mm f/1.2 GM Prime Portrait Lens', 'Ultra-fast f/1.2, G Master optics', 'Lens Cabinet 1', 'EXCELLENT', 'AVAILABLE', '2025-07-20', 40000, 'B-06', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(13, 1, '70-200mm Lens', 'SN-VIS-013', 'Sigma 70-200mm f/2.8 DG DN OS Telephoto', 'Optical Stabilization, Dust & Splash Proof', 'Lens Cabinet 2', 'GOOD', 'AVAILABLE', '2025-08-25', 40000, 'C-01', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(14, 1, 'Wide Angle Lens', 'SN-VIS-014', 'Tamron 15-30mm f/2.8 Ultra-Wide Lens', 'Vibration Compensation, Dual MPU', 'Lens Cabinet 2', 'GOOD', 'AVAILABLE', '2025-09-10', 40000, 'C-02', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(15, 1, 'Camera Flash', 'SN-VIS-015', 'Godox V860III TTL Speedlite Flash Unit', 'Li-ion battery, 2.6s recycle time, TTL', 'Photo Studio B', 'GOOD', 'AVAILABLE', '2025-10-15', 40000, 'C-03', 0, 'zap', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(16, 1, 'LED Video Light', 'SN-VIS-016', 'Aputure Amaran 200d LED Video Light Kit', '200W Daylight COB, Bowens Mount, App', 'Lighting Bay 1', 'EXCELLENT', 'AVAILABLE', '2025-11-20', 40000, 'C-04', 0, 'sun', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(17, 1, 'Softbox Light', 'SN-VIS-017', 'Neewer Octagon Softbox Lighting Grid Set', '35" Softbox with Honeycomb Grid', 'Lighting Bay 1', 'GOOD', 'AVAILABLE', '2025-12-10', 40000, 'C-05', 0, 'sun', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(18, 1, 'Ring Light', 'SN-VIS-018', 'Elgato Ring Light 2500 Lumens Wi-Fi', 'OSRAM LEDs, Color Temp 2900K-7000K', 'Broadcast Room', 'EXCELLENT', 'AVAILABLE', '2026-01-15', 40000, 'C-06', 0, 'sun', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(19, 1, 'Reflector', 'SN-VIS-019', '5-in-1 Collapsible Light Reflector Panel', 'Gold, Silver, White, Black, Translucent', 'Lighting Bay 2', 'GOOD', 'AVAILABLE', '2026-02-01', 40000, 'D-01', 0, 'sun', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(20, 1, 'Green Screen', 'SN-VIS-020', 'Elgato Chroma Key Collapsible Green Screen', 'Pneumatic X-Frame, Wrinkle-Resistant', 'Chroma Studio', 'GOOD', 'AVAILABLE', '2026-02-20', 40000, 'D-02', 0, 'tv', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),

-- CSE / IT (IDs 21-40)
(21, 2, 'Laptop', 'SN-CSE-001', 'Dell XPS 15 i9 High Performance Laptop', 'Intel i9 13th Gen, 32GB RAM, RTX 4070', 'CS Lab 101', 'EXCELLENT', 'AVAILABLE', '2025-06-01', 40000, 'D-03', 0, 'laptop', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(22, 2, 'MacBook', 'SN-CSE-002', 'Apple MacBook Pro M3 Max 16 Workstation', 'Apple M3 Max 36GB RAM, 1TB SSD', 'CS Lab 201', 'EXCELLENT', 'AVAILABLE', '2025-06-10', 40000, 'D-04', 0, 'laptop', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(23, 2, 'iPad', 'SN-CSE-003', 'iPad Pro 12.9 M2 + Pencil v2 Bundle', '256GB Wi-Fi, Apple Pencil, Magic Keyboard', 'Design Hub', 'GOOD', 'AVAILABLE', '2025-07-01', 40000, 'D-05', 0, 'tablet', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(24, 2, 'Android Tablet', 'SN-CSE-004', 'Samsung Galaxy Tab S9 Ultra 5G Tablet', '14.6" AMOLED, S Pen, 512GB Storage', 'App Dev Lab', 'EXCELLENT', 'AVAILABLE', '2025-08-01', 40000, 'D-06', 0, 'tablet', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(25, 2, 'External Monitor', 'SN-CSE-005', 'LG UltraFine 27" 4K HDR Monitor Display', '4K IPS, USB-C 90W Power Delivery', 'CS Lab 102', 'GOOD', 'AVAILABLE', '2025-09-01', 40000, 'E-01', 0, 'monitor', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(26, 2, 'Keyboard', 'SN-CSE-006', 'Keychron K2 Wireless Mechanical Keyboard', 'Gateron G Pro Switches, RGB Backlight', 'Hardware Lab', 'EXCELLENT', 'AVAILABLE', '2025-10-01', 40000, 'E-02', 0, 'keyboard', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(27, 2, 'Mouse', 'SN-CSE-007', 'Logitech MX Master 3S Ergonomic Mouse', '8K DPI Tracking, Quiet Clicks, Bluetooth', 'Hardware Lab', 'EXCELLENT', 'AVAILABLE', '2025-11-01', 40000, 'E-03', 0, 'mouse', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(28, 2, 'Graphics Tablet', 'SN-CSE-008', 'Wacom Intuos Pro Paper Edition Medium', '8192 Pressure Levels, Pro Pen 2', 'Design Studio', 'GOOD', 'AVAILABLE', '2025-12-01', 40000, 'E-04', 0, 'edit-3', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(29, 2, 'Raspberry Pi 5', 'SN-CSE-009', 'Raspberry Pi 5 8GB RAM Starter Bundle', '8GB RAM, NVMe Hat, Active Cooler, Power', 'Embedded Lab', 'GOOD', 'AVAILABLE', '2026-01-01', 40000, 'E-05', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(30, 2, 'Arduino Uno', 'SN-CSE-010', 'Arduino Uno R4 Minima Microcontroller Board', 'RA4M1 32-bit ARM Cortex-M4, USB-C', 'Hardware Lab', 'GOOD', 'AVAILABLE', '2026-01-15', 40000, 'E-06', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(31, 2, 'Arduino Mega', 'SN-CSE-011', 'Arduino Mega 2560 R3 Microcontroller Kit', 'ATmega2560, 54 Digital I/O Pins', 'Hardware Lab', 'GOOD', 'AVAILABLE', '2026-02-01', 40000, 'F-01', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(32, 2, 'ESP32', 'SN-CSE-012', 'ESP32 NodeMCU Wi-Fi + Bluetooth Kit', 'Dual-core 240MHz, OLED Display, Relays', 'IoT Lab 102', 'GOOD', 'AVAILABLE', '2026-02-10', 40000, 'F-02', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(33, 2, 'ESP8266', 'SN-CSE-013', 'NodeMCU ESP8266 Wi-Fi Module Kit', '80MHz Tensilica L106, Micro USB', 'IoT Lab 102', 'GOOD', 'AVAILABLE', '2026-02-15', 40000, 'F-03', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(34, 2, 'Jetson Nano', 'SN-CSE-014', 'NVIDIA Jetson Nano B01 4GB AI Developer Kit', '128-core Maxwell GPU, Quad-core ARM', 'AI Lab 301', 'EXCELLENT', 'AVAILABLE', '2026-02-20', 40000, 'F-04', 1, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(35, 2, 'USB Hub', 'SN-CSE-015', 'Anker 10-Port Powered USB 3.0 Data Hub', '60W Power Delivery, Aluminum Casing', 'Network Lab', 'GOOD', 'AVAILABLE', '2026-03-01', 40000, 'F-05', 0, 'hard-drive', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(36, 2, 'External SSD', 'SN-CSE-016', 'Samsung T7 Shield 2TB Portable SSD', '1050MB/s Read Speed, IP65 Water Resistant', 'Server Room', 'EXCELLENT', 'AVAILABLE', '2026-03-05', 40000, 'F-06', 0, 'hard-drive', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(37, 2, 'External HDD', 'SN-CSE-017', 'WD My Passport 4TB Rugged External HDD', 'Password Encryption, USB 3.2 Gen 1', 'Server Room', 'GOOD', 'AVAILABLE', '2026-03-10', 40000, 'G-01', 0, 'hard-drive', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(38, 2, 'LAN Cable Tester', 'SN-CSE-018', 'Klein Tools Digital Network Cable Tester', 'Tests RJ45, RJ11, Coaxial Cables', 'Network Lab', 'GOOD', 'AVAILABLE', '2026-03-15', 40000, 'G-02', 0, 'activity', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(39, 2, 'Wi-Fi Adapter', 'SN-CSE-019', 'TP-Link AC1900 High Gain Dual Band USB Adapter', '1300Mbps 5GHz + 600Mbps 2.4GHz Antenna', 'Network Lab', 'GOOD', 'AVAILABLE', '2026-03-20', 40000, 'G-03', 0, 'wifi', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(40, 2, 'Portable Projector', 'SN-CSE-020', 'Anker Nebula Capsule II Smart HD Projector', 'Android TV 9.0, 720p HD, 8W Speaker', 'Seminar Room', 'EXCELLENT', 'AVAILABLE', '2026-03-25', 40000, 'G-04', 0, 'tv', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),

-- ECE / EEE (IDs 41-60)
(41, 3, 'Breadboard', 'SN-ECE-001', 'Solderless Breadboard 830 Tie-Points Set', '4 Power Rails, Double Strip Base', 'ECE Lab 1', 'GOOD', 'AVAILABLE', '2025-06-01', 40000, 'G-05', 0, 'grid', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(42, 3, 'Digital Multimeter', 'SN-ECE-002', 'Fluke 179 True-RMS Digital Multimeter', '1000V AC/DC, Temperature Probe, Backlight', 'Circuit Lab', 'EXCELLENT', 'AVAILABLE', '2025-07-01', 40000, 'G-06', 0, 'activity', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(43, 3, 'Oscilloscope', 'SN-ECE-003', 'Tektronix 200MHz 4-Channel Digital Storage Scope', '2GS/s Sampling, 7" Color Display', 'Circuit Lab', 'EXCELLENT', 'AVAILABLE', '2025-08-01', 40000, 'H-01', 0, 'activity', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(44, 3, 'Function Generator', 'SN-ECE-004', 'BK Precision 50MHz Arbitrary Waveform Generator', 'Dual Channel, Sine, Square, Pulse Waveforms', 'Signal Lab', 'GOOD', 'AVAILABLE', '2025-09-01', 40000, 'H-02', 0, 'activity', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(45, 3, 'Soldering Iron', 'SN-ECE-005', 'Weller 60W Temperature Controlled Soldering Iron', '200°C - 450°C Adjustable, ESD Safe', 'PCB Room', 'GOOD', 'AVAILABLE', '2025-10-01', 40000, 'H-03', 0, 'flame', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(46, 3, 'Soldering Station', 'SN-ECE-006', 'Hakko FX-888D Digital Soldering Station', 'Digital Display, 70W Ceramic Heater', 'PCB Room', 'EXCELLENT', 'AVAILABLE', '2025-11-01', 40000, 'H-04', 0, 'flame', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(47, 3, 'Hot Air Gun', 'SN-ECE-007', 'QUICK 861DW ESD Hot Air Rework Station', '1000W High Power, 120L/min Airflow', 'SMD Lab', 'EXCELLENT', 'AVAILABLE', '2025-12-01', 40000, 'H-05', 0, 'wind', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(48, 3, 'DC Power Supply', 'SN-ECE-008', 'Korad 30V 5A Adjustable DC Bench Power Supply', 'Digital LED Display, Constant Voltage/Current', 'Circuit Lab', 'GOOD', 'AVAILABLE', '2026-01-01', 40000, 'H-06', 0, 'zap', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(49, 3, 'Jumper Wire Kit', 'SN-ECE-009', '560-Piece Male/Female Ribbon Jumper Wires', 'Assorted Lengths 2.54mm Pin Spacing', 'Hardware Bay', 'GOOD', 'AVAILABLE', '2026-01-10', 40000, 'I-01', 0, 'share-2', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(50, 3, 'Resistor Kit', 'SN-ECE-010', '1/4W Metal Film Resistors Assortment (1300 Pcs)', '130 Values from 1 ohm to 1M ohm', 'Component Rack', 'GOOD', 'AVAILABLE', '2026-01-20', 40000, 'I-02', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(51, 3, 'Capacitor Kit', 'SN-ECE-011', 'Electrolytic & Ceramic Capacitor Pack (500 Pcs)', '50V Electrolytic & 50V Ceramic Discs', 'Component Rack', 'GOOD', 'AVAILABLE', '2026-02-01', 40000, 'I-03', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(52, 3, 'Transistor Kit', 'SN-ECE-012', 'NPN & PNP BJT Transistor Assortment Pack', '2N2222, BC547, BC557, TIP120, MOSFETs', 'Component Rack', 'GOOD', 'AVAILABLE', '2026-02-10', 40000, 'I-04', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(53, 3, 'IC Kit', 'SN-ECE-013', '555 Timer, Op-Amp & Logic Gate Integrated Circuits', 'NE555, LM358, 74HC595, CD4017, LM741', 'Component Rack', 'GOOD', 'AVAILABLE', '2026-02-15', 40000, 'I-05', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(54, 3, 'LED Kit', 'SN-ECE-014', '5mm Tri-Color Diffused LED Assortment Set', 'Red, Green, Blue, Yellow, White LEDs', 'Component Rack', 'GOOD', 'AVAILABLE', '2026-02-20', 40000, 'I-06', 0, 'zap', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(55, 3, '7-Segment Display', 'SN-ECE-015', '4-Digit 0.56" Red 7-Segment LED Display Pack', 'Common Anode / Cathode Modules', 'Component Rack', 'GOOD', 'AVAILABLE', '2026-03-01', 40000, 'J-01', 0, 'grid', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(56, 3, 'LCD Display', 'SN-ECE-016', '16x2 Character LCD Module with I2C Backlight', 'Blue Screen 5V with HD44780 Controller', 'IoT Bay', 'GOOD', 'AVAILABLE', '2026-03-05', 40000, 'J-02', 0, 'tv', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(57, 3, 'OLED Display', 'SN-ECE-017', '0.96" 128x64 Blue OLED I2C Display Board', 'SSD1306 Driver, Low Power Draw', 'IoT Bay', 'GOOD', 'AVAILABLE', '2026-03-10', 40000, 'J-03', 0, 'tv', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(58, 3, 'Relay Module', 'SN-ECE-018', '4-Channel 5V Relay Switch Control Board', 'Optocoupler Isolation 10A 250VAC', 'Power Lab', 'GOOD', 'AVAILABLE', '2026-03-15', 40000, 'J-04', 0, 'zap', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(59, 3, 'Motor Driver Module', 'SN-ECE-019', 'L298N Dual H-Bridge DC Stepper Driver Board', 'Drive 2 DC Motors or 1 Stepper Motor', 'Robotics Bay', 'GOOD', 'AVAILABLE', '2026-03-20', 40000, 'J-05', 0, 'cpu', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(60, 3, 'PCB Development Board', 'SN-ECE-020', 'Double-Sided FR4 Copper Clad Laminate Sheets', '100x150mm Etching Boards Pack', 'PCB Room', 'GOOD', 'AVAILABLE', '2026-03-25', 40000, 'J-06', 0, 'grid', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),

-- Robotics / IoT / Embedded (IDs 61-80)
(61, 4, 'Ultrasonic Sensor', 'SN-ROB-001', 'HC-SR04 Ultrasonic Distance Measuring Sensor', '2cm - 400cm Range, 5V DC Operation', 'Robotics Lab', 'GOOD', 'AVAILABLE', '2025-06-01', 40000, 'K-01', 0, 'radar', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(62, 4, 'IR Sensor', 'SN-ROB-002', 'Obstacle Avoidance Infrared Sensor Module Set', '35 Degree Detection Angle, LM393 Comparator', 'Robotics Lab', 'GOOD', 'AVAILABLE', '2025-07-01', 40000, 'K-02', 0, 'eye', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(63, 4, 'PIR Motion Sensor', 'SN-ROB-003', 'HC-SR501 Pyroelectric Infrared Motion Sensor', '7m Distance, Adjustable Delay & Sensitivity', 'IoT Lab', 'GOOD', 'AVAILABLE', '2025-08-01', 40000, 'K-03', 0, 'eye', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(64, 4, 'Temperature Sensor', 'SN-ROB-004', 'DS18B20 Waterproof Digital Temp Sensor Probe', 'Stainless Steel Tube, 1-Wire Interface', 'Sensor Lab', 'GOOD', 'AVAILABLE', '2025-09-01', 40000, 'K-04', 0, 'thermometer', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(65, 4, 'Humidity Sensor', 'SN-ROB-005', 'DHT22 Digital Temperature & Humidity Sensor', 'High Precision 0-100% RH Range', 'Sensor Lab', 'GOOD', 'AVAILABLE', '2025-10-01', 40000, 'K-05', 0, 'cloud-drizzle', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(66, 4, 'Soil Moisture Sensor', 'SN-ROB-006', 'Capacitive Soil Moisture Corrosion Resistant Module', 'Analog Voltage Output 3.3V/5V', 'Agri-Tech Lab', 'GOOD', 'AVAILABLE', '2025-11-01', 40000, 'K-06', 0, 'droplet', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(67, 4, 'Gas Sensor', 'SN-ROB-007', 'MQ-2 Flammable Gas & Smoke Detector Module', 'Detects LPG, Smoke, Alcohol, Propane, Hydrogen', 'Safety Lab', 'GOOD', 'AVAILABLE', '2025-12-01', 40000, 'L-01', 0, 'wind', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(68, 4, 'Flame Sensor', 'SN-ROB-008', '5-Way IR Flame Sensor Module for Firefighting Bots', '760nm - 1100nm Wavelength Detection', 'Safety Lab', 'GOOD', 'AVAILABLE', '2026-01-01', 40000, 'L-02', 0, 'flame', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(69, 4, 'RFID Reader', 'SN-ROB-009', 'RC522 13.56MHz RFID Reader SPI Kit', 'Includes Key Fob & Contactless IC Card', 'Security Lab', 'GOOD', 'AVAILABLE', '2026-01-10', 40000, 'L-03', 0, 'radio', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(70, 4, 'RFID Cards', 'SN-ROB-010', '13.56MHz S50 Smart RFID Key Cards (25 Pack)', 'White PVC Printable Cards for Access Control', 'Security Lab', 'GOOD', 'AVAILABLE', '2026-01-20', 40000, 'L-04', 0, 'credit-card', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(71, 4, 'Fingerprint Sensor', 'SN-ROB-011', 'R307 Optical Fingerprint Scanner Sensor Board', 'UART TTL Serial Interface, 1000 Capacity', 'Security Lab', 'EXCELLENT', 'AVAILABLE', '2026-02-01', 40000, 'L-05', 0, 'finger-print', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(72, 4, 'Servo Motor', 'SN-ROB-012', 'MG996R Metal Gear High Torque Servo Motor', '11kg/cm Torque, 180 Degree Rotation', 'Mechatronics Bay', 'GOOD', 'AVAILABLE', '2026-02-10', 40000, 'L-06', 0, 'rotate-cw', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(73, 4, 'Stepper Motor', 'SN-ROB-013', 'NEMA 17 Stepper Motor with A4988 Driver Module', '1.8 Degree Step Angle, 40Ncm Holding Torque', 'Mechatronics Bay', 'GOOD', 'AVAILABLE', '2026-02-15', 40000, 'M-01', 0, 'rotate-cw', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(74, 4, 'DC Motor', 'SN-ROB-014', '12V High Torque Metal Geared DC Motor', '300 RPM Speed, Metal Gearbox Encoder', 'Mechatronics Bay', 'GOOD', 'AVAILABLE', '2026-02-20', 40000, 'M-02', 0, 'rotate-cw', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(75, 4, 'LiDAR Sensor', 'SN-ROB-015', 'RPLIDAR A1M8 360-Degree Laser Distance Scanner', '12 Meter Range, 8000 Samples/sec, ROS 2 SDK', 'Autonomous Lab', 'EXCELLENT', 'AVAILABLE', '2026-03-01', 40000, 'M-03', 1, 'radar', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(76, 4, 'GPS Module', 'SN-ROB-016', 'NEO-6M GPS Receiver with Active Antenna', 'UART Interface, EEPROM Configuration', 'Drone Lab', 'GOOD', 'AVAILABLE', '2026-03-05', 40000, 'M-04', 0, 'map-pin', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(77, 4, 'Bluetooth Module', 'SN-ROB-017', 'HC-05 Transceiver Master/Slave Wireless Board', 'Bluetooth 2.0+EDR, 9600 Baud TTL', 'Wireless Lab', 'GOOD', 'AVAILABLE', '2026-03-10', 40000, 'M-05', 0, 'bluetooth', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(78, 4, 'Wi-Fi Module', 'SN-ROB-018', 'ESP-01S ESP8266 Serial Wi-Fi Transceiver Board', '1MB Flash, PCB Antenna 802.11 b/g/n', 'Wireless Lab', 'GOOD', 'AVAILABLE', '2026-03-15', 40000, 'M-06', 0, 'wifi', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(79, 4, 'Camera Module', 'SN-ROB-019', 'Raspberry Pi Camera Module 3 Wide Angle 12MP', 'Sony IMX708, Autofocus, 120 Degree FOV', 'Vision Lab', 'EXCELLENT', 'AVAILABLE', '2026-03-20', 40000, 'N-01', 0, 'camera', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(80, 4, 'Robot Car Kit', 'SN-ROB-020', '4WD Smart Robot Car Chassis Assembly Starter Kit', 'Acrylic Chassis, Speed Encoders, Battery Box', 'Robotics Lab', 'GOOD', 'AVAILABLE', '2026-03-25', 40000, 'N-02', 0, 'bot', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),

-- Mechanical / Automobile (IDs 81-90)
(81, 5, 'Vernier Caliper', 'SN-MEC-001', 'Mitutoyo 150mm Stainless Steel Digital Caliper', '0.01mm Resolution, LCD Screen, Thumb Roller', 'Metrology Lab', 'EXCELLENT', 'AVAILABLE', '2025-06-01', 40000, 'N-03', 0, 'check-square', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(82, 5, 'Micrometer', 'SN-MEC-002', 'Mitutoyo 0-25mm Outside Precision Micrometer', '0.001mm Graduation, Ratchet Stop', 'Metrology Lab', 'EXCELLENT', 'AVAILABLE', '2025-07-01', 40000, 'N-04', 0, 'check-square', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(83, 5, 'Torque Wrench', 'SN-MEC-003', '1/2" Drive Click Mechanical Torque Wrench', '20-150 ft-lb Torque Range, Reversible Ratchet', 'Auto Workshop', 'GOOD', 'AVAILABLE', '2025-08-01', 40000, 'N-05', 0, 'wrench', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(84, 5, 'Digital Tachometer', 'SN-MEC-004', 'Non-Contact Laser Digital Photo Tachometer', '2.5 - 99,999 RPM, Laser Target Pointer', 'Auto Workshop', 'GOOD', 'AVAILABLE', '2025-09-01', 40000, 'N-06', 0, 'gauge', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(85, 5, 'Pressure Gauge', 'SN-MEC-005', 'Hydraulic Fluid Pressure Gauge Test Kit', '0-10,000 PSI Dual Scale Gauge with Hoses', 'Thermal Lab', 'GOOD', 'AVAILABLE', '2025-10-01', 40000, 'O-01', 0, 'gauge', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(86, 5, 'Engineering Drawing Kit', 'SN-MEC-006', 'Precision Drafting Compass & Divider Geometry Set', 'Includes Set Squares, T-Square & French Curves', 'CAD Lab', 'GOOD', 'AVAILABLE', '2025-11-01', 40000, 'O-02', 0, 'edit-2', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(87, 5, '3D Printer', 'SN-MEC-007', 'Creality Ender 3 V3 KE High Speed 3D Printer', '500mm/s Speed, Auto Bed Leveling, Direct Extruder', 'Fabrication Lab', 'EXCELLENT', 'AVAILABLE', '2025-12-01', 40000, 'O-03', 1, 'printer', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(88, 5, '3D Printing Filament', 'SN-MEC-008', '1.75mm PLA Filament Spool Multi-Pack', '1kg Spools (Red, Blue, Black, White, Green)', 'Fabrication Lab', 'GOOD', 'AVAILABLE', '2026-01-01', 40000, 'O-04', 0, 'layers', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(89, 5, 'CNC Machine Tool Kit', 'SN-MEC-009', 'CNC Router Solid Carbide End Mill Cutter Set', '2-Flute & 4-Flute Spiral Bits 3.175mm Shank', 'Machining Bay', 'GOOD', 'AVAILABLE', '2026-02-01', 40000, 'O-05', 0, 'tool', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(90, 5, 'Mechanical Tool Kit', 'SN-MEC-010', '168-Piece Heavy Duty Mechanic Tool Box Set', 'Sockets, Ratchets, Wrenches, Pliers in Heavy Case', 'Auto Workshop', 'GOOD', 'AVAILABLE', '2026-03-01', 40000, 'O-06', 0, 'wrench', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),

-- Civil / Architecture (IDs 91-100)
(91, 6, 'Total Station', 'SN-CIV-001', 'Leica FlexLine TS07 Electronic Total Station', '1" Angle Accuracy, PinPoint EDM 1000m', 'Surveying Bay', 'EXCELLENT', 'AVAILABLE', '2025-06-01', 40000, 'P-01', 1, 'compass', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(92, 6, 'Auto Level', 'SN-CIV-002', 'Bosch GOL 26 D Professional Optical Auto Level', '26x Magnification, 100m Working Range', 'Surveying Bay', 'EXCELLENT', 'AVAILABLE', '2025-07-01', 40000, 'P-02', 0, 'eye', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(93, 6, 'Measuring Tape', 'SN-CIV-003', '50-Meter Heavy Duty Fiberglass Open Frame Tape', 'Metric & Imperial Graduations, Folding Crank', 'Field Gear Room', 'GOOD', 'AVAILABLE', '2025-08-01', 40000, 'P-03', 0, 'ruler', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(94, 6, 'Laser Distance Meter', 'SN-CIV-004', 'Bosch GLM 50 C Bluetooth Laser Measurer', '50m Range, Inclinometer Sensor, Color Screen', 'Field Gear Room', 'EXCELLENT', 'AVAILABLE', '2025-09-01', 40000, 'P-04', 0, 'zap', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(95, 6, 'Surveying Tripod', 'SN-CIV-005', 'Heavy Duty Aluminum Dome Head Survey Tripod', '5/8"-11 Thread, Quick Clamp Legs', 'Surveying Bay', 'GOOD', 'AVAILABLE', '2025-10-01', 40000, 'P-05', 0, 'disc', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(96, 6, 'Drawing Board', 'SN-CIV-006', 'A1 Adjustable Drafting Drawing Board Stand', 'Parallel Motion Straightedge, Acrylic Board', 'Arch Studio', 'GOOD', 'AVAILABLE', '2025-11-01', 40000, 'P-06', 0, 'layout', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(97, 6, 'Scale Ruler Set', 'SN-CIV-007', 'Architect Triangular Metric Aluminum Scale Set', 'Scales 1:20, 1:50, 1:100, 1:200, 1:500', 'Arch Studio', 'GOOD', 'AVAILABLE', '2025-12-01', 40000, 'Q-01', 0, 'ruler', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(98, 6, 'Model Making Kit', 'SN-CIV-008', 'Architectural Physical Scale Model Maker Kit', 'Precision Cutters, Balsa Wood, Acrylic Sheets', 'Arch Studio', 'GOOD', 'AVAILABLE', '2026-01-01', 40000, 'Q-02', 0, 'scissors', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(99, 6, 'Building Material Testing Kit', 'SN-CIV-009', 'Concrete Rebound Schmidt Test Hammer Kit', 'Concrete Compressive Strength Tester 10-70 MPa', 'Structures Lab', 'EXCELLENT', 'AVAILABLE', '2026-02-01', 40000, 'Q-03', 1, 'hammer', '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(100, 6, 'Laser Level', 'SN-CIV-010', '360-Degree Self-Leveling Cross Line Laser', 'Green Beam 12 Lines 3D Leveling Tool', 'Structural Lab', 'EXCELLENT', 'AVAILABLE', '2026-03-01', 40000, 'Q-04', 0, 'crosshair', '2026-08-01 09:00:00', '2026-08-01 09:00:00');

-- 5. Seed Borrow Requests & Active Loans (10 Active Loans for 10 Students worth ₹40,000 each)
INSERT INTO borrow_requests (id, student_id, equipment_id, borrow_date, expected_return_date, purpose, status, approved_by, qr_code_token, pickup_locker, created_at, updated_at) VALUES
('REQ-30501', 'STU-3050371', 8, '2026-08-10 09:00', '2026-09-08 17:00', 'Final Year Capstone Project Shoot', 'APPROVED', 'ADM-00001', 'QR-REQ-30501-STU-3050371', 'B-02', '2026-08-10 09:00:00', '2026-08-10 09:00:00'),
('REQ-10034', 'STU-10055', 11, '2026-08-10 09:30', '2026-09-08 17:00', 'CSE Campus Event Photography', 'APPROVED', 'ADM-00001', 'QR-REQ-10034-STU-10055', 'B-05', '2026-08-10 09:30:00', '2026-08-10 09:30:00'),
('REQ-10492', 'STU-88210', 7, '2026-08-10 10:00', '2026-09-09 17:00', 'ECE Short Film Production', 'APPROVED', 'ADM-00001', 'QR-REQ-10492-STU-88210', 'B-01', '2026-08-10 10:00:00', '2026-08-10 10:00:00'),
('REQ-99012', 'STU-10114', 12, '2026-08-11 11:00', '2026-09-10 17:00', 'Robotics Field Test Recording', 'APPROVED', 'ADM-00001', 'QR-REQ-99012-STU-10114', 'B-06', '2026-08-11 11:00:00', '2026-08-11 11:00:00'),
('REQ-10055', 'STU-10055', 13, '2026-08-11 14:00', '2026-09-10 17:00', 'AI & DS Lab Video Documentation', 'APPROVED', 'ADM-00001', 'QR-REQ-10055-STU-10055', 'C-01', '2026-08-11 14:00:00', '2026-08-11 14:00:00'),
('REQ-10078', 'STU-10078', 14, '2026-08-12 09:00', '2026-09-11 17:00', 'IT Lab Presentation Recording', 'APPROVED', 'ADM-00001', 'QR-REQ-10078-STU-10078', 'C-02', '2026-08-12 09:00:00', '2026-08-12 09:00:00'),
('REQ-10092', 'STU-10092', 15, '2026-08-12 10:30', '2026-09-11 17:00', 'Cybersecurity Seminar Coverage', 'APPROVED', 'ADM-00001', 'QR-REQ-10092-STU-10092', 'C-03', '2026-08-12 10:30:00', '2026-08-12 10:30:00'),
('REQ-10114', 'STU-10114', 16, '2026-08-12 15:00', '2026-09-11 17:00', 'Mechanical CAD Model Video', 'APPROVED', 'ADM-00001', 'QR-REQ-10114-STU-10114', 'C-04', '2026-08-12 15:00:00', '2026-08-12 15:00:00'),
('REQ-10135', 'STU-10135', 17, '2026-08-13 10:00', '2026-09-12 17:00', 'EEE High Voltage Lab Demo', 'APPROVED', 'ADM-00001', 'QR-REQ-10135-STU-10135', 'C-05', '2026-08-13 10:00:00', '2026-08-13 10:00:00'),
('REQ-10156', 'STU-10156', 18, '2026-08-13 11:30', '2026-09-12 17:00', 'Aerospace Wind Tunnel Testing', 'APPROVED', 'ADM-00001', 'QR-REQ-10156-STU-10156', 'C-06', '2026-08-13 11:30:00', '2026-08-13 11:30:00');

INSERT INTO loans (loan_id, request_id, student_id, equipment_id, issued_at, due_at, status, issued_by) VALUES
('LOAN-30501', 'REQ-30501', 'STU-3050371', 8, '2026-08-10 09:15:00', '2026-09-08 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-10034', 'REQ-10034', 'STU-10055', 11, '2026-08-10 09:45:00', '2026-09-08 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-9901', 'REQ-10492', 'STU-88210', 7, '2026-08-10 10:15:00', '2026-09-09 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-99012', 'REQ-99012', 'STU-10114', 12, '2026-08-11 11:15:00', '2026-09-10 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-10055', 'REQ-10055', 'STU-10055', 13, '2026-08-11 14:15:00', '2026-09-10 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-10078', 'REQ-10078', 'STU-10078', 14, '2026-08-12 09:15:00', '2026-09-11 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-10092', 'REQ-10092', 'STU-10092', 15, '2026-08-12 10:45:00', '2026-09-11 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-10114', 'REQ-10114', 'STU-10114', 16, '2026-08-12 15:15:00', '2026-09-11 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-10135', 'REQ-10135', 'STU-10135', 17, '2026-08-13 10:15:00', '2026-09-12 17:00:00', 'ACTIVE', 'ADM-00001'),
('LOAN-10156', 'REQ-10156', 'STU-10156', 18, '2026-08-13 11:45:00', '2026-09-12 17:00:00', 'ACTIVE', 'ADM-00001');

-- 6. Seed Maintenance Item
INSERT INTO maintenance (equipment_id, issue, reported_at, reported_by, status, resolution) VALUES
(9, 'Motor slider track belt slipping & sensor calibration needed', '2026-08-05 11:20:00', 'ADM-00001', 'IN_PROGRESS', 'Replacement motor belt ordered');

-- 7. Seed Audit Log Entry
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp, details) VALUES
('SYSTEM', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'SYS-01', '2026-08-01 09:00:00', 'SmartCampus EquipBorrow database initialized with 6 categories, 18 user roles, and 100 equipment units.');
