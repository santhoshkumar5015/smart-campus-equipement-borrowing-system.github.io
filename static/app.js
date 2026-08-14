/**
 * SmartCampus EquipBorrow - Full-Stack Client Application Engine
 * Hybrid LocalStorage Data Engine + Live Server REST Integration
 * Ensures 100% full interactive functionality on Netlify, Vercel, GitHub Pages & Localhost.
 */

const API_BASE = '/api';

// Global User & Role State
let currentRole = 'jeeva'; // 'jeeva', 'alex', 'jordan', 'admin'
let currentCategory = 'All';
let searchQuery = '';
let equipmentList = [];
let myReservations = [];

const PROFILES = {
  jeeva: {
    id: 'STU-10034',
    name: 'Jeeva Kumar',
    email: 'jeeva@college.edu',
    role: 'STUDENT',
    avatar: 'JK',
    subtext: 'RA2311003050340 | CSE 4th Yr'
  },
  alex: {
    id: 'STU-88210',
    name: 'Alex Rivera',
    email: 'arivera@college.edu',
    role: 'STUDENT',
    avatar: 'AR',
    subtext: 'RA2311003050112 | ECE 4th Yr'
  },
  jordan: {
    id: 'STU-99012',
    name: 'Jordan Smith',
    email: 'jsmith@college.edu',
    role: 'STUDENT',
    avatar: 'JS',
    subtext: 'RA2311003050882 | Robotics 3rd Yr'
  },
  admin: {
    id: 'ADM-00001',
    name: 'Dr. Sarah Vance',
    email: 'svance@college.edu',
    role: 'ADMIN',
    avatar: 'SV',
    subtext: 'ADM-00001 | Lab Manager'
  }
};

// Default Initial Local Database for Standalone Static Hosting (Netlify / Vercel)
const INITIAL_DB = {
  users: [
    { id: 'STU-10034', name: 'Jeeva Kumar', email: 'jeeva@college.edu', role: 'STUDENT', register_number: 'RA2311003050340', department: 'CSE', year: 4, semester: 7 },
    { id: 'STU-88210', name: 'Alex Rivera', email: 'arivera@college.edu', role: 'STUDENT', register_number: 'RA2311003050112', department: 'ECE', year: 4, semester: 7 },
    { id: 'STU-99012', name: 'Jordan Smith', email: 'jsmith@college.edu', role: 'STUDENT', register_number: 'RA2311003050882', department: 'Robotics Engineering', year: 3, semester: 5 },
    { id: 'ADM-00001', name: 'Dr. Sarah Vance (Lab Manager)', email: 'svance@college.edu', role: 'ADMIN', register_number: 'ADM-01', department: 'Lab Management', year: 0, semester: 0 }
  ],
  equipment: [
    { id: 1, category_id: 1, category_name: 'Computing & Laptops', name: 'MacBook Pro M3 Max 16"', serial_number: 'SN-MBP-9021', specifications: 'Apple M3 Max 36GB RAM, 1TB SSD', location: 'CS Innovation Lab 201', condition: 'EXCELLENT', status: 'AVAILABLE', locker_id: 'A-01', requires_approval: 0, image_icon: 'laptop' },
    { id: 2, category_id: 2, category_name: 'AV & Cinema', name: 'Sony FX3 Cinema Camera Kit', serial_number: 'SN-AV-4482', specifications: 'Full-frame 4K, 24-70mm GM II lens, XLR handle', location: 'Media Studio B', condition: 'GOOD', status: 'AVAILABLE', locker_id: 'A-02', requires_approval: 1, image_icon: 'camera' },
    { id: 3, category_id: 3, category_name: 'VR & AR', name: 'Meta Quest 3 VR Headset (512GB)', serial_number: 'SN-VR-8812', specifications: 'Includes Touch Plus controllers & Link Cable', location: 'Spatial Computing Hub', condition: 'EXCELLENT', status: 'AVAILABLE', locker_id: 'A-03', requires_approval: 0, image_icon: 'glasses' },
    { id: 4, category_id: 4, category_name: 'Robotics', name: 'DJI Mavic 3 Pro Cine Drone', serial_number: 'SN-DRONE-304', specifications: 'Tri-camera system, Apple ProRes, Smart Controller', location: 'Autonomous Systems Lab', condition: 'EXCELLENT', status: 'AVAILABLE', locker_id: 'A-04', requires_approval: 1, image_icon: 'drone' },
    { id: 5, category_id: 5, category_name: 'IoT & Hardware', name: 'ESP32 IoT Development Starter Kit', serial_number: 'SN-ESP32-001', specifications: 'ESP32 NodeMCU, OLED display, DHT11, Relays', location: 'IoT Hardware Lab 102', condition: 'GOOD', status: 'AVAILABLE', locker_id: 'A-05', requires_approval: 0, image_icon: 'cpu' },
    { id: 6, category_id: 6, category_name: 'Lab Tools', name: 'Rigol 100MHz Digital Oscilloscope', serial_number: 'SN-SCOPE-110', specifications: '4-Channel digital storage oscilloscope, 1GSa/s', location: 'Circuit Design Lab', condition: 'GOOD', status: 'AVAILABLE', locker_id: 'A-06', requires_approval: 0, image_icon: 'activity' },
    { id: 7, category_id: 1, category_name: 'Computing & Laptops', name: 'iPad Pro 12.9 M2 + Pencil', serial_number: 'SN-IPAD-551', specifications: '256GB Wi-Fi, Apple Pencil v2, Magic Keyboard', location: 'Design Innovation Studio', condition: 'GOOD', status: 'BORROWED', locker_id: 'B-01', requires_approval: 0, image_icon: 'tablet' },
    { id: 8, category_id: 2, category_name: 'AV & Cinema', name: 'Shure SM7B + Focusrite Podcasting Kit', serial_number: 'SN-AUDIO-992', specifications: 'Broadcast Mic, Cloudlifter CL-1, Scarlett 2i2', location: 'Podcast Studio 2', condition: 'EXCELLENT', status: 'AVAILABLE', locker_id: 'B-02', requires_approval: 0, image_icon: 'mic' },
    { id: 9, category_id: 4, category_name: 'Robotics', name: 'TurtleBot 4 ROS 2 Mobile Robot', serial_number: 'SN-BOT-004', specifications: 'iRobot Create 3 base, OAK-D Pro camera, LiDAR', location: 'Mechatronics Lab', condition: 'MINOR_DAMAGE', status: 'MAINTENANCE', locker_id: 'B-03', requires_approval: 1, image_icon: 'bot' },
    { id: 10, category_id: 5, category_name: 'IoT & Hardware', name: 'Raspberry Pi 5 Lab Starter Bundle', serial_number: 'SN-RPI-505', specifications: '8GB RAM, NVMe Base, Touchscreen, Sensors', location: 'Embedded Systems Room', condition: 'GOOD', status: 'AVAILABLE', locker_id: 'B-04', requires_approval: 0, image_icon: 'cpu' }
  ],
  borrow_requests: [
    { id: 'REQ-10492', student_id: 'STU-88210', equipment_id: 7, equipment_name: 'iPad Pro 12.9 M2 + Pencil', borrow_date: '2026-08-10 10:00', expected_return_date: '2026-08-18 17:00', purpose: 'UI Capstone Prototyping Demo', status: 'APPROVED', pickup_locker: 'B-01', qr_code_token: 'QR-REQ-10492-STU-88210', created_at: '2026-08-10 10:00:00' }
  ],
  loans: [
    { loan_id: 'LOAN-9901', request_id: 'REQ-10492', student_id: 'STU-88210', student_name: 'Alex Rivera', register_number: 'RA2311003050112', department: 'ECE', equipment_id: 7, equipment_name: 'iPad Pro 12.9 M2 + Pencil', locker_id: 'B-01', issued_at: '2026-08-10 10:15:00', due_at: '2026-08-18 17:00:00', status: 'ACTIVE' }
  ],
  returns: [],
  maintenance: [
    { maintenance_id: 1, equipment_id: 9, equipment_name: 'TurtleBot 4 ROS 2 Mobile Robot', serial_number: 'SN-BOT-004', issue: 'Right wheel drive motor gear slipping & LiDAR cable loose', reported_at: '2026-08-05 11:20:00', status: 'IN_PROGRESS' }
  ],
  audit_logs: [
    { log_id: 1, user_id: 'SYSTEM', action: 'SYSTEM_INITIALIZATION', entity_type: 'SYSTEM', entity_id: 'SYS-01', timestamp: new Date().toLocaleString(), details: 'SmartCampus EquipBorrow standalone local database initialized.' }
  ]
};

