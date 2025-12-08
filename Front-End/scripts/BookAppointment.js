const API_BASE_URL = 'http://localhost:3000/api'; 

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentActiveDate = new Date(); 
let currentDisplayDate = new Date(currentActiveDate.getFullYear(), currentActiveDate.getMonth(), 1); 

let isBookingConfirmed = false; 
let selectedSlotElement = null; 
let selectedDateTime = null; 
let DOCTOR_ID = null; 


const monthDisplay = document.getElementById('current-month-display');
const calendarBody = document.getElementById('calendar-body');
const prevBtn = document.getElementById('prev-month-btn');
const nextBtn = document.getElementById('next-month-btn');
const dayTabsContainer = document.getElementById('day-tabs'); 
const availabilityGrid = document.getElementById('availability-grid'); 
const submitBtn = document.getElementById('submit-btn');
const successModal = document.getElementById('success-modal');
const backLink = document.getElementById('back-link');


function getDoctorIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('doctorId');
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


async function fetchDoctorAvailability(dateString) {
    if (!DOCTOR_ID) {
        console.error("Doctor ID is missing for availability fetch.");
        return [];
    }

    try {
        const url = `${API_BASE_URL}/doctors/${DOCTOR_ID}/availability?date=${dateString}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch availability. Status: ${response.status}`);
        }

        const data = await response.json();
        
        return data.data.availableSlots || [];
    } catch (error) {
        console.error('Error fetching doctor availability:', error);
        alert("Error fetching availability. Please try again later.");
        return [];
    }
}


async function submitBooking() {
    if (!DOCTOR_ID || !selectedDateTime) {
        alert("Please select a valid time slot before submitting.");
        return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 
    if (!token) {
        alert("Please log in first to book an appointment.");
        window.location.href = "login.html";
        return;
    }

   
    const [datePart, timePart] = selectedDateTime.split('T');

    const bookingData = {
        DoctorID: DOCTOR_ID,
        AppointmentDate: datePart,
        StartTime: timePart.substring(0, 5) // Send only HH:MM 
    };

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Booking failed. Status: ${response.status}`);
        }
        
        // Success actions:
        if(selectedSlotElement) {
            selectedSlotElement.classList.remove('selected-teal', 'available'); 
            selectedSlotElement.classList.add('booked-permanent'); 
            selectedSlotElement.setAttribute('data-status', 'booked'); 
        }

        isBookingConfirmed = true; 
        successModal.style.display = 'flex';

    } catch (error) {
        console.error('Booking submission error:', error);
        alert(`Failed to book appointment: ${error.message}`);
    }
}


function renderCalendar() { 
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    
    monthDisplay.textContent = `${monthNames[month]} ${year}`;
    calendarBody.innerHTML = '';
    
    // Day Labels
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
    
    // Previous Month's Days (Faded)
    for (let i = firstDayOfMonth; i > 0; i--) {
        const dateCell = document.createElement('div');
        dateCell.classList.add('date-cell', 'faded');
        dateCell.textContent = daysInPrevMonth - i + 1;
        calendarBody.appendChild(dateCell);
    }

    // Current Month's Days (Main Logic)
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDate(date);

        const dateCell = document.createElement('div');
        dateCell.classList.add('date-cell');
        dateCell.textContent = day;
        dateCell.dataset.date = dateString;
        
        //  (Selected Day)
        if (currentActiveDate && year === currentActiveDate.getFullYear() && 
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
            
            
            renderDayTabs(); 
        });

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

/**
 * Renders the 5-day view tabs and calls renderAvailabilityGrid for the first day.
 */
function renderDayTabs() {
    dayTabsContainer.innerHTML = '';
    
    // Start from the current active date
    const startDate = new Date(currentActiveDate);

    // Limit to 5 days from the active date
    for (let i = 0; i < 5; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateString = formatDate(date);
        
        // Mark the very first tab as active by default
        const tabClass = i === 0 ? 'day-tab active' : 'day-tab';

        const tab = document.createElement('div');
        tab.className = tabClass;
        tab.dataset.date = dateString;
        tab.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="day-number">${date.getDate()}</div>
        `;
        dayTabsContainer.appendChild(tab);

        // Render availability for the first active tab immediately
        if (i === 0) {
            renderAvailabilityGrid(dateString);
        }
    }
}



