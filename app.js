/**
 * Smart Campus Equipment Borrowing System - Main Client Application Logic
 */

const API_BASE = '/api';

// Global User & Role State
let currentRole = 'student'; // 'student' or 'admin'
let currentCategory = 'All';
let searchQuery = '';
let equipmentList = [];
let myReservations = [];

const USERS = {
  student: {
    id: 'STU-88210',
    name: 'Alex Rivera',
    email: 'arivera@campus.edu',
    role: 'student',
    avatar: 'AR',
    subtext: 'STU-88210 | Student'
  },
  admin: {
    id: 'ADM-00001',
    name: 'Dr. Sarah Vance',
    email: 'svance@campus.edu',
    role: 'admin',
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

  // Initial Data Fetch
  refreshAllData();

  // Default datetimes
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

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
    const user = USERS[currentRole];

    document.getElementById('userAvatarText').textContent = user.avatar;
    document.getElementById('userNameText').textContent = user.name;
    document.getElementById('userRoleSubtext').textContent = user.subtext;

    document.getElementById('rfidBadgeName').textContent = `Tap ${user.name}'s ID`;
    document.getElementById('rfidBadgeId').textContent = `RFID ID: ${user.id}`;

    showToast(`Switched active view to ${user.name} (${user.role.toUpperCase()})`, 'success');
    refreshAllData();
  });
}

// Helper to add Role Header to API calls
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-User-Role': currentRole
  };
}

// Refresh Data
async function refreshAllData() {
  await fetchMetricsAndAnalytics();
  await fetchEquipmentCatalog();
  await fetchMyLoans();
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
      document.getElementById('metricTotal').textContent = m.total_equipment;
      document.getElementById('metricAvailable').textContent = m.available;
      document.getElementById('metricBorrowed').textContent = m.borrowed;
      document.getElementById('metricPending').textContent = m.pending_approvals;
      document.getElementById('metricMaintenance').textContent = m.maintenance;

      renderAuditLogs(json.recent_logs);
    }
  } catch (err) {
    console.error('Analytics fetch error', err);
  }
}

async function fetchMyLoans() {
  try {
    const user = USERS[currentRole];
    const url = currentRole === 'admin' ? `${API_BASE}/borrow-requests` : `${API_BASE}/borrow-requests?user_id=${user.id}`;
    
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

// UI Renderers
function renderEquipmentCatalog() {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;

  const filtered = equipmentList.filter(item => {
    const matchCategory = currentCategory === 'All' || item.category === currentCategory;
    const matchSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery) ||
      item.specifications.toLowerCase().includes(searchQuery) ||
      item.location.toLowerCase().includes(searchQuery) ||
      item.serial_number.toLowerCase().includes(searchQuery);
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
    const isAvailable = item.status === 'Available';
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

          <div class="equipment-category">${item.category}</div>
          <h3 class="equipment-title">${escapeHtml(item.name)}</h3>
          <p class="equipment-specs">${escapeHtml(item.specifications)}</p>

          <div class="equipment-meta">
            <div class="meta-row">
              <span><i data-lucide="map-pin"></i> ${escapeHtml(item.location)}</span>
              <span><i data-lucide="door-closed"></i> Locker ${item.locker_id}</span>
            </div>
            <div class="meta-row">
              <span><i data-lucide="battery-charging"></i> ${item.battery_level}% Battery</span>
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
    const isOccupied = item && item.status !== 'Available';
    const isBorrowed = item && item.status === 'Borrowed';

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

  const activeCount = myReservations.filter(r => ['Pending', 'Approved', 'CheckedOut'].includes(r.status)).length;
  const activeLimitEl = document.getElementById('activeLimitDisplay');
  if (activeLimitEl) {
    activeLimitEl.textContent = `${activeCount} / 2 Max (BR-05)`;
    activeLimitEl.style.color = activeCount >= 2 ? '#ef4444' : '#60a5fa';
  }

  if (myReservations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No request history found.</td></tr>`;
    return;
  }

  tbody.innerHTML = myReservations.map(r => {
    const canPass = ['Approved', 'CheckedOut'].includes(r.status);
    const canReturn = r.status === 'CheckedOut';

    return `
      <tr>
        <td style="font-weight: 700; font-family: monospace; color: #60a5fa;">${r.id}</td>
        <td style="font-weight: 600;">${escapeHtml(r.equipment_name)}</td>
        <td><span class="status-badge Borrowed">${r.pickup_locker}</span></td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${r.borrow_date}<br>to ${r.return_date}</td>
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
            ${canReturn ? `
              <button class="btn btn-primary" style="padding: 0.4rem 0.6rem; font-size: 0.78rem; width:auto;" onclick="returnEquipmentDirect('${r.id}')">
                <i data-lucide="corner-down-left"></i> Return
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

  fetch(`${API_BASE}/borrow-requests`)
    .then(r => r.json())
    .then(json => {
      if (!json.success) return;
      const pendings = json.data.filter(r => r.status === 'Pending');

      if (pendings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No pending approval requests.</td></tr>`;
        return;
      }

      tbody.innerHTML = pendings.map(r => `
        <tr>
          <td style="font-weight: 700; font-family: monospace; color: #fbbf24;">${r.id}</td>
          <td>${escapeHtml(r.user_name)} (${r.user_id})</td>
          <td>${escapeHtml(r.equipment_name)}</td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${r.borrow_date} to ${r.return_date}</td>
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

function renderAuditLogs(logs) {
  const tbody = document.getElementById('auditLogsBody');
  if (!tbody || !logs) return;

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td style="font-size: 0.8rem; color: var(--text-dim);">${l.timestamp}</td>
      <td><span class="status-badge Available" style="font-size: 0.7rem;">${l.action}</span></td>
      <td style="font-weight: 600; font-size: 0.85rem;">${escapeHtml(l.user_info)}</td>
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

      const user = USERS[currentRole];
      const payload = {
        equipment_id: parseInt(document.getElementById('reserveEqId').value),
        user_id: user.id,
        user_name: user.name,
        user_email: document.getElementById('reserveStudentEmail').value,
        borrow_date: document.getElementById('reserveStartDate').value.replace('T', ' '),
        return_date: document.getElementById('reserveEndDate').value.replace('T', ' '),
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
          // Display exact Business Rule failure error!
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
  document.getElementById('reserveStudentEmail').value = USERS[currentRole].email;

  openModal('reserveModal');
}

// Admin Actions
async function approveReservation(reqId) {
  try {
    const res = await fetch(`${API_BASE}/borrow-requests/${reqId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Borrow request ${reqId} approved!`, 'success');
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
      const res = await fetch(`${API_BASE}/borrow-requests/${reqId}/reject`, {
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

async function returnEquipmentDirect(reqId) {
  try {
    const res = await fetch(`${API_BASE}/borrow-requests/${reqId}/return`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ condition: 'Good', remarks: 'Returned at lab desk' })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Equipment for ${reqId} returned! Equipment status reset to Available.`, 'success');
      refreshAllData();
    }
  } catch (err) {
    showToast('Failed to process return', 'error');
  }
}

function setupAddEquipmentForm() {
  const btnOpen = document.getElementById('btnOpenAddModal');
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      if (currentRole !== 'admin') {
        showToast('BR-07: Switch role to Admin to add equipment.', 'error');
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
        category: document.getElementById('addCategory').value,
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
          showToast(json.error || 'Failed to add equipment', 'error');
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
      triggerLockerUnlock({ user_id: USERS[currentRole].id });
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