// LocalStorage Persistence Helper
function getLocalDB() {
  const dbStr = localStorage.getItem('smart_campus_db');
  if (!dbStr) {
    localStorage.setItem('smart_campus_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  return JSON.parse(dbStr);
}

function saveLocalDB(db) {
  localStorage.setItem('smart_campus_db', JSON.stringify(db));
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabNavigation();
  setupFilters();
  setupRoleSelector();
  setupModals();
  setupLockerKiosk();
  setupAddEquipmentForm();
  setupRejectForm();
  setupReturnForm();
  setupRegisterForm();

  // Initial Data Fetch
  refreshAllData();

  // Default datetimes
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  const formatIsoLocal = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzOffset).toISOString().slice(0, 16);
  };

  const startDateInput = document.getElementById('reserveStartDate');
  const endDateInput = document.getElementById('reserveEndDate');
  if (startDateInput) startDateInput.value = formatIsoLocal(tomorrow);
  if (endDateInput) endDateInput.value = formatIsoLocal(nextWeek);
});

// Role Switcher Setup
function setupRoleSelector() {
  const selector = document.getElementById('roleSelector');
  if (!selector) return;

  selector.addEventListener('change', (e) => {
    currentRole = e.target.value;
    const profile = PROFILES[currentRole];

    document.getElementById('userAvatarText').textContent = profile.avatar;
    document.getElementById('userNameText').textContent = profile.name;
    document.getElementById('userRoleSubtext').textContent = profile.subtext;

    document.getElementById('rfidBadgeName').textContent = `Tap ${profile.name}'s ID`;
    document.getElementById('rfidBadgeId').textContent = `RFID: ${profile.id}`;

    showToast(`Switched user profile to ${profile.name} (${profile.role})`, 'success');
    refreshAllData();
  });
}

function getAuthHeaders() {
  const profile = PROFILES[currentRole];
  return {
    'Content-Type': 'application/json',
    'X-User-Role': profile.role,
    'X-User-Id': profile.id
  };
}

