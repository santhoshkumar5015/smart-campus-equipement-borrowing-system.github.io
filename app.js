/**
 * SmartCampus EquipBorrow - Main Client Application Logic
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

    showToast(`Switched active user profile to ${profile.name} (${profile.role})`, 'success');
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
  try {
    const res = await fetch(`${API_BASE}/equipment`);
    const json = await res.json();
    if (json.success) {
      equipmentList = json.data;
      renderEquipmentCatalog();
      renderLockersGrid();
    }
  } catch (err) {
    console.error('Catalog fetch error', err);
  }
}

async function fetchMetricsAndAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    const json = await res.json();
    if (json.success) {
      const m = json.metrics;
      document.getElementById('metricTotal').textContent = m.total_inventory;
      document.getElementById('metricAvailable').textContent = m.available_now;
      document.getElementById('metricBorrowed').textContent = m.active_loans;
      document.getElementById('metricPending').textContent = m.pending_approvals;
      document.getElementById('metricMaintenance').textContent = m.in_maintenance;
      document.getElementById('metricOverdue').textContent = m.overdue;

      renderAuditLogs(json.recent_logs);
    }
  } catch (err) {
    console.error('Analytics fetch error', err);
  }
}

async function fetchMyLoans() {
  try {
    const profile = PROFILES[currentRole];
    const url = profile.role === 'ADMIN' ? `${API_BASE}/borrow-requests` : `${API_BASE}/borrow-requests?user_id=${profile.id}`;
    
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    if (json.success) {
      myReservations = json.data;
      renderMyLoansTable();
      renderPendingApprovals();
    }
  } catch (err) {
    console.error('Loans fetch error', err);
  }
}

async function fetchAdminLoans() {
  try {
    const res = await fetch(`${API_BASE}/loans`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (json.success) {
      renderAdminLoansTable(json.data);
    }
  } catch (err) {
    console.error('Admin loans fetch error', err);
  }
}

async function fetchMaintenanceQueue() {
  try {
    const res = await fetch(`${API_BASE}/maintenance`, { headers: getAuthHeaders() });
    const json = await res.json();
    if (json.success) {
      renderMaintenanceTable(json.data);
    }
  } catch (err) {
    console.error('Maintenance fetch error', err);
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

  fetch(`${API_BASE}/borrow-requests`, { headers: getAuthHeaders() })
    .then(r => r.json())
    .then(json => {
      if (!json.success) return;
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

      try {
        const res = await fetch(`${API_BASE}/borrow-requests`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.success) {
          closeModal('reserveModal');
          showToast(json.message, 'success');
          refreshAllData();

          if (json.qr_code_token) {
            setTimeout(() => {
              showDigitalPassWithData(json.request_id, document.getElementById('reserveEqName').value, json.pickup_locker, json.qr_code_token);
            }, 400);
          }
        } else {
          showToast(json.error || 'Borrow request failed', 'error');
        }
      } catch (err) {
        showToast('Server connection error', 'error');
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
  try {
    const res = await fetch(`${API_BASE}/admin/requests/${reqId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Borrow request ${reqId} approved! Active Loan issued.`, 'success');
      refreshAllData();
    } else {
      showToast(json.error || 'Failed to approve', 'error');
    }
  } catch (err) {
    showToast('Server connection error', 'error');
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

    try {
      const res = await fetch(`${API_BASE}/admin/requests/${reqId}/reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      const json = await res.json();
      if (json.success) {
        closeModal('rejectModal');
        showToast(`Request ${reqId} rejected. Reason logged.`, 'success');
        refreshAllData();
      } else {
        showToast(json.error || 'Failed to reject', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
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

    try {
      const res = await fetch(`${API_BASE}/admin/loans/${loanId}/return`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        closeModal('returnModal');
        showToast(json.message, 'success');
        refreshAllData();
      } else {
        showToast(json.error || 'Failed to process return', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    }
  });
}

async function completeMaintenance(maintId) {
  try {
    const res = await fetch(`${API_BASE}/admin/maintenance/${maintId}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolution: 'Repaired and recalibrated by Lab Technician' })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');
      refreshAllData();
    }
  } catch (err) {
    showToast('Failed to complete maintenance', 'error');
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

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        closeModal('registerModal');
        showToast(json.message, 'success');
        form.reset();
        refreshAllData();
      } else {
        showToast(json.error || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Registration error', 'error');
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

      try {
        const res = await fetch(`${API_BASE}/equipment`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          closeModal('addEqModal');
          showToast(json.message, 'success');
          form.reset();
          refreshAllData();
        } else {
          showToast(json.error || 'Failed to register equipment', 'error');
        }
      } catch (err) {
        showToast('Failed to add equipment', 'error');
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
  try {
    const res = await fetch(`${API_BASE}/locker/unlock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');

      const doorId = `locker-door-${json.locker_id.replace('-', '')}`;
      const doorEl = document.getElementById(doorId);
      if (doorEl) {
        doorEl.classList.add('unlocked');
        setTimeout(() => doorEl.classList.remove('unlocked'), 5000);
      }

      refreshAllData();
    } else {
      showToast(json.error || 'Locker access denied', 'error');
    }
  } catch (err) {
    showToast('Locker connection error', 'error');
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
