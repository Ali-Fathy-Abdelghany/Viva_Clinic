// ===== Mock Data =====
const state = {
  weekdays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
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

// ===== Helpers =====
const el = sel => document.querySelector(sel);
const els = sel => Array.from(document.querySelectorAll(sel));

function formatTime(t){
  const [hh,mm] = t.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h = ((hh + 11) % 12) + 1;
  return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${ampm}`;
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// ===== Render Slots =====
let currentDay = 'Monday';
const slotsArea = el('#slotsArea');

function renderSlots(day = currentDay){
  slotsArea.innerHTML = '';
  const arr = state.availability[day] || [];
  if(arr.length===0){
    const p = document.createElement('div'); 
    p.className='empty-msg'; 
    p.textContent='No slots for '+day;
    slotsArea.appendChild(p);
    return;
  }
  arr.forEach(s=>{
    const btn = document.createElement('button');
    btn.className = `slot-btn ${s.status}`;
    btn.textContent = `${formatTime(s.from)} – ${formatTime(s.to)} (${capitalize(s.status)})`;
    slotsArea.appendChild(btn);
  });
}

// ===== Weekday Tabs =====
els('.day-tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    els('.day-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentDay = btn.dataset.day;
    renderSlots(currentDay);
  });
});

// ===== Render Appointments =====
const appointmentsList = el('#appointments-list');

function renderAppointments(){
  appointmentsList.innerHTML = '';
  state.appointments.forEach(app => {
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
    `;
    appointmentsList.appendChild(tr);
  });
}

// ===== Initial Render =====
renderSlots();
renderAppointments();