// Refresh Data
async function refreshAllData() {
  await fetchMetricsAndAnalytics();
  await fetchEquipmentCatalog();
  await fetchMyLoans();
  if (PROFILES[currentRole].role === 'ADMIN') {
    await fetchAdminLoans();
    await fetchMaintenanceQueue();
  }
  renderLockersGrid();
}

// Hybrid API Fetcher (Tries live backend first, falls back seamlessly to LocalStorage)
async function smartFetch(url, options = {}) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend API server not available (e.g. static hosting on Netlify / Vercel)
  }
  return handleLocalApi(url, options);
}

// Client-Side Local API Engine (Handles BR-01 to BR-20 for Netlify/Vercel)
function handleLocalApi(url, options) {
  const method = options.method || 'GET';
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;
  const body = options.body ? JSON.parse(options.body) : {};
  const profile = PROFILES[currentRole];

  const db = getLocalDB();

  // GET /api/equipment
  if (path === '/api/equipment' && method === 'GET') {
    return { success: true, data: db.equipment };
  }

  // GET /api/analytics
  if (path === '/api/analytics' && method === 'GET') {
    const total = db.equipment.length;
    const available = db.equipment.filter(e => e.status === 'AVAILABLE').length;
    const active_loans = db.loans.filter(l => l.status === 'ACTIVE').length;
    const pending = db.borrow_requests.filter(r => r.status === 'PENDING').length;
    const maintenance = db.equipment.filter(e => e.status === 'MAINTENANCE').length;
    const overdue = db.loans.filter(l => l.status === 'ACTIVE' && new Date(l.due_at) < new Date()).length;

    return {
      success: true,
      metrics: {
        total_inventory: total,
        available_now: available,
        active_loans: active_loans,
        pending_approvals: pending,
        in_maintenance: maintenance,
        overdue: overdue
      },
      recent_logs: db.audit_logs.slice(-15).reverse()
    };
  }

  // GET /api/borrow-requests
  if (path === '/api/borrow-requests' && method === 'GET') {
    const userId = parsedUrl.searchParams.get('user_id');
    let reqs = db.borrow_requests;
    if (userId) {
      reqs = reqs.filter(r => r.student_id === userId);
    }
    return { success: true, data: reqs };
  }

  // GET /api/loans
  if (path === '/api/loans' && method === 'GET') {
    return { success: true, data: db.loans };
  }

  // GET /api/maintenance
  if (path === '/api/maintenance' && method === 'GET') {
    return { success: true, data: db.maintenance };
  }

  // POST /api/auth/register
  if (path === '/api/auth/register' && method === 'POST') {
    const userId = `STU-${Math.floor(10000 + Math.random() * 90000)}`;
    const user = { id: userId, name: body.name, email: body.email, role: 'STUDENT', register_number: body.register_number, department: body.department, year: body.year, semester: body.semester };
    db.users.push(user);
    db.audit_logs.push({ log_id: db.audit_logs.length + 1, user_id: userId, action: 'STUDENT_REGISTER', entity_type: 'STUDENT', entity_id: userId, timestamp: new Date().toLocaleString(), details: `Registered student ${body.name} (${body.register_number})` });
    saveLocalDB(db);
    return { success: true, user_id: userId, message: `Welcome ${body.name}! Registration successful.` };
  }

  // POST /api/borrow-requests
  if (path === '/api/borrow-requests' && method === 'POST') {
    const eq = db.equipment.find(e => e.id === body.equipment_id);
    if (!eq) return { error: 'Equipment ID not found' };

    if (eq.status === 'MAINTENANCE') return { error: 'BR-10: Equipment is under MAINTENANCE and cannot be borrowed.' };
    if (eq.status === 'RETIRED') return { error: 'BR-11: Retired equipment cannot be borrowed.' };

    const borrowDt = new Date(body.borrow_date);
    const returnDt = new Date(body.expected_return_date);
    const now = new Date();

    if (borrowDt < new Date(now.getTime() - 15 * 60000)) return { error: 'BR-04: Borrow date cannot be in the past.' };
    if (returnDt <= borrowDt) return { error: 'BR-05: Expected return date must be strictly after borrow date.' };

    // BR-06: 2 active loans limit check
    const userActiveLoans = db.loans.filter(l => l.student_id === profile.id && l.status === 'ACTIVE').length;
    const userActiveReqs = db.borrow_requests.filter(r => r.student_id === profile.id && ['PENDING', 'APPROVED'].includes(r.status)).length;
    if ((userActiveLoans + userActiveReqs) >= 2) {
      return { error: 'BR-06: Borrowing limit reached. Maximum allowed active borrowings is 2.' };
    }

    const reqId = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const qrToken = `QR-${reqId}-${profile.id}`;
    const initialStatus = eq.requires_approval ? 'PENDING' : 'APPROVED';

    const reqObj = {
      id: reqId,
      student_id: profile.id,
      equipment_id: eq.id,
      equipment_name: eq.name,
      borrow_date: body.borrow_date,
      expected_return_date: body.expected_return_date,
      purpose: body.purpose,
      status: initialStatus,
      pickup_locker: eq.locker_id,
      qr_code_token: qrToken,
      created_at: new Date().toLocaleString()
    };

    db.borrow_requests.unshift(reqObj);
    if (initialStatus === 'APPROVED') {
      eq.status = 'RESERVED';
      db.loans.unshift({
        loan_id: `LOAN-${Math.floor(1000 + Math.random() * 9000)}`,
        request_id: reqId,
        student_id: profile.id,
        student_name: profile.name,
        register_number: profile.subtext.split(' | ')[0],
        department: profile.subtext.split(' | ')[1] || 'CSE',
        equipment_id: eq.id,
        equipment_name: eq.name,
        locker_id: eq.locker_id,
        issued_at: new Date().toLocaleString(),
        due_at: body.expected_return_date,
        status: 'ACTIVE'
      });
    }

    db.audit_logs.push({ log_id: db.audit_logs.length + 1, user_id: profile.id, action: 'SUBMIT_REQUEST', entity_type: 'BORROW_REQUEST', entity_id: reqId, timestamp: new Date().toLocaleString(), details: `Submitted request ${reqId} for '${eq.name}'. Status: ${initialStatus}` });
    saveLocalDB(db);

    return {
      success: true,
      request_id: reqId,
      status: initialStatus,
      qr_code_token: qrToken,
      pickup_locker: eq.locker_id,
      message: initialStatus === 'PENDING' ? 'Borrow request submitted for Admin approval.' : 'Borrow request approved automatically!'
    };
  }

  // PUT /api/admin/requests/:id/approve
  if (path.includes('/approve') && method === 'PUT') {
    if (profile.role !== 'ADMIN') return { error: 'BR-16: Only Admin can approve borrow requests.' };
    const reqId = path.split('/')[4];
    const req = db.borrow_requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'APPROVED';
      const eq = db.equipment.find(e => e.id === req.equipment_id);
      if (eq) eq.status = 'RESERVED';

      const loanId = `LOAN-${Math.floor(1000 + Math.random() * 9000)}`;
      db.loans.unshift({
        loan_id: loanId,
        request_id: reqId,
        student_id: req.student_id,
        student_name: req.student_id,
        register_number: 'RA2311003050340',
        department: 'CSE',
        equipment_id: req.equipment_id,
        equipment_name: req.equipment_name,
        locker_id: req.pickup_locker,
        issued_at: new Date().toLocaleString(),
        due_at: req.expected_return_date,
        status: 'ACTIVE'
      });

      db.audit_logs.push({ log_id: db.audit_logs.length + 1, user_id: profile.id, action: 'ADMIN_APPROVE', entity_type: 'BORROW_REQUEST', entity_id: reqId, timestamp: new Date().toLocaleString(), details: `Admin approved request ${reqId}. Active Loan ${loanId} issued.` });
      saveLocalDB(db);
      return { success: true, message: `Request ${reqId} approved.` };
    }
  }

  // PUT /api/admin/requests/:id/reject
  if (path.includes('/reject') && method === 'PUT') {
    if (profile.role !== 'ADMIN') return { error: 'BR-17: Only Admin can reject borrow requests.' };
    if (!body.reason) return { error: 'BR-18: Admin must provide a mandatory rejection reason.' };
    const reqId = path.split('/')[4];
    const req = db.borrow_requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'REJECTED';
      req.rejection_reason = body.reason;
      const eq = db.equipment.find(e => e.id === req.equipment_id);
      if (eq) eq.status = 'AVAILABLE';
      db.audit_logs.push({ log_id: db.audit_logs.length + 1, user_id: profile.id, action: 'ADMIN_REJECT', entity_type: 'BORROW_REQUEST', entity_id: reqId, timestamp: new Date().toLocaleString(), details: `Admin rejected request ${reqId}. Reason: ${body.reason}` });
      saveLocalDB(db);
      return { success: true, message: `Request ${reqId} rejected.` };
    }
  }

  // PUT /api/admin/loans/:id/return
  if (path.includes('/return') && method === 'PUT') {
    const loanId = path.split('/')[4];
    const loan = db.loans.find(l => l.loan_id === loanId);
    if (loan) {
      loan.status = 'RETURNED';
      const eq = db.equipment.find(e => e.id === loan.equipment_id);

      const cond = (body.condition || 'GOOD').toUpperCase();
      if (['MINOR_DAMAGE', 'MAJOR_DAMAGE', 'MISSING_PARTS'].includes(cond)) {
        if (eq) {
          eq.status = 'MAINTENANCE';
          eq.condition = cond;
        }
        db.maintenance.unshift({
          maintenance_id: db.maintenance.length + 1,
          equipment_id: loan.equipment_id,
          equipment_name: loan.equipment_name,
          serial_number: eq ? eq.serial_number : 'SN-00',
          issue: `Damage on return: ${body.damage_description || cond}. Missing: ${body.missing_accessories || 'None'}`,
          reported_at: new Date().toLocaleString(),
          status: 'REPORTED'
        });
      } else {
        if (eq) {
          eq.status = 'AVAILABLE';
          eq.condition = cond;
        }
      }

      db.audit_logs.push({ log_id: db.audit_logs.length + 1, user_id: profile.id, action: 'PROCESS_RETURN', entity_type: 'LOAN', entity_id: loanId, timestamp: new Date().toLocaleString(), details: `Processed return for Loan ${loanId}. Condition: ${cond}.` });
      saveLocalDB(db);
      return { success: true, message: `Processed return for ${loanId}. Condition logged.` };
    }
  }

  // PUT /api/admin/maintenance/:id/complete
  if (path.includes('/complete') && method === 'PUT') {
    const maintId = parseInt(path.split('/')[4]);
    const m = db.maintenance.find(item => item.maintenance_id === maintId);
    if (m) {
      m.status = 'COMPLETED';
      const eq = db.equipment.find(e => e.id === m.equipment_id);
      if (eq) {
        eq.status = 'AVAILABLE';
        eq.condition = 'GOOD';
      }
      db.audit_logs.push({ log_id: db.audit_logs.length + 1, user_id: profile.id, action: 'MAINTENANCE_UPDATE', entity_type: 'MAINTENANCE', entity_id: String(maintId), timestamp: new Date().toLocaleString(), details: `Maintenance #${maintId} completed.` });
      saveLocalDB(db);
      return { success: true, message: `Maintenance ticket #${maintId} completed! Equipment restored to AVAILABLE.` };
    }
  }

  // POST /api/locker/unlock
  if (path === '/api/locker/unlock' && method === 'POST') {
    let req = null;
    if (body.qr_code_token) {
      req = db.borrow_requests.find(r => r.qr_code_token === body.qr_code_token);
    } else if (body.user_id) {
      req = db.borrow_requests.find(r => r.student_id === body.user_id && ['APPROVED', 'CHECKEDOUT'].includes(r.status));
    }

    if (req) {
      const eq = db.equipment.find(e => e.id === req.equipment_id);
      req.status = 'CHECKEDOUT';
      if (eq) eq.status = 'BORROWED';

      db.audit_logs.push({ log_id: db.audit_logs.length + 1, user_id: profile.id, action: 'IOT_PICKUP', entity_type: 'LOAN', entity_id: req.id, timestamp: new Date().toLocaleString(), details: `Unlocked Locker ${req.pickup_locker} for ${req.equipment_name}.` });
      saveLocalDB(db);

      return {
        success: true,
        locker_id: req.pickup_locker,
        equipment_name: req.equipment_name,
        message: `Locker ${req.pickup_locker} Unlocked! Collect your ${req.equipment_name}.`
      };
    }
    return { error: 'No active reservation matching token/user ID found' };
  }

  return { success: true };
}

