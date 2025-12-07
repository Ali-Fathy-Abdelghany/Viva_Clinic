// Appointments admin view wired to backend APIs
(() => {
  const API_BASE = window.API_BASE || 'http://127.0.0.1:3000/api';
  const DEFAULT_AVATAR = 'images/default-avatar.png';

  const filterToggle = document.getElementById('filterToggle');
  const filterMenu = document.getElementById('filterMenu');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  const quickThisWeek = document.getElementById('quickThisWeek');
  const quickThisMonth = document.getElementById('quickThisMonth');
  const clearDates = document.getElementById('clearDates');
  const patientNameFilter = document.getElementById('patientNameFilter');
  const doctorFilter = document.getElementById('doctorFilter');
  const modeFilter = document.getElementById('modeFilter');
  const appointmentsContainer = document.getElementById('appointmentsContainer');
  const dateRangeLabel = document.getElementById('dateRangeLabel');

  const state = { appointments: [], filtered: [], selectedStatus: 'all' };

  const statusClassMap = {
    booked: 'schedule',
    scheduled: 'schedule',
    rescheduled: 'confirmed',
    completed: 'confirmed',
    cancelled: 'cancelled',
    canceled: 'cancelled',
  };

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  async function apiFetch(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    if (options.body && typeof options.body === 'object' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(API_BASE + path, { credentials: 'include', ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.message || 'Request failed (' + res.status + ')';
      throw new Error(msg);
    }
    return data;
  }

  const formatTime = (t) => {
    if (!t) return '';
    const parts = t.split(':').map(Number);
    const h = parts[0];
    const m = parts[1] || 0;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = ((h + 11) % 12) + 1;
    return (hour < 10 ? '0' + hour : hour) + ':' + String(m).padStart(2, '0') + ' ' + ampm;
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return '';
    const dt = new Date(dateStr + 'T' + (timeStr || '00:00'));
    const datePart = dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return (datePart + ' ' + formatTime(timeStr)).trim();
  };

  const normalizeStatus = (s) => (s || '').toLowerCase();

  function renderAppointments(list) {
    if (!appointmentsContainer) return;
    appointmentsContainer.innerHTML = '';
    if (!list.length) {
      appointmentsContainer.innerHTML = '<div class="empty-state">No appointments found.</div>';
      return;
    }

    list.forEach((appt) => {
      const statusKey = normalizeStatus(appt.status);
      const statusClass = statusClassMap[statusKey] || 'schedule';
      const card = document.createElement('div');
      card.className = 'appointment-card';
      card.dataset.status = statusKey;
      card.dataset.date = appt.appointmentDate;
      card.dataset.fee = String(appt.fee || 0);
      card.innerHTML =
        '<div class="date-time">' + appt.dateTime + '</div>' +
        '<div class="patient-info person-info">' +
          '<img src="' + appt.patientAvatar + '" alt="' + appt.patientName + '">' +
          '<div>' +
            '<div class="person-name">' + appt.patientName + '</div>' +
            '<div class="person-detail">' + appt.patientPhone + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="doctor-info person-info">' +
          '<img src="' + appt.doctorAvatar + '" alt="' + appt.doctorName + '">' +
          '<div>' +
            '<div class="person-name">' + appt.doctorName + '</div>' +
            '<div class="person-detail">' + appt.specialty + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mode">' + appt.mode + '</div>' +
        '<div class="status ' + statusClass + '">' + appt.status + '</div>' +
        '<div class="actions"><i class="fas fa-ellipsis-h" aria-hidden="true"></i></div>';
      appointmentsContainer.appendChild(card);
    });
  }

  function updateDateLabel() {
    if (!dateRangeLabel) return;
    if ((dateFrom && dateFrom.value) || (dateTo && dateTo.value)) {
      const parts = [];
      if (dateFrom && dateFrom.value) parts.push(new Date(dateFrom.value).toLocaleDateString('en-US'));
      if (dateTo && dateTo.value) parts.push(new Date(dateTo.value).toLocaleDateString('en-US'));
      dateRangeLabel.textContent = parts.join(' - ');
    } else {
      dateRangeLabel.textContent = 'All dates';
    }
  }

  function applyFiltersAndSort() {
    const term = (searchInput && searchInput.value || '').toLowerCase().trim();
    const patientTerm = (patientNameFilter && patientNameFilter.value || '').toLowerCase().trim();
    const doctorId = doctorFilter ? doctorFilter.value : '';
    const modeVal = modeFilter ? modeFilter.value : '';
    const selectedStatus = state.selectedStatus;

    const fromDate = dateFrom && dateFrom.value ? new Date(dateFrom.value) : null;
    const toDate = dateTo && dateTo.value ? new Date(dateTo.value) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    state.filtered = state.appointments.filter((appt) => {
      const dateObj = new Date(appt.appointmentDate + 'T' + (appt.startTime || '00:00'));
      if (fromDate && dateObj < fromDate) return false;
      if (toDate && dateObj > toDate) return false;
      if (patientTerm && appt.patientName.toLowerCase().indexOf(patientTerm) === -1) return false;
      if (doctorId && String(appt.doctorId) !== doctorId) return false;
      if (modeVal && appt.mode !== modeVal) return false;
      if (selectedStatus !== 'all' && normalizeStatus(appt.status) !== selectedStatus) return false;
      if (!term) return true;
      const composite = (appt.patientName + ' ' + appt.patientPhone + ' ' + appt.doctorName + ' ' + appt.specialty).toLowerCase();
      return composite.indexOf(term) !== -1;
    });

    const sortVal = sortSelect ? sortSelect.value : 'recent';
    const sorted = state.filtered.slice().sort((a, b) => {
      const dateA = new Date(a.appointmentDate + 'T' + a.startTime);
      const dateB = new Date(b.appointmentDate + 'T' + b.startTime);
      if (sortVal === 'recent') return dateB - dateA;
      if (sortVal === 'oldest') return dateA - dateB;
      if (sortVal === 'fee-high') return (b.fee || 0) - (a.fee || 0);
      if (sortVal === 'fee-low') return (a.fee || 0) - (b.fee || 0);
      return 0;
    });

    renderAppointments(sorted);
    updateDateLabel();
  }

  function wireStatusDropdown() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      const selectedText = dropdown.querySelector('.selected-text');
      const items = dropdown.querySelectorAll('.dropdown-item');

      if (toggle) {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = toggle.classList.toggle('open');
          if (menu) menu.classList.toggle('open', isOpen);
        });
      }

      items.forEach((item) => {
        item.addEventListener('click', () => {
          const value = item.dataset.status || 'all';
          const text = item.textContent.trim();
          state.selectedStatus = value;
          if (selectedText) selectedText.textContent = text;
          items.forEach((i) => i.classList.remove('selected'));
          item.classList.add('selected');
          if (toggle) toggle.classList.remove('open');
          if (menu) menu.classList.remove('open');
          applyFiltersAndSort();
        });
      });

      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          if (toggle) toggle.classList.remove('open');
          if (menu) menu.classList.remove('open');
        }
      });
    });
  }

  function wireFilterMenu() {
    if (filterToggle) {
      filterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (filterMenu) filterMenu.classList.toggle('active');
      });
    }
    document.addEventListener('click', (e) => {
      if (filterToggle && filterToggle.contains(e.target)) return;
      if (filterMenu && !filterMenu.contains(e.target)) {
        filterMenu.classList.remove('active');
      }
    });
    if (filterMenu) filterMenu.addEventListener('click', (e) => e.stopPropagation());
  }

  function attachFilterHandlers() {
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
    if (sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);
    if (dateFrom) dateFrom.addEventListener('change', applyFiltersAndSort);
    if (dateTo) dateTo.addEventListener('change', applyFiltersAndSort);
    if (patientNameFilter) patientNameFilter.addEventListener('input', applyFiltersAndSort);
    if (doctorFilter) doctorFilter.addEventListener('change', applyFiltersAndSort);
    if (modeFilter) modeFilter.addEventListener('change', applyFiltersAndSort);
  }

  const setDateInput = (input, dateObj) => {
    if (!input || !dateObj) return;
    const iso = dateObj.toISOString().slice(0, 10);
    input.value = iso;
  };

  function wireQuickDateFilters() {
    if (quickThisWeek) {
      quickThisWeek.addEventListener('click', () => {
        const today = new Date();
        const day = today.getDay(); // 0=Sun
        const mondayOffset = (day + 6) % 7;
        const start = new Date(today);
        start.setDate(today.getDate() - mondayOffset);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        setDateInput(dateFrom, start);
        setDateInput(dateTo, end);
        applyFiltersAndSort();
      });
    }
    if (quickThisMonth) {
      quickThisMonth.addEventListener('click', () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateInput(dateFrom, start);
        setDateInput(dateTo, end);
        applyFiltersAndSort();
      });
    }
    if (clearDates) {
      clearDates.addEventListener('click', () => {
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        applyFiltersAndSort();
      });
    }
  }

  async function loadDoctors() {
    if (!doctorFilter) return;
    try {
      const res = await apiFetch('/doctors');
      const doctors = res.data && res.data.doctors ? res.data.doctors : [];
      doctors.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = d.DoctorID;
        const firstName = d.user && d.user.FirstName ? d.user.FirstName : 'Doctor';
        const lastName = d.user && d.user.LastName ? d.user.LastName : '';
        opt.textContent = (firstName + ' ' + lastName).trim();
        doctorFilter.appendChild(opt);
      });
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  }

  function mapAppointment(raw) {
    const patientUser = raw.patient && raw.patient.user ? raw.patient.user : {};
    const doctorUser = raw.doctor && raw.doctor.user ? raw.doctor.user : {};
    return {
      id: raw.AppointmentID,
      appointmentDate: raw.AppointmentDate,
      startTime: raw.StartTime,
      endTime: raw.EndTime,
      status: raw.Status || 'Booked',
      patientName: ((patientUser.FirstName || 'Patient') + ' ' + (patientUser.LastName || '')).trim(),
      patientPhone: patientUser.Phone || 'N/A',
      patientAvatar: raw.patient && raw.patient.Image_url ? raw.patient.Image_url : DEFAULT_AVATAR,
      doctorName: ((doctorUser.FirstName || 'Doctor') + ' ' + (doctorUser.LastName || '')).trim(),
      doctorAvatar: raw.doctor && raw.doctor.Image_url ? raw.doctor.Image_url : DEFAULT_AVATAR,
      doctorId: raw.DoctorID,
      specialty: raw.doctor && raw.doctor.specialty ? (raw.doctor.specialty.Name || 'General') : 'General',
      mode: raw.Mode || 'In-Person',
      fee: raw.doctor && raw.doctor.Fee ? raw.doctor.Fee : 0,
      dateTime: formatDateTime(raw.AppointmentDate, raw.StartTime),
    };
  }

  async function loadAppointments() {
    if (appointmentsContainer) {
      appointmentsContainer.innerHTML = '<div class="empty-state">Loading appointments...</div>';
    }
    try {
      const res = await apiFetch('/appointments');
      const appointments = res.data && res.data.appointments ? res.data.appointments : [];
      state.appointments = appointments.map(mapAppointment);
      applyFiltersAndSort();
    } catch (err) {
      console.error(err);
      if (appointmentsContainer) {
        appointmentsContainer.innerHTML = '<div class="empty-state">' + err.message + '</div>';
      }
    }
  }

  async function ensureAdmin() {
    try {
      const res = await apiFetch('/auth/profile');
      const user = res.data && res.data.user;
      if (!user || user.Role !== 'Admin') {
        alert('Admin access required. Please log in.');
        window.location.href = 'login.html';
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      alert('Please log in as an admin to view appointments.');
      window.location.href = 'login.html';
      return false;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    wireFilterMenu();
    wireStatusDropdown();
    attachFilterHandlers();
    wireQuickDateFilters();
    const allowed = await ensureAdmin();
    if (!allowed) return;
    await loadDoctors();
    await loadAppointments();
  });
})();
