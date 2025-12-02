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
          <button class="action-btn view-btn" data-id="${app.id}" title="View">👁️</button>
          <button class="action-btn pres-btn" data-id="${app.id}" title="Add prescription">📝</button>
          <button class="action-btn more-btn" data-id="${app.id}" title="More">⋯</button>
        </div>
      </td>
    `;
    appointmentsList.appendChild(tr);
  });

  // attach handlers
  els('.view-btn').forEach(b=>b.addEventListener('click', e=>{
    const id=+e.currentTarget.dataset.id;
    openAppointmentModal(id);
  }));
  els('.pres-btn').forEach(b=>b.addEventListener('click', e=>{
    const id=+e.currentTarget.dataset.id;
    openPrescriptionUI(id);
  }));
  els('.more-btn').forEach(b=>b.addEventListener('click', e=>{
    const id=+e.currentTarget.dataset.id;
    openAppointmentModal(id,true);
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
    <div>
      <label style="font-weight:700;margin-bottom:6px;display:block">Status</label>
      <select id="modalStatusSelect">
        <option value="booked">Booked</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
      <div style="margin-top:12px">
        <button class="btn btn-primary" id="saveStatusBtn">Save status</button>
        <button class="btn btn-secondary" id="togglePrescriptionBtn" style="margin-left:8px">Add prescription</button>
      </div>
      <div id="prescriptionArea" style="margin-top:12px;display:none">
        <textarea id="prescriptionText" rows="4" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6f1f4"></textarea>
        <div style="margin-top:8px"><button class="btn btn-primary" id="savePrescriptionBtn">Save Prescription</button></div>
      </div>
    </div>
  `;
  // set current status
  const sel = el('#modalStatusSelect');
  sel.value = app.status;
  // handlers
  el('#saveStatusBtn').addEventListener('click', ()=>{
    app.status = sel.value;
    closeAppointmentModalAndRefresh();
  });
  el('#togglePrescriptionBtn').addEventListener('click', ()=>{
    const area = el('#prescriptionArea');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
  });
  el('#savePrescriptionBtn')?.addEventListener('click', ()=>{
    const text = el('#prescriptionText').value.trim();
    if(text===''){ alert('Please enter prescription text.'); return; }
    // In real app: send to API. For now, fake
    alert('Prescription saved (mock): ' + text);
    el('#prescriptionText').value='';
    el('#prescriptionArea').style.display='none';
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

// Open prescription UI directly (small quick flow)
function openPrescriptionUI(id){
  const app = state.appointments.find(a=>a.id===id);
  if(!app) return;
  openAppointmentModal(id);
  // open prescription area after modal rendered
  setTimeout(()=>{ el('#togglePrescriptionBtn')?.click(); }, 150);
}

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