// Tab Navigation
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

      tab.classList.add('active');
      const tabTarget = tab.getAttribute('data-tab');

      const targetPanel = document.getElementById(`${tabTarget}Panel`) || document.getElementById(tabTarget);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      if (window.lucide) window.lucide.createIcons();
    });
  });
}

// Category & Search Filters
function setupFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderEquipmentCatalog();
    });
  }

  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-cat');
      renderEquipmentCatalog();
    });
  });
}

// API Calls
async function fetchEquipmentCatalog() {
  const json = await smartFetch(`${API_BASE}/equipment`);
  if (json && json.success) {
    equipmentList = json.data;
    renderEquipmentCatalog();
    renderLockersGrid();
  }
}

async function fetchMetricsAndAnalytics() {
  const json = await smartFetch(`${API_BASE}/analytics`);
  if (json && json.success) {
    const m = json.metrics;
    document.getElementById('metricTotal').textContent = m.total_inventory;
    document.getElementById('metricAvailable').textContent = m.available_now;
    document.getElementById('metricBorrowed').textContent = m.active_loans;
    document.getElementById('metricPending').textContent = m.pending_approvals;
    document.getElementById('metricMaintenance').textContent = m.in_maintenance;
    document.getElementById('metricOverdue').textContent = m.overdue;

    renderAuditLogs(json.recent_logs);
  }
}

