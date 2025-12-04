// Mock data and helpers
const state = {
  weekdays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  // each day has array of slots {from,to,status}
  availability: {
    Monday: [{from:'11:30',to:'12:30',status:'booked'},{from:'18:00',to:'19:30',status:'neutral'}],
    Tuesday: [{from:'12:30',to:'13:30',status:'cancelled'},{from:'19:00',to:'20:30',status:'neutral'}],
    Wednesday: [{from:'14:30',to:'15:30',status:'neutral'},{from:'21:00',to:'23:00',status:'booked'}],
    Thursday: [{from:'16:30',to:'17:30',status:'neutral'}],
    Friday: [{from:'23:00',to:'23:30',status:'neutral'}],
    Saturday: [], Sunday: []
  },
  appointments: [
    {id:1,name:'Susan Babin',phone:'+1 65658 95654',avatar:'https://randomuser.me/api/portraits/women/79.jpg',datetime:'26 May 2025 - 10:15 AM',status:'completed'},
    {id:2,name:'Carol Lam',phone:'+1 55654 56647',avatar:'https://randomuser.me/api/portraits/women/44.jpg',datetime:'25 May 2025 - 02:40 PM',status:'cancelled'},
    {id:3,name:'Marsha Noland',phone:'+1 65668 54558',avatar:'https://randomuser.me/api/portraits/women/39.jpg',datetime:'24 May 2025 - 11:30 AM',status:'booked'},
    {id:4,name:'John Elsass',phone:'47851263',avatar:'https://randomuser.me/api/portraits/men/51.jpg',datetime:'23 May 2025 - 04:10 PM',status:'booked'}
  ]
};

