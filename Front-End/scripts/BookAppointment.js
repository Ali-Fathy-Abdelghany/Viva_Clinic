
// --- GLOBAL STATE ---
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentActiveDate = new Date(2025, 10, 5); 
let currentDisplayDate = new Date(currentActiveDate.getFullYear(), currentActiveDate.getMonth(), 1);

// NEW: Variable to track if the patient has successfully submitted an appointment
let isBookingConfirmed = false; 

// --- DOM ELEMENTS ---
const monthDisplay = document.getElementById('current-month-display');
const calendarBody = document.getElementById('calendar-body');
const prevBtn = document.getElementById('prev-month-btn');
const nextBtn = document.getElementById('next-month-btn');
const timeSlots = document.querySelectorAll('.time-slot');
const submitBtn = document.getElementById('submit-btn');
const successModal = document.getElementById('success-modal');

// --- CALENDAR FUNCTIONS ---
function renderCalendar() { 
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    
    monthDisplay.textContent = `${monthNames[month]} ${year}`;
    calendarBody.innerHTML = '';
    
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayLabels.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.classList.add('day-label');
        dayLabel.textContent = day;
        calendarBody.appendChild(dayLabel);
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    for (let i = firstDayOfMonth; i > 0; i--) {
        const dateCell = document.createElement('div');
        dateCell.classList.add('date-cell', 'faded');
        dateCell.textContent = daysInPrevMonth - i + 1;
        calendarBody.appendChild(dateCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateCell = document.createElement('div');
        dateCell.classList.add('date-cell');
        dateCell.textContent = day;
        dateCell.dataset.date = `${year}-${month + 1}-${day}`;

        if (year === currentActiveDate.getFullYear() && 
            month === currentActiveDate.getMonth() && 
            day === currentActiveDate.getDate()) {
            dateCell.classList.add('selected-day');
        }
        
        dateCell.addEventListener('click', (e) => {
            document.querySelectorAll('.calendar-grid .selected-day').forEach(cell => {
                cell.classList.remove('selected-day');
            });
            e.target.classList.add('selected-day');
            currentActiveDate = new Date(year, month, day);
        });

        calendarBody.appendChild(dateCell);
    }
    
    const totalCells = firstDayOfMonth + daysInMonth;
    const remainingCells = 42 - totalCells;

    for (let i = 1; i <= remainingCells; i++) {
        const dateCell = document.createElement('div');
        dateCell.classList.add('date-cell', 'faded');
        dateCell.textContent = i;
        calendarBody.appendChild(dateCell);
    }
}

function changeMonth(monthChange) {
    currentDisplayDate = new Date(
        currentDisplayDate.getFullYear(), 
        currentDisplayDate.getMonth() + monthChange, 
        1
    );
    renderCalendar();
}

// --- APPOINTMENT CLICK HANDLER (MODIFIED) ---
timeSlots.forEach(slot => {
    slot.addEventListener('click', (event) => {
        const clickedSlot = event.currentTarget;
        let status = clickedSlot.getAttribute('data-status');

        // NEW CHECK: If booking is already confirmed, block any new selection attempt
        if (isBookingConfirmed) {
            alert("You have already booked an appointment. You cannot book more than one.");
            return;
        }

        if (status === 'booked') {
            alert("Sorry, that appointment is already booked. Please choose another time.");
            return;
        }

        if (status === 'available' || status === 'selected') {
            
            // Logic to enforce single selection: Clear previous selection
            document.querySelectorAll('.time-slot').forEach(otherSlot => {
                otherSlot.classList.remove('selected-teal');
                if (otherSlot.getAttribute('data-status') !== 'booked') {
                    otherSlot.classList.add('available');
                    otherSlot.setAttribute('data-status', 'available');
                }
            });

            // Select the new slot
            if (status === 'available') {
                clickedSlot.classList.remove('available'); 
                clickedSlot.classList.add('selected-teal');
                clickedSlot.setAttribute('data-status', 'selected');
            }
        }
    });
});

// --- SUBMIT BUTTON LOGIC (MODIFIED) ---
submitBtn.addEventListener('click', () => {
    
    // Final check before submission
    if (isBookingConfirmed) {
        alert("You have already booked an appointment. Submission is blocked.");
        return;
    }
    
    const selectedSlot = document.querySelector('.time-slot[data-status="selected"]');
    
    if (!selectedSlot) {
        alert("Please select a time slot first.");
        return;
    }

    // 1. Permanently update the selected slot
    selectedSlot.classList.remove('selected-teal', 'available'); 
    selectedSlot.classList.add('booked-permanent'); 
    selectedSlot.setAttribute('data-status', 'booked'); 

    // NEW: Lock the global state immediately after successful pseudo-booking
    isBookingConfirmed = true; 

    // 2. Show the success modal
    successModal.style.display = 'flex';
});

// Hide the modal 
document.querySelector('.modal-button').addEventListener('click', () => {
    successModal.style.display = 'none';
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    
    timeSlots.forEach(slot => {
        const status = slot.getAttribute('data-status');
        if (status === 'booked') {
            slot.classList.add('booked-red');
        } else if (status === 'available') {
            slot.classList.add('available');
        }
    });
});

prevBtn.addEventListener('click', () => changeMonth(-1));
nextBtn.addEventListener('click', () => changeMonth(1));