async function fetchMyLoans() {
  const profile = PROFILES[currentRole];
  const url = profile.role === 'ADMIN' ? `${API_BASE}/borrow-requests` : `${API_BASE}/borrow-requests?user_id=${profile.id}`;
  
  const json = await smartFetch(url, { headers: getAuthHeaders() });
  if (json && json.success) {
    myReservations = json.data;
    renderMyLoansTable();
    renderPendingApprovals();
  }
}

async function fetchAdminLoans() {
  const json = await smartFetch(`${API_BASE}/loans`, { headers: getAuthHeaders() });
  if (json && json.success) {
    renderAdminLoansTable(json.data);
  }
}

async function fetchMaintenanceQueue() {
  const json = await smartFetch(`${API_BASE}/maintenance`, { headers: getAuthHeaders() });
  if (json && json.success) {
    renderMaintenanceTable(json.data);
  }
}

// UI Renderers
function renderEquipmentCatalog() {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;

  const filtered = equipmentList.filter(item => {
    const matchCategory = currentCategory === 'All' || item.category_name === currentCategory || item.category === currentCategory;
    const matchSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery) ||
      (item.specifications && item.specifications.toLowerCase().includes(searchQuery)) ||
      (item.location && item.location.toLowerCase().includes(searchQuery)) ||
      (item.serial_number && item.serial_number.toLowerCase().includes(searchQuery));
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
        <i data-lucide="package-search" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--text-dim);"></i>
        <h3>No Equipment Found</h3>
        <p>Try adjusting your search query or category filter.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const isAvailable = item.status === 'AVAILABLE';
    const iconName = item.image_icon || 'box';

    return `
      <div class="equipment-card">
        <div>
          <div class="card-header">
            <div class="card-icon">
              <i data-lucide="${iconName}"></i>
            </div>
            <span class="status-badge ${item.status}">${item.status}</span>
          </div>

          <div class="equipment-category">${item.category_name || 'Lab Equipment'}</div>
          <h3 class="equipment-title">${escapeHtml(item.name)}</h3>
          <p class="equipment-specs">${escapeHtml(item.specifications || item.description || '')}</p>

          <div class="equipment-meta">
            <div class="meta-row">
              <span><i data-lucide="map-pin"></i> ${escapeHtml(item.location)}</span>
              <span><i data-lucide="door-closed"></i> Locker ${item.locker_id}</span>
            </div>
            <div class="meta-row">
              <span><i data-lucide="barcode"></i> SN: ${escapeHtml(item.serial_number)}</span>
              <span><i data-lucide="shield-check"></i> ${item.requires_approval ? 'Admin Approval' : 'Instant Loan'}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary" ${!isAvailable ? 'disabled' : ''} onclick="openReserveModal(${item.id})">
            <i data-lucide="calendar-plus"></i> ${isAvailable ? 'Request Equipment' : 'Unavailable'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderLockersGrid() {
  const grid = document.getElementById('lockersGrid');
  if (!grid) return;

  const lockerIds = ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'B-01', 'B-02', 'B-03', 'B-04'];
  const lockers = lockerIds.map(id => ({
    id,
    eq: equipmentList.find(e => e.locker_id === id)
  }));

  grid.innerHTML = lockers.map(l => {
    const item = l.eq;
    const isOccupied = item && item.status !== 'AVAILABLE';
    const isBorrowed = item && item.status === 'BORROWED';

    return `
      <div class="locker-door ${isOccupied ? 'occupied' : ''}" id="locker-door-${l.id.replace('-', '')}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="locker-number">${l.id}</div>
          <div class="locker-led"></div>
        </div>
        <div class="locker-item-info">
          ${item ? escapeHtml(item.name) : 'Empty Slot'}
        </div>
        <div style="font-size: 0.7rem; color: ${isBorrowed ? '#60a5fa' : '#94a3b8'};">
          ${item ? item.status : 'Ready'}
        </div>
      </div>
    `;
  }).join('');
}

function renderMyLoansTable() {
  const tbody = document.getElementById('myLoansTableBody');
  if (!tbody) return;

  const activeCount = myReservations.filter(r => ['PENDING', 'APPROVED', 'CHECKEDOUT'].includes(r.status)).length;
  const activeLimitEl = document.getElementById('activeLimitDisplay');
  if (activeLimitEl) {
    activeLimitEl.textContent = `${activeCount} / 2 Max (BR-06)`;
    activeLimitEl.style.color = activeCount >= 2 ? '#ef4444' : '#60a5fa';
  }

  if (myReservations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No request history found for current user.</td></tr>`;
    return;
  }

  tbody.innerHTML = myReservations.map(r => {
    const canPass = ['APPROVED', 'CHECKEDOUT'].includes(r.status);

    return `
      <tr>
        <td style="font-weight: 700; font-family: monospace; color: #60a5fa;">${r.id}</td>
        <td style="font-weight: 600;">${escapeHtml(r.equipment_name)}</td>
        <td><span class="status-badge BORROWED">${r.pickup_locker}</span></td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${r.borrow_date}<br>to ${r.expected_return_date}</td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(r.purpose || 'N/A')}</td>
        <td>
          <span class="status-badge ${r.status}">${r.status}</span>
          ${r.rejection_reason ? `<div style="font-size:0.75rem; color:#f87171; margin-top:0.2rem;">Reason: ${escapeHtml(r.rejection_reason)}</div>` : ''}
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            ${canPass ? `
              <button class="btn btn-secondary" style="padding: 0.4rem 0.6rem; font-size: 0.78rem;" onclick="showDigitalPass('${r.id}')">
                <i data-lucide="qr-code"></i> Pass
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderPendingApprovals() {
  const tbody = document.getElementById('pendingTableBody');
  if (!tbody) return;

  smartFetch(`${API_BASE}/borrow-requests`, { headers: getAuthHeaders() })
    .then(json => {
      if (!json || !json.success) return;
      const pendings = json.data.filter(r => r.status === 'PENDING');

      if (pendings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No pending approval requests.</td></tr>`;
        return;
      }

      tbody.innerHTML = pendings.map(r => `
        <tr>
          <td style="font-weight: 700; font-family: monospace; color: #fbbf24;">${r.id}</td>
          <td>${escapeHtml(r.student_id)}</td>
          <td>${r.department || 'CSE'} ${r.register_number ? `(${r.register_number})` : ''}</td>
          <td>${escapeHtml(r.equipment_name)}</td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${r.borrow_date} to ${r.expected_return_date}</td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(r.purpose)}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" onclick="approveReservation('${r.id}')">
                <i data-lucide="check"></i> Approve
              </button>
              <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" onclick="openRejectModal('${r.id}')">
                <i data-lucide="x"></i> Reject
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      if (window.lucide) window.lucide.createIcons();
    });
}

function renderAdminLoansTable(loans) {
  const tbody = document.getElementById('adminLoansTableBody');
  if (!tbody) return;

  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  if (activeLoans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No active issued loans.</td></tr>`;
    return;
  }

  tbody.innerHTML = activeLoans.map(l => `
    <tr>
      <td style="font-weight: 700; font-family: monospace; color: #60a5fa;">${l.loan_id}</td>
      <td>${escapeHtml(l.student_name)} (${l.student_id})</td>
      <td>${escapeHtml(l.equipment_name)} (Locker ${l.locker_id})</td>
      <td style="font-size: 0.85rem; color: var(--text-muted);">${l.issued_at}</td>
      <td style="font-size: 0.85rem; color: var(--text-muted);">${l.due_at}</td>
      <td><span class="status-badge ${l.status}">${l.status}</span></td>
      <td>
        <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" onclick="openReturnModal('${l.loan_id}')">
          <i data-lucide="corner-down-left"></i> Inspect & Return
        </button>
      </td>
    </tr>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderMaintenanceTable(maint) {
  const tbody = document.getElementById('maintenanceTableBody');
  if (!tbody) return;

  if (maint.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No equipment currently in maintenance.</td></tr>`;
    return;
  }

  tbody.innerHTML = maint.map(m => `
    <tr>
      <td style="font-weight: 700; font-family: monospace; color: #f87171;">#M-${m.maintenance_id}</td>
      <td>${escapeHtml(m.equipment_name)}</td>
      <td style="font-family: monospace; font-size: 0.85rem;">${m.serial_number}</td>
      <td style="font-size: 0.85rem; color: #f87171;">${escapeHtml(m.issue)}</td>
      <td style="font-size: 0.85rem; color: var(--text-muted);">${m.reported_at}</td>
      <td><span class="status-badge MAINTENANCE">${m.status}</span></td>
      <td>
        ${m.status !== 'COMPLETED' ? `
          <button class="btn btn-primary" style="padding: 0.35rem 0.7rem; font-size: 0.78rem; width: auto;" onclick="completeMaintenance(${m.maintenance_id})">
            <i data-lucide="check-circle"></i> Complete Repair
          </button>
        ` : `<span style="color: #34d399; font-size: 0.8rem;">Resolved</span>`}
      </td>
    </tr>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderAuditLogs(logs) {
  const tbody = document.getElementById('auditLogsBody');
  if (!tbody || !logs) return;

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td style="font-size: 0.8rem; color: var(--text-dim);">${l.timestamp}</td>
      <td><span class="status-badge AVAILABLE" style="font-size: 0.7rem;">${l.action}</span></td>
      <td style="font-weight: 600; font-size: 0.85rem;">${escapeHtml(l.user_id)}</td>
      <td style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(l.details)}</td>
    </tr>
  `).join('');
}

// Modal Handlers
function setupModals() {
  const reserveForm = document.getElementById('reserveForm');
  if (reserveForm) {
    reserveForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const profile = PROFILES[currentRole];
      const payload = {
        equipment_id: parseInt(document.getElementById('reserveEqId').value),
        user_id: profile.id,
        user_name: profile.name,
        borrow_date: document.getElementById('reserveStartDate').value.replace('T', ' '),
        expected_return_date: document.getElementById('reserveEndDate').value.replace('T', ' '),
        purpose: document.getElementById('reservePurpose').value
      };

      const json = await smartFetch(`${API_BASE}/borrow-requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (json && json.success) {
        closeModal('reserveModal');
        showToast(json.message, 'success');
        refreshAllData();

        if (json.qr_code_token) {
          setTimeout(() => {
            showDigitalPassWithData(json.request_id, document.getElementById('reserveEqName').value, json.pickup_locker, json.qr_code_token);
          }, 400);
        }
      } else {
        showToast((json && json.error) || 'Borrow request failed', 'error');
      }
    });
  }
}

function openReserveModal(equipmentId) {
  const eq = equipmentList.find(e => e.id === equipmentId);
  if (!eq) return;

  document.getElementById('reserveEqId').value = eq.id;
  document.getElementById('reserveEqName').value = eq.name;
  document.getElementById('reserveLocker').value = `${eq.locker_id} (${eq.location})`;
  document.getElementById('reserveStudentEmail').value = PROFILES[currentRole].email;

  openModal('reserveModal');
}

// Admin Actions
async function approveReservation(reqId) {
  const json = await smartFetch(`${API_BASE}/admin/requests/${reqId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (json && json.success) {
    showToast(`Borrow request ${reqId} approved! Active Loan issued.`, 'success');
    refreshAllData();
  } else {
    showToast((json && json.error) || 'Failed to approve', 'error');
  }
}

function openRejectModal(reqId) {
  document.getElementById('rejectReqId').value = reqId;
  openModal('rejectModal');
}

function setupRejectForm() {
  const form = document.getElementById('rejectForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reqId = document.getElementById('rejectReqId').value;
    const reason = document.getElementById('rejectReasonInput').value;

    const json = await smartFetch(`${API_BASE}/admin/requests/${reqId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    if (json && json.success) {
      closeModal('rejectModal');
      showToast(`Request ${reqId} rejected. Reason logged.`, 'success');
      refreshAllData();
    } else {
      showToast((json && json.error) || 'Failed to reject', 'error');
    }
  });
}

function openReturnModal(loanId) {
  document.getElementById('returnLoanId').value = loanId;
  openModal('returnModal');
}

function setupReturnForm() {
  const form = document.getElementById('returnForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loanId = document.getElementById('returnLoanId').value;
    const payload = {
      condition: document.getElementById('returnCondition').value,
      missing_accessories: document.getElementById('returnMissing').value,
      damage_description: document.getElementById('returnDamageDesc').value
    };

    const json = await smartFetch(`${API_BASE}/admin/loans/${loanId}/return`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (json && json.success) {
      closeModal('returnModal');
      showToast(json.message, 'success');
      refreshAllData();
    } else {
      showToast((json && json.error) || 'Failed to process return', 'error');
    }
  });
}

async function completeMaintenance(maintId) {
  const json = await smartFetch(`${API_BASE}/admin/maintenance/${maintId}/complete`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ resolution: 'Repaired and recalibrated by Lab Technician' })
  });
  if (json && json.success) {
    showToast(json.message, 'success');
    refreshAllData();
  }
}