// Utilities
const el = sel => document.querySelector(sel);
const els = sel => Array.from(document.querySelectorAll(sel));
const formatTime = t => {
  // t like "11:30" -> "11:30 AM/PM" (12h)
  const [hh,mm] = t.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h = ((hh + 11) % 12) + 1;
  return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${ampm}`;
};

// Sidebar logic
const menuBtn = el('#menuBtn');
const sidebar = el('#sidebar');
const userSidebar = el('#userSidebar');
const overlay = el('#sidebarOverlay');

function openSidebar(){
  sidebar.classList.add('open');
  userSidebar.classList.remove('hidden');
  overlay.classList.remove('hidden');
  sidebar.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeSidebar(){
  sidebar.classList.remove('open');
  overlay.classList.add('hidden');
  setTimeout(()=>userSidebar.classList.add('hidden'),220);
  sidebar.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
menuBtn.addEventListener('click',openSidebar);
overlay.addEventListener('click',closeSidebar);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeSidebar(); closeAllModals(); } });

// Render slots for selected day
let currentDay = 'Monday';
const slotsArea = el('#slotsArea');
function renderSlots(day = currentDay){
  slotsArea.innerHTML = '';
  const arr = state.availability[day] || [];
  if(arr.length===0){
    const p = document.createElement('div'); p.className='empty-msg'; p.textContent='No slots set for '+day;
    slotsArea.appendChild(p);
    return;
  }
  arr.forEach((s,idx)=>{
    const btn = document.createElement('button');
    btn.className = `slot-btn ${s.status}`;
    btn.textContent = `${formatTime(s.from)} – ${formatTime(s.to)}`;
    btn.setAttribute('data-day',day);
    btn.setAttribute('data-index',idx);
    btn.addEventListener('click', onSlotClick);
    slotsArea.appendChild(btn);
  });
}

// cycle slot statuses on click (neutral -> booked -> cancelled -> completed -> neutral)
function onSlotClick(e){
  const day = e.currentTarget.getAttribute('data-day');
  const idx = +e.currentTarget.getAttribute('data-index');
  const s = state.availability[day][idx];
  const order = ['neutral','booked','cancelled','completed'];
  const next = order[(order.indexOf(s.status)+1)%order.length];
  s.status = next;
  renderSlots(day);
  renderAppointments(); // to reflect if any UI depends on availability
}

// Weekday tabs
els('.day-tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    els('.day-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentDay = btn.dataset.day;
    renderSlots(currentDay);
  });
});

// Initial render
renderSlots();

// Render appointments table
const appointmentsList = el('#appointments-list');
let currentStatusPopover = null;

function closeStatusPopover(){
  if(currentStatusPopover){
    currentStatusPopover.remove();
    currentStatusPopover = null;
    document.removeEventListener('click', handleDocClickClosePopover);
  }
}
function handleDocClickClosePopover(e){
  if(currentStatusPopover && !currentStatusPopover.contains(e.target)){
    closeStatusPopover();
  }
}

function openStatusPopover(button, appointmentId){
  closeStatusPopover();
  const rect = button.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'status-popover';
  pop.setAttribute('role','menu');
  pop.innerHTML = `
    <button class="status-option cancelled" data-status="cancelled">Cancelled</button>
    <button class="status-option booked" data-status="booked">Booked</button>
    <button class="status-option completed" data-status="completed">Completed</button>
  `;
  // position
  pop.style.position = 'absolute';
  pop.style.top = (window.scrollY + rect.bottom + 6) + 'px';
  pop.style.left = (window.scrollX + rect.left) + 'px';
  document.body.appendChild(pop);
  currentStatusPopover = pop;

  // stop clicks inside from bubbling to document
  pop.addEventListener('click', e=>e.stopPropagation());

  pop.querySelectorAll('.status-option').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const st = btn.getAttribute('data-status');
      const app = state.appointments.find(a=>a.id===appointmentId);
      if(app){
        app.status = st;
      }
      closeStatusPopover();
      renderAppointments();
    });
  });

  // close when clicking anywhere else
  setTimeout(()=>{ // setTimeout to avoid immediate close from the click that opened it
    document.addEventListener('click', handleDocClickClosePopover);
  }, 0);
}

function renderAppointments(){
  appointmentsList.innerHTML = '';
  state.appointments.forEach(app => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="patient-cell">
          <img class="patient-avatar" src="${app.avatar}" alt="${app.name}">
          <div class="patient-info"><span class="patient-name">${app.name}</span><span class="patient-phone">${app.phone}</span></div>
        </div>
      </td>
      <td>${app.datetime}</td>
      <td><span class="badge ${app.status==='booked'?'booked':app.status==='cancelled'?'cancelled':app.status==='completed'?'completed':'booked'}">${capitalize(app.status)}</span></td>
      <td>
        <div class="actions">
          <button class="action-btn status-btn" data-id="${app.id}" title="Edit status">⚙️</button>
          <button class="action-btn pres-btn" data-id="${app.id}" title="Add prescription">📝</button>
        </div>
      </td>
    `;
    appointmentsList.appendChild(tr);
  });

  // attach handlers
  els('.status-btn').forEach(b=>{
    b.addEventListener('click', e=>{
      e.stopPropagation();
      const id = +e.currentTarget.dataset.id;
      openStatusPopover(e.currentTarget, id);
    });
  });

  els('.pres-btn').forEach(b=>b.addEventListener('click', e=>{
    const id=+e.currentTarget.dataset.id;
    openPrescriptionInline(id);
  }));
}
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
renderAppointments();

// Appointment Modal logic
const modalOverlay = el('#modalOverlay');
const appointmentModal = el('#appointmentModal');
const appointmentModalBody = el('#appointmentModalBody');
const closeAppointmentModal = el('#closeAppointmentModal');
const closeAppBtn = el('#closeAppBtn');

