// doctor_appointment.js
// Doctor-facing appointments page wired to backend APIs.
(() => {
  const API_BASE = window.API_BASE || 'http://127.0.0.1:3000/api';

  // State
  const state = {
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    availability: {},
    appointments: [],
    doctor: null
  };
  let currentDay = 'Monday';
  let currentStatusPopover = null;

  // DOM helpers
  const el = (sel) => document.querySelector(sel);
  const els = (sel) => Array.from(document.querySelectorAll(sel));

  // Elements
  const slotsArea = el('#slotsArea');
  const appointmentsList = el('#appointments-list');
  const modalOverlay = el('#modalOverlay');
  const appointmentModal = el('#appointmentModal');
  const appointmentModalBody = el('#appointmentModalBody');
  const closeAppointmentModal = el('#closeAppointmentModal');
  const closeAppBtn = el('#closeAppBtn');
  const editAvailabilityModal = el('#editAvailabilityModal');
  const closeEditAvail = el('#closeEditAvail');
  const saveAvailBtn = el('#saveAvailBtn');
  const cancelAvailBtn = el('#cancelAvailBtn');
  const addSlotBtn = el('#addSlotBtn');
  const applyAllBtn = el('#applyAllBtn');

  // ------------------------------------------------------------------
  // Utility helpers
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || null;

  async function apiFetch(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    let body = options.body;
    if (body && typeof body === 'object') {
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
      body
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.message || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  const formatTime12h = (t) => {
    if (!t) return '';
    const [hh, mm] = t.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h = ((hh + 11) % 12) + 1;
    return `${String(h).padStart(2, '0')}:${String(mm ?? 0).padStart(2, '0')} ${ampm}`;
  };

  const capitalize = (s) => (!s ? '' : s.charAt(0).toUpperCase() + s.slice(1));

  const normalizeStatus = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'completed') return 'completed';
    if (v === 'cancelled' || v === 'canceled') return 'cancelled';
    return 'booked';
  };

  const dayNameFromDate = (dateStr) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[new Date(dateStr).getDay()];
  };

  const formatDateTime = (dateStr, startTime) => {
    const dt = new Date(`${dateStr}T${startTime}`);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const datePart = dt.toLocaleDateString('en-US', options);
    return `${datePart} - ${formatTime12h(startTime)}`;
  };



  const showInlineError = (msg) => {
    if (slotsArea) {
      slotsArea.innerHTML = `<div class="empty-msg">${msg}</div>`;
    }
    if (appointmentsList) {
      appointmentsList.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b8b90;padding:12px">${msg}</td></tr>`;
    }
  };

  // ------------------------------------------------------------------
  // Availability rendering
  function renderSlots(day = currentDay) {
    if (!slotsArea) return;
    slotsArea.innerHTML = '';
    const arr = state.availability[day] || [];
    if (arr.length === 0) {
      slotsArea.innerHTML = `<div class="empty-msg">No slots set for ${day}</div>`;
      return;
    }
    arr.forEach((s) => {
      const btn = document.createElement('button');
      btn.className = `slot-btn ${s.status}`;
      btn.textContent = `${formatTime12h(s.from)} - ${formatTime12h(s.to)}`;
      if (s.appointmentId) {
        btn.title = 'Open appointment';
        btn.addEventListener('click', () => openAppointmentModal(s.appointmentId));
      }
      slotsArea.appendChild(btn);
    });
  }

  // ------------------------------------------------------------------
  // Appointments rendering
  function renderAppointments() {
    if (!appointmentsList) return;
    appointmentsList.innerHTML = '';
    if (state.appointments.length === 0) {
      appointmentsList.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b8b90;padding:12px">No appointments found.</td></tr>`;
      return;
    }

    state.appointments.forEach((app) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="patient-cell">
            <img class="patient-avatar" src="${app.avatar}" alt="${app.name}">
            <div class="patient-info">
              <span class="patient-name">${app.name}</span>
              <span class="patient-phone">${app.phone}</span>
            </div>
          </div>
        </td>
        <td>${app.datetime}</td>
        <td><span class="badge ${app.status}">${capitalize(app.status)}</span></td>
        <td>
          <div class="actions">
            <button class="action-btn icon-btn status-btn" data-id="${app.id}" title="Edit status">
              <i class="fa-solid fa-gear"></i>
            </button>
            <button class="action-btn icon-btn pres-btn" data-id="${app.id}" title="Add prescription">
              <i class="fa-solid fa-file-medical"></i>
            </button>
          </div>
        </td>
      `;
      appointmentsList.appendChild(tr);
    });

    els('.status-btn').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(e.currentTarget.dataset.id);
        openStatusPopover(e.currentTarget, id);
      });
    });

    els('.pres-btn').forEach((b) =>
      b.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        openPrescriptionInline(id);
      })
    );
  }

  // ------------------------------------------------------------------
  // Status popover
  function closeStatusPopover() {
    if (currentStatusPopover) {
      currentStatusPopover.remove();
      currentStatusPopover = null;
      document.removeEventListener('click', handleDocClickClosePopover);
    }
  }
  function handleDocClickClosePopover(e) {
    if (currentStatusPopover && !currentStatusPopover.contains(e.target)) {
      closeStatusPopover();
    }
  }
  function openStatusPopover(button, appointmentId) {
    closeStatusPopover();
    const rect = button.getBoundingClientRect();
    const pop = document.createElement('div');
    pop.className = 'status-popover';
    pop.setAttribute('role', 'menu');
    pop.innerHTML = `
      <button class="status-option cancelled" data-status="cancelled">Cancelled</button>
      <button class="status-option booked" data-status="booked">Booked</button>
      <button class="status-option completed" data-status="completed">Completed</button>
    `;
    pop.style.position = 'absolute';
    pop.style.top = `${window.scrollY + rect.bottom + 6}px`;
    pop.style.left = `${window.scrollX + rect.left}px`;
    document.body.appendChild(pop);
    currentStatusPopover = pop;

    pop.addEventListener('click', (e) => e.stopPropagation());

    pop.querySelectorAll('.status-option').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const st = btn.getAttribute('data-status');
        try {
          await updateAppointmentStatus(appointmentId, st);
          closeStatusPopover();
        } catch (err) {
          alert(err.message);
        }
      });
    });

    setTimeout(() => {
      document.addEventListener('click', handleDocClickClosePopover);
    }, 0);
  }

  async function updateAppointmentStatus(id, status) {
    await apiFetch(`/appointments/${id}`, {
      method: 'PATCH',
      body: { Status: capitalize(status) }
    });
    await refreshData();
  }

  // ------------------------------------------------------------------
  // Appointment modal
  function openAppointmentModal(id) {
    const app = state.appointments.find((a) => a.id === id);
    if (!app) return;
    appointmentModalBody.innerHTML = `
      <div style="display:flex;gap:14px;align-items:center">
        <img src="${app.avatar}" style="width:72px;height:72px;border-radius:10px;object-fit:cover" alt="${app.name}">
        <div>
          <div style="font-weight:700;font-size:18px">${app.name}</div>
          <div style="color:#6b8b90">${app.phone}</div>
          <div style="margin-top:8px;color:#6b8b90">${app.datetime}</div>
        </div>
      </div>
      <hr style="margin:12px 0">
      <div id="statusSection">
        <label style="font-weight:700;margin-bottom:6px;display:block">Status</label>
        <select id="modalStatusSelect">
          <option value="booked">Booked</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <div style="margin-top:12px">
          <button class="btn btn-primary" id="saveStatusBtn">Save status</button>
          <button class="btn btn-secondary" id="addPrescriptionInlineBtn" style="margin-left:8px">Add prescription</button>
        </div>
      </div>
      <div id="prescriptionInlineContainer" style="margin-top:12px"></div>
    `;
    const sel = el('#modalStatusSelect');
    sel.value = app.status;
    el('#saveStatusBtn').addEventListener('click', async () => {
      try {
        await updateAppointmentStatus(id, sel.value);
        closeAppointmentModalAndRefresh();
      } catch (err) {
        alert(err.message);
      }
    });
    el('#addPrescriptionInlineBtn').addEventListener('click', () => {
      openPrescriptionPanelInModal(app);
    });
    showModal(appointmentModal);
  }

  function closeAppointmentModalAndRefresh() {
    closeAllModals();
    renderAppointments();
  }

  closeAppointmentModal?.addEventListener('click', closeAllModals);
  closeAppBtn?.addEventListener('click', closeAllModals);

  function showModal(modal) {
    modalOverlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeAllModals() {
    modalOverlay.classList.add('hidden');
    appointmentModal.classList.add('hidden');
    editAvailabilityModal.classList.add('hidden');
    document.body.style.overflow = '';
    closeStatusPopover();
  }
  modalOverlay?.addEventListener('click', closeAllModals);

  // ------------------------------------------------------------------
  // Prescription helpers (mock, local only)
  function openPrescriptionPanelInModal(app) {
    const container = el('#prescriptionInlineContainer');
    const statusSection = el('#statusSection');
    if (statusSection) statusSection.style.display = 'none';
    container.innerHTML = `
      <div class="prescription-panel">
        <div class="pres-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-weight:700">Prescription for ${app.name}</div>
            <div style="color:#6b8b90;font-size:13px">${app.datetime}</div>
          </div>
          <button class="btn btn-secondary" id="closePrescriptionPanelBtn">Close</button>
        </div>
        <label style="font-weight:700;margin-bottom:6px;display:block">Prescription Notes</label>
        <textarea id="prescriptionNotesInline" rows="4" placeholder="Write instructions, notes, or diagnosis here..." style="width:100%;padding:10px;border-radius:8px;border:1px solid #e6f1f4;margin-bottom:12px"></textarea>
        <label style="font-weight:700;margin-bottom:6px;display:block">Medications</label>
        <div id="medListInline" class="med-list"></div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <input id="medNameInline" placeholder="Medication name" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6f1f4">
          <input id="medDoseInline" placeholder="Dose / instructions" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6f1f4">
          <button class="btn btn-primary" id="addMedInlineBtn">Add</button>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
          <button class="btn btn-primary" id="savePrescriptionInlineBtn">Save Prescription</button>
        </div>
      </div>
    `;

    function renderMedList() {
      const list = el('#medListInline');
      list.innerHTML = '';
      const meds = app._prescription?.meds || [];
      if (meds.length === 0) {
        list.innerHTML = '<div style="color:#6b8b90">No medications added yet.</div>';
        return;
      }
      meds.forEach((m, idx) => {
        const row = document.createElement('div');
        row.className = 'med-row';
        row.innerHTML = `<div class="med-item"><strong>${m.name}</strong> - <span>${m.dose}</span></div>
                         <button class="btn btn-secondary med-del-btn" data-idx="${idx}">Delete</button>`;
        list.appendChild(row);
      });
      list.querySelectorAll('.med-del-btn').forEach((b) => {
        b.addEventListener('click', (e) => {
          const i = Number(e.currentTarget.dataset.idx);
          app._prescription.meds.splice(i, 1);
          renderMedList();
        });
      });
    }

    if (!app._prescription) app._prescription = { notes: '', meds: [] };
    el('#prescriptionNotesInline').value = app._prescription.notes || '';
    renderMedList();

    el('#addMedInlineBtn').addEventListener('click', () => {
      const name = el('#medNameInline').value.trim();
      const dose = el('#medDoseInline').value.trim();
      if (!name) {
        alert('Please enter medication name');
        return;
      }
      app._prescription.meds.push({ name, dose });
      el('#medNameInline').value = '';
      el('#medDoseInline').value = '';
      renderMedList();
    });

    el('#savePrescriptionInlineBtn').addEventListener('click', () => {
      const notes = el('#prescriptionNotesInline').value.trim();
      app._prescription.notes = notes;
      alert('Prescription saved locally (mock).');
      container.innerHTML = '';
      if (statusSection) statusSection.style.display = '';
    });

    el('#closePrescriptionPanelBtn').addEventListener('click', () => {
      closeAllModals();
    });
  }

  function openPrescriptionInline(id) {
    const alreadyOpen = !appointmentModal.classList.contains('hidden');
    if (!alreadyOpen) {
      openAppointmentModal(id);
      setTimeout(() => {
        const app = state.appointments.find((a) => a.id === id);
        if (app) openPrescriptionPanelInModal(app);
      }, 140);
      return;
    }
    const app = state.appointments.find((a) => a.id === id);
    if (app) openPrescriptionPanelInModal(app);
  }


  // ------------------------------------------------------------------
  // Availability modal (view-only here)
  addSlotBtn?.addEventListener('click', () => alert('Editing availability requires admin access.'));
  applyAllBtn?.addEventListener('click', () => alert('Editing availability requires admin access.'));
  saveAvailBtn?.addEventListener('click', () => alert('Editing availability requires admin access.'));
  cancelAvailBtn?.addEventListener('click', closeAllModals);
  closeEditAvail?.addEventListener('click', closeAllModals);
  el('#editAvailabilityBtn')?.addEventListener('click', () => {
    editAvailabilityModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  // ------------------------------------------------------------------
  // Data loading
  async function refreshData() {
    if (!state.doctor?.id) return;
    slotsArea.innerHTML = '<div class="empty-msg">Loading availability...</div>';
    appointmentsList.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#6b8b90;padding:12px">Loading appointments...</td></tr>';
    try {
      const [availabilityResp, appointmentsResp] = await Promise.all([
        apiFetch(`/doctors/${state.doctor.id}/availability`),
        apiFetch(`/doctors/${state.doctor.id}/appointments`)
      ]);
      const availableSlots = availabilityResp.data?.availableSlots || {};
      const apiAppointments = appointmentsResp.data?.appointments || [];

      // map appointments for UI
      state.appointments = apiAppointments.map((a) => {
        const patient = a.patient?.user || {};
        const avatar = a.patient?.Image_url || 'images/default-avatar.png';
        const phone = patient.Phone || 'N/A';
        const fullName = `${patient.FirstName || 'Patient'} ${patient.LastName || ''}`.trim();
        return {
          id: a.AppointmentID,
          name: fullName,
          phone,
          avatar,
          status: normalizeStatus(a.Status),
          datetime: formatDateTime(a.AppointmentDate, a.StartTime),
          AppointmentDate: a.AppointmentDate,
          StartTime: a.StartTime,
          EndTime: a.EndTime
        };
      });

      // build availability grid from working-hours availability + appointments
      state.availability = {};
      state.weekdays.forEach((d) => {
        state.availability[d] = (availableSlots[d] || []).map((s) => ({
          from: (s.startTime || '').slice(0, 5),
          to: (s.endTime || '').slice(0, 5),
          status: 'neutral'
        }));
      });
      apiAppointments.forEach((a) => {
        const dayName = dayNameFromDate(a.AppointmentDate);
        const from = (a.StartTime || '').slice(0, 5);
        const to = (a.EndTime || '').slice(0, 5);
        const st = normalizeStatus(a.Status);
        if (!state.availability[dayName]) state.availability[dayName] = [];
        const arr = state.availability[dayName];
        const idx = arr.findIndex((s) => s.from.slice(0, 5) === from);
        const slotObj = { from, to, status: st, appointmentId: a.AppointmentID };
        if (idx >= 0) arr[idx] = { ...arr[idx], ...slotObj };
        else arr.push(slotObj);
      });

      renderSlots(currentDay);
      renderAppointments();
    } catch (err) {
      console.error(err);
      showInlineError(err.message || 'Failed to load data');
    }
  }

  async function init() {
    try {
      const profileResp = await apiFetch('/auth/profile');
      const user = profileResp.data?.user;
      if (!user || user.Role !== 'Doctor') {
        alert('Doctor access required.');
        window.location.href = 'login.html';
        return;
      }
      state.doctor = { id: user.UserID, name: `${user.FirstName || ''} ${user.LastName || ''}`.trim() };
      renderSlots();
      renderAppointments();
      await refreshData();
    } catch (err) {
      console.error(err);
      showInlineError(err.message || 'Unable to load doctor data');
    }
  }

  // ------------------------------------------------------------------
  // Weekday tabs
  els('.day-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      els('.day-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentDay = btn.dataset.day;
      renderSlots(currentDay);
    });
  });

  // Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Kickoff
  document.addEventListener('DOMContentLoaded', init);
})();