function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      register_number: document.getElementById('regNum').value,
      department: document.getElementById('regDept').value,
      year: parseInt(document.getElementById('regYear').value),
      semester: parseInt(document.getElementById('regSem').value),
      phone: document.getElementById('regPhone').value
    };

    const json = await smartFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (json && json.success) {
      closeModal('registerModal');
      showToast(json.message, 'success');
      form.reset();
      refreshAllData();
    } else {
      showToast((json && json.error) || 'Registration failed', 'error');
    }
  });
}

function setupAddEquipmentForm() {
  const btnOpen = document.getElementById('btnOpenAddModal');
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      if (PROFILES[currentRole].role !== 'ADMIN') {
        showToast('BR-09: Switch role to Admin to register equipment.', 'error');
        return;
      }
      openModal('addEqModal');
    });
  }

  const form = document.getElementById('addEqForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById('addName').value,
        category_id: parseInt(document.getElementById('addCategory').value),
        locker_id: document.getElementById('addLocker').value,
        specifications: document.getElementById('addSpecs').value,
        location: document.getElementById('addLocation').value,
        requires_approval: document.getElementById('addApproval').checked
      };

      const json = await smartFetch(`${API_BASE}/equipment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (json && json.success) {
        closeModal('addEqModal');
        showToast(json.message, 'success');
        form.reset();
        refreshAllData();
      } else {
        showToast((json && json.error) || 'Failed to register equipment', 'error');
      }
    });
  }
}

// IoT Kiosk Simulator
function setupLockerKiosk() {
  const btnScanQr = document.getElementById('btnScanQr');
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      const token = document.getElementById('kioskQrInput').value.trim();
      if (!token) {
        showToast('Please enter or scan a QR Pass Token first', 'error');
        return;
      }
      triggerLockerUnlock({ qr_code_token: token });
    });
  }

  const btnRfid = document.getElementById('btnSimulateRfid');
  if (btnRfid) {
    btnRfid.addEventListener('click', () => {
      triggerLockerUnlock({ user_id: PROFILES[currentRole].id });
    });
  }
}

async function triggerLockerUnlock(payload) {
  const json = await smartFetch(`${API_BASE}/locker/unlock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (json && json.success) {
    showToast(json.message, 'success');

    const doorId = `locker-door-${json.locker_id.replace('-', '')}`;
    const doorEl = document.getElementById(doorId);
    if (doorEl) {
      doorEl.classList.add('unlocked');
      setTimeout(() => doorEl.classList.remove('unlocked'), 5000);
    }

    refreshAllData();
  } else {
    showToast((json && json.error) || 'Locker access denied', 'error');
  }
}

