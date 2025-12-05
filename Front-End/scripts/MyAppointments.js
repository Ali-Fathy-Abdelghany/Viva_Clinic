/* ================= NAV/SIDEBAR LOGIC ================= */
/* const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle Sidebar
function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', toggleSidebar);

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to log out?")) {
            alert("Logged out!");
            // window.location.href = 'login.html';
        }
    });
} */
/* ================= DASHBOARD LOGIC ================= */


// --- 1. DATA MODEL & STATE ---
async function getAppointments(){
    
const data = await fetch(`${API_BASE}/appointments`, {
    method: 'GET',
    credentials: 'include'
});
const res = await data.json();
const appointments = res.data.appointments;
return {
    data: appointments.map(appt => {
        const dateObj = new Date(appt.AppointmentDate);
        const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return {
            id: appt.AppointmentID,
            dateObj,
            dateStr,
            doctor: `${appt.doctor.user.FirstName} ${appt.doctor.user.LastName}`,
            specialty: appt.doctor.specialty.Name,
            status: appt.Status,
            fee: appt.doctor.Fee,
            img: appt.doctor.user.Image_url
        };
    }),
    searchTerm: '',
    filterDate: null
}}
let state = { data: [], searchTerm: '', filterDate: null };


let currentCalendarDate = new Date(2025, 10, 1); 

// --- 2. FILTER & RENDER LOGIC ---
function updateView() {
    let processed = [...state.data];
    // Apply Search
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        processed = processed.filter(item => 
            item.doctor.toLowerCase().includes(term) || 
            item.specialty.toLowerCase().includes(term)
        );
    }
    

    // Apply Date Filter
    if (state.filterDate) {
        processed = processed.filter(item => 
            item.dateObj.getDate() === state.filterDate.day &&
            item.dateObj.getMonth() === state.filterDate.month &&
            item.dateObj.getFullYear() === state.filterDate.year
        );
        const dateObj = new Date(state.filterDate.year, state.filterDate.month, state.filterDate.day);
        
        const dateFilterText = document.getElementById('dateFilterText');
        const clearDateIcon = document.getElementById('clearDateIcon');
        
        if (dateFilterText) {
            dateFilterText.textContent = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            dateFilterText.classList.add('font-bold', 'text-[#3A8F86]');
        }
        if (clearDateIcon) clearDateIcon.classList.remove('hidden');
    } else {
        const dateFilterText = document.getElementById('dateFilterText');
        const clearDateIcon = document.getElementById('clearDateIcon');
        
        if (dateFilterText) {
            dateFilterText.textContent = "Show All Time";
            dateFilterText.classList.remove('font-bold', 'text-[#3A8F86]');
        }
        if (clearDateIcon) clearDateIcon.classList.add('hidden');
    }

    // Apply Sorting
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        const sortVal = sortSelect.value;
        if (sortVal === 'date-desc') {
            processed.sort((a, b) => b.dateObj - a.dateObj);
        } else if (sortVal === 'date-asc') {
            processed.sort((a, b) => a.dateObj - b.dateObj);
        } else if (sortVal === 'fee-desc') {
            processed.sort((a, b) => b.fee - a.fee);
        } else if (sortVal === 'fee-asc') {
            processed.sort((a, b) => a.fee - b.fee);
        }
    }
    
    renderTable(processed);
    renderCalendar(); 
}