function openAppointmentModal(id, showMore=false){
  const app = state.appointments.find(a=>a.id===id);
  if(!app) return;
  // main content: patient details + status area + buttons
  appointmentModalBody.innerHTML = `
    <div style="display:flex;gap:14px;align-items:center">
      <img src="${app.avatar}" style="width:72px;height:72px;border-radius:10px;object-fit:cover">
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
  // set current status
  const sel = el('#modalStatusSelect');
  sel.value = app.status;
  // handlers
  el('#saveStatusBtn').addEventListener('click', ()=>{
    app.status = sel.value;
    closeAppointmentModalAndRefresh();
  });
  el('#addPrescriptionInlineBtn').addEventListener('click', ()=>{
    openPrescriptionPanelInModal(app);
  });

  showModal(appointmentModal);
}

function closeAppointmentModalAndRefresh(){
  closeAllModals();
  renderAppointments();
}

closeAppointmentModal.addEventListener('click',closeAllModals);
closeAppBtn.addEventListener('click',closeAllModals);

// Generic modal controls
function showModal(modal){
  modalOverlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  document.body.style.overflow='hidden';
}
function closeAllModals(){
  modalOverlay.classList.add('hidden');
  appointmentModal.classList.add('hidden');
  editAvailabilityModal.classList.add('hidden');
  document.body.style.overflow='';
  closeStatusPopover();
}

// Prescription inline panel (inside appointment modal)
// This is the "professional" UI injected into the same modal and it does NOT show status controls while visible.
function openPrescriptionPanelInModal(app){
  const container = el('#prescriptionInlineContainer');
  // hide the status section while prescription panel is open
  const statusSection = el('#statusSection');
  if(statusSection) statusSection.style.display = 'none';

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

  // add med row helper
  function renderMedList(){
    const list = el('#medListInline');
    list.innerHTML = '';
    const meds = app._prescription?.meds || [];
    if(meds.length===0){
      list.innerHTML = '<div style="color:#6b8b90">No medications added yet.</div>';
      return;
    }
    meds.forEach((m, idx)=>{
      const row = document.createElement('div');
      row.className = 'med-row';
      row.innerHTML = `<div class="med-item"><strong>${m.name}</strong> — <span>${m.dose}</span></div>
                       <button class="btn btn-secondary med-del-btn" data-idx="${idx}">Delete</button>`;
      list.appendChild(row);
    });
    // attach delete
    list.querySelectorAll('.med-del-btn').forEach(b=>{
      b.addEventListener('click', e=>{
        const i = +e.currentTarget.dataset.idx;
        app._prescription.meds.splice(i,1);
        renderMedList();
      });
    });
  }

  // initialize prescription storage on appointment object (mock)
  if(!app._prescription) app._prescription = {notes:'', meds:[]};
  el('#prescriptionNotesInline').value = app._prescription.notes || '';
  renderMedList();

  // add med
  el('#addMedInlineBtn').addEventListener('click', ()=>{
    const name = el('#medNameInline').value.trim();
    const dose = el('#medDoseInline').value.trim();
    if(!name){ alert('Please enter medication name'); return; }
    app._prescription.meds.push({name,dose});
    el('#medNameInline').value=''; el('#medDoseInline').value='';
    renderMedList();
  });

  // save prescription
  el('#savePrescriptionInlineBtn').addEventListener('click', ()=>{
    const notes = el('#prescriptionNotesInline').value.trim();
    app._prescription.notes = notes;
    // In a real app: send to API
    alert('Prescription saved (mock).');
    // close prescription UI and show status again
    container.innerHTML = '';
    if(statusSection) statusSection.style.display = '';
    // optionally close modal:
    // closeAllModals();
  });

  // close prescription panel (closes whole modal so status won't re-appear unexpectedly)
  el('#closePrescriptionPanelBtn').addEventListener('click', ()=>{
    closeAllModals();
  });
}

// Open prescription UI directly (keeps it inline)
function openPrescriptionInline(id){
  // if modal not open, open modal first with appointment details
  const alreadyOpen = !appointmentModal.classList.contains('hidden');
  if(!alreadyOpen){
    openAppointmentModal(id);
    // wait for modal to render then open inline panel
    setTimeout(()=>{ const app = state.appointments.find(a=>a.id===id); openPrescriptionPanelInModal(app); }, 140);
    return;
  }
  // if modal is already open, just inject panel
  const app = state.appointments.find(a=>a.id===id);
  if(app) openPrescriptionPanelInModal(app);
}

// Edit Availability modal logic
const editAvailabilityBtn = el('#editAvailabilityBtn');
const editAvailabilityModal = el('#editAvailabilityModal');
const closeEditAvail = el('#closeEditAvail');
const saveAvailBtn = el('#saveAvailBtn');
const cancelAvailBtn = el('#cancelAvailBtn');
const editDays = el('#editDays');
const fromTime = el('#fromTime');
const toTime = el('#toTime');
const addSlotBtn = el('#addSlotBtn');
const currentSlots = el('#currentSlots');
const statusSelect = el('#statusSelect');
let editingDay = 'Monday';

function openEditAvail(){
  editAvailabilityModal.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow='hidden';
  // set default day active
  setActiveSmallDay(editingDay);
  renderCurrentSlots(editingDay);
}
function setActiveSmallDay(day){
  editingDay = day;
  els('.small-day').forEach(b=>b.classList.toggle('active', b.dataset.day===day));
}
editDays.addEventListener('click', e=>{
  if(e.target.classList.contains('small-day')){
    setActiveSmallDay(e.target.dataset.day);
    renderCurrentSlots(e.target.dataset.day);
  }
});
addSlotBtn.addEventListener('click', ()=>{
  const fm = fromTime.value; const to = toTime.value;
  if(!fm || !to){ alert('Please choose both times'); return; }
  const status = statusSelect.value;
  if(!state.availability[editingDay]) state.availability[editingDay]=[];
  state.availability[editingDay].push({from:fm,to:to,status});
  renderCurrentSlots(editingDay);
  if(editingDay === currentDay) renderSlots(currentDay);
});
function renderCurrentSlots(day){
  currentSlots.innerHTML = '';
  const arr = state.availability[day] || [];
  if(arr.length===0){
    currentSlots.innerHTML = '<div style="color:#6b8b90">No slots for '+day+'</div>';
    return;
  }
  arr.forEach((s,idx)=>{
    const d = document.createElement('div');
    d.className = 'slot-row';
    d.style.display='flex';
    d.style.alignItems='center';
    d.style.gap='8px';
    d.innerHTML = `<div style="padding:8px 10px;border-radius:8px;background:#f8fafb">${formatTime(s.from)} - ${formatTime(s.to)}</div>
                   <div style="flex:1">${capitalize(s.status)}</div>
                   <button class="btn btn-add" data-idx="${idx}" data-day="${day}">✎</button>
                   <button class="btn btn-add" data-del="${idx}" data-day="${day}">🗑</button>`;
    currentSlots.appendChild(d);
  });
  // attach delete/edit
  currentSlots.querySelectorAll('[data-del]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const idx = +e.currentTarget.dataset.del;
      const day = e.currentTarget.dataset.day;
      state.availability[day].splice(idx,1);
      renderCurrentSlots(day);
      if(day===currentDay) renderSlots(currentDay);
    });
  });
  currentSlots.querySelectorAll('[data-idx]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const idx = +e.currentTarget.dataset.idx;
      const day = e.currentTarget.dataset.day;
      const s = state.availability[day][idx];
      fromTime.value = s.from;
      toTime.value = s.to;
      statusSelect.value = s.status;
      // remove old and let user add again to edit
      state.availability[day].splice(idx,1);
      renderCurrentSlots(day);
      if(day===currentDay) renderSlots(currentDay);
    });
  });
}

// Apply All - copies current day slot to all days
const applyAllBtn = el('#applyAllBtn');
applyAllBtn.addEventListener('click', ()=>{
  const sample = state.availability[editingDay] || [];
  state.weekdays.forEach(d=>{
    state.availability[d] = [...(state.availability[d] || [])];
    // append sample clones
    sample.forEach(s=>state.availability[d].push({...s}));
  });
  alert('Applied current day slots to all days (mock).');
  renderCurrentSlots(editingDay);
  if(editingDay===currentDay) renderSlots(currentDay);
});

// Save & Cancel
saveAvailBtn.addEventListener('click', ()=>{
  closeAllModals();
  renderSlots(currentDay);
});
cancelAvailBtn.addEventListener('click', closeAllModals);
closeEditAvail.addEventListener('click', closeAllModals);
editAvailabilityBtn.addEventListener('click', openEditAvail);

// Modal overlay click closes modals
modalOverlay.addEventListener('click', closeAllModals);

// small helper to ensure availability shows neatly
function ensureAllDays(){
  state.weekdays.forEach(d=>{ if(!state.availability[d]) state.availability[d]=[]; });
}
ensureAllDays();

// small: prevent focus loss when overlay open
document.addEventListener('keydown', e=>{
  if(e.key==='Escape') closeAllModals();
});