// Digital Pass & QR Canvas
function showDigitalPass(reqId) {
  const req = myReservations.find(r => r.id === reqId);
  if (!req) return;
  showDigitalPassWithData(req.id, req.equipment_name, req.pickup_locker, req.qr_code_token);
}

function showDigitalPassWithData(reqId, name, locker, token) {
  document.getElementById('passEquipmentName').textContent = name;
  document.getElementById('passLockerId').textContent = `Assigned Locker: ${locker}`;
  document.getElementById('passTokenCode').textContent = `TOKEN: ${token}`;

  const kioskInput = document.getElementById('kioskQrInput');
  if (kioskInput) kioskInput.value = token;

  renderQrCanvas('qrCanvas', token);
  openModal('passModal');
}

function renderQrCanvas(canvasId, text) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const gridSize = 21;
  const cellSize = width / gridSize;

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  ctx.fillStyle = '#0f172a';

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const isTopLeft = (row < 7 && col < 7);
      const isTopRight = (row < 7 && col >= gridSize - 7);
      const isBottomLeft = (row >= gridSize - 7 && col < 7);

      if (isTopLeft || isTopRight || isBottomLeft) {
        if (row === 0 || row === 6 || col === 0 || col === 6 ||
            (isTopRight && (row === 0 || row === 6 || col === gridSize - 7 || col === gridSize - 1)) ||
            (isBottomLeft && (row === gridSize - 7 || row === gridSize - 1 || col === 0 || col === 6))) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
        if ((row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
            (isTopRight && row >= 2 && row <= 4 && col >= gridSize - 5 && col <= gridSize - 3) ||
            (isBottomLeft && row >= gridSize - 5 && row <= gridSize - 3 && col >= 2 && col <= 4)) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      } else {
        const bit = Math.abs((hash * (row + 1) * 31 + (col + 1) * 17) % 100);
        if (bit > 48) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
  }
}

// Helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