function renderTable(data) {
    const tbody = document.getElementById('appointmentTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    if (emptyState) emptyState.classList.add('hidden');

    data.forEach(appt => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-50 hover:bg-gray-50 transition group';
        row.id = `row-${appt.id}`;

        let statusClasses = '';
        if(appt.status === 'Booked') statusClasses = 'border-blue-200 text-[#4B7BEC] bg-blue-50';
        else if(appt.status === 'Cancelled') statusClasses = 'border-red-200 text-[#FF6B6B] bg-white';
        else if(appt.status === 'Completed') statusClasses = 'border-green-200 text-[#26DE81] bg-white uppercase';
        else if(appt.status === 'Rescheduled') statusClasses = 'border-yellow-300 text-yellow-600 bg-yellow-50 capitalize';

        const showDots = appt.status === 'Booked'; 
        const avatarUrl = appt.img || 'images/default-avatar.png';
        row.innerHTML = `
            <td class="py-6 text-gray-600 font-medium">${appt.dateStr}</td>
            <td class="py-6">
                <div class="flex items-center gap-3">
                    <img src="${avatarUrl}" alt="Dr" class="w-10 h-10 rounded-full bg-gray-100">
                    <div>
                        <div class="font-bold text-gray-800">${appt.doctor}</div>
                        <div class="text-xs text-gray-500">${appt.specialty}</div>
                    </div>
                </div>
            </td>
            <td class="py-6">
                <div class="flex items-center gap-2">
                    <span class="px-4 py-1.5 rounded-md border ${statusClasses} font-medium text-xs">
                        ${appt.status}
                    </span>
                    ${showDots ? `
                    <button onclick="openModal(${appt.id})" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition cursor-pointer">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>` : ''}
                </div>
            </td>
            <td class="py-6 pl-4 font-bold text-gray-800">$${appt.fee}</td>
        `;
        tbody.appendChild(row);
    });
}

// --- 3. CALENDAR LOGIC ---
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthDisplay = document.getElementById('currentMonthDisplay');
    
    if (!grid || !monthDisplay) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    for (let i = firstDay; i > 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'text-gray-300 py-2';
        dayDiv.textContent = prevMonthDays - i + 1;
        grid.appendChild(dayDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        const isSelected = state.filterDate && 
                           state.filterDate.day === day && 
                           state.filterDate.month === month && 
                           state.filterDate.year === year;

        let baseClasses = 'py-2 flex justify-center items-center relative cursor-pointer hover:bg-gray-50 rounded-lg transition';
        if (isSelected) baseClasses += ' ring-2 ring-[#3A8F86] ring-offset-1 bg-teal-50 font-bold';
        dayDiv.className = baseClasses;
        
        const apptsOnDay = state.data.filter(a => 
            a.dateObj.getDate() === day && 
            a.dateObj.getMonth() === month && 
            a.dateObj.getFullYear() === year
        );

        if (apptsOnDay.length > 0) {
            const latestAppt = apptsOnDay[0];
            let bgClass = '';
            if (latestAppt.status === 'Completed') bgClass = 'bg-[#26DE81]';
            else if (latestAppt.status === 'Booked') bgClass = 'bg-[#4B7BEC]';
            else if (latestAppt.status === 'Cancelled') bgClass = 'bg-[#FF6B6B]';
            else if (latestAppt.status === 'Rescheduled') bgClass = 'bg-[#F7B731]';

            dayDiv.innerHTML = `<span class="w-8 h-8 flex items-center justify-center rounded text-white shadow-sm ${bgClass}">${day}</span>`;
        } else {
            dayDiv.textContent = day;
        }
        dayDiv.onclick = () => selectDate(day, month, year);
        grid.appendChild(dayDiv);
    }

    const totalSlots = grid.children.length;
    const remaining = 42 - totalSlots; 
    for (let i = 1; i <= remaining; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'text-gray-300 py-2';
        dayDiv.textContent = i;
        grid.appendChild(dayDiv);
    }
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

function selectDate(day, month, year) {
    state.filterDate = { day, month, year };
    updateView();
}

function resetDateFilter() {
    state.filterDate = null;
    updateView();
}

// --- 4. MODAL & ACTIONS ---
const modal = document.getElementById('actionModal');
const modalContent = document.getElementById('modalContent');
let currentTargetId = null;

function openModal(rowId) {
    currentTargetId = rowId;
    console.log(currentTargetId);
    
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            if (modalContent) {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }
        }, 10);
    }
}

function closeModal() {
    if (modalContent) {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
    }
    setTimeout(() => {
        if (modal) modal.classList.add('hidden');
        currentTargetId = null;
    }, 200);
}

function confirmAction() {
    const actionInput = document.querySelector('input[name="actionType"]:checked');
    if (!actionInput) return;
    
    const action = actionInput.value;
    if (action === 'delete' && currentTargetId) {
        fetch(`${API_BASE}/appointments/${currentTargetId}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then(async () => {
            state = await getAppointments();
            updateView();
        });
    } else if (action === 'edit') {
        window.location.href = 'book-appointment.html';
    }
    closeModal();
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    state = await getAppointments();
    updateView();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchTerm = e.target.value;
            updateView();
        });
    }
});