async function renderAvailabilityGrid(dateString) {
    // Reset selection state
    selectedSlotElement = null;
    selectedDateTime = null;
    submitBtn.disabled = true;

    if (isBookingConfirmed) {
        availabilityGrid.innerHTML = '<p class="booking-confirmed-message">Booking confirmed. Reload to start a new booking.</p>';
        return;
    }
    
    availabilityGrid.innerHTML = '<div class="loading-spinner"></div>'; 

    const slots = await fetchDoctorAvailability(dateString);
    
    availabilityGrid.innerHTML = ''; 

    if (slots.length === 0) {
        availabilityGrid.innerHTML = '<p class="no-availability">No slots available for this date.</p>';
        return;
    }

    slots.forEach(slot => { 
        const { startTime, endTime } = slot;
        
        const timeRangeDisplay = `${startTime} - ${endTime}`; 
        
       
        const dateTimeString = `${dateString}T${startTime}:00`; 
        
        const slotHTML = `
            <div 
                class="time-slot available" 
                data-time-range="${timeRangeDisplay}" 
                data-date-time="${dateTimeString}" 
                data-status="available"
            >
                ${timeRangeDisplay} 
            </div>
        `;
        availabilityGrid.insertAdjacentHTML('beforeend', slotHTML);
    });

    
    attachSlotListeners();
}


function attachSlotListeners() {
    document.querySelectorAll('.time-slot.available').forEach(slot => {
        slot.addEventListener('click', handleSlotClick);
    });
}


function handleSlotClick(event) {
    const clickedSlot = event.currentTarget;
    const status = clickedSlot.getAttribute('data-status');

    if (isBookingConfirmed) {
        alert("You have already booked an appointment. Submission is blocked.");
        return;
    }
    if (status === 'booked') return;

    if (selectedSlotElement && selectedSlotElement !== clickedSlot) {
        selectedSlotElement.classList.remove('selected-teal');
        selectedSlotElement.classList.add('available');
        selectedSlotElement.setAttribute('data-status', 'available');
    }

    
    if (status === 'available') {
        clickedSlot.classList.remove('available'); 
        clickedSlot.classList.add('selected-teal');
        clickedSlot.setAttribute('data-status', 'selected');
        selectedSlotElement = clickedSlot;
        
        
        selectedDateTime = clickedSlot.getAttribute('data-date-time');
        submitBtn.disabled = false;

    } else if (status === 'selected') {
       
        clickedSlot.classList.remove('selected-teal');
        clickedSlot.classList.add('available');
        clickedSlot.setAttribute('data-status', 'available');
        selectedSlotElement = null;
        selectedDateTime = null;
        submitBtn.disabled = true;
    }
}




prevBtn.addEventListener('click', () => changeMonth(-1));
nextBtn.addEventListener('click', () => changeMonth(1));


dayTabsContainer.addEventListener('click', (e) => {
    const dayTab = e.target.closest('.day-tab');
    if (dayTab && !dayTab.classList.contains('active')) {
        // Update active tab class
        document.querySelector('.day-tab.active')?.classList.remove('active');
        dayTab.classList.add('active');

        // Render the new availability grid
        const dateString = dayTab.getAttribute('data-date');
        renderAvailabilityGrid(dateString);
    }
});



submitBtn.addEventListener('click', submitBooking);

// Hide the modal 
document.querySelector('.modal-button').addEventListener('click', () => {
    successModal.style.display = 'none';
    window.location.href='MyAppointments.html'; // Navigate to appointments after closing modal
});



document.addEventListener('DOMContentLoaded', () => {
    DOCTOR_ID = getDoctorIdFromUrl();
    if (backLink) {
        backLink.href = DOCTOR_ID ? `doctor-profile.html?id=${DOCTOR_ID}` : 'ExploreAllDoctors.html';
    }
    if (!DOCTOR_ID) {
       
        console.warn("Doctor ID is missing in URL. Using default for testing: 2");
        DOCTOR_ID = '2'; 
    }
    
    renderCalendar();
    renderAvailabilityGrid(formatDate(currentActiveDate));
    renderDayTabs();
    
});
