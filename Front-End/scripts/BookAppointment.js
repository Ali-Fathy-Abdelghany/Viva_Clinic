// --- GLOBAL STATE ---
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentActiveDate = new Date(); // التاريخ النشط حالياً (الذي يحدد بدء عرض الأيام الخمسة)
let currentDisplayDate = new Date(currentActiveDate.getFullYear(), currentActiveDate.getMonth(), 1); 

let isBookingConfirmed = false; 
let selectedSlotElement = null; 
let selectedDateTime = null; // لتخزين التاريخ والوقت المختارين

// --- DOM ELEMENTS ---
const monthDisplay = document.getElementById('current-month-display');
const calendarBody = document.getElementById('calendar-body');
const prevBtn = document.getElementById('prev-month-btn');
const nextBtn = document.getElementById('next-month-btn');
const dayTabsContainer = document.getElementById('day-tabs'); 
const availabilityGrid = document.getElementById('availability-grid'); 
const submitBtn = document.getElementById('submit-btn');
const successModal = document.getElementById('success-modal');


// ===================================================================================
// ========================= DYNAMIC AVAILABILITY LOGIC (NEW GRID) ===================
// ===================================================================================

/**
 * محاكاة لجلب بيانات التوفر من API (يجب استبدالها بطلب HTTP حقيقي)
 */
function getAvailabilityForDay(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayKey = date.getDay(); // 0 (Sun) to 6 (Sat)
    
    // محاكاة لأوقات مختلفة بناءً على يوم الأسبوع
    const availabilityData = {
        // الأحد = 0، السبت = 6
        0: [], 6: [], 
        1: [ // Monday
            { time: "11:30 AM - 12:30 PM", status: "available" }, // تم تغييرها إلى متوفر
            { time: "06:00 PM - 07:30 PM", status: "available" }
        ],
        2: [ // Tuesday
            { time: "12:30 PM - 01:30 PM", status: "available" },
            { time: "07:00 PM - 08:30 PM", status: "available" }
        ],
        3: [ // Wednesday
            { time: "02:30 PM - 03:30 PM", status: "available" },
            { time: "09:00 PM - 11:00 PM", status: "available" }
        ],
        4: [ // Thursday
            { time: "03:30 PM - 04:30 PM", status: "available" }
        ],
        5: [ // Friday
            { time: "04:30 PM - 05:30 PM", status: "available" },
            { time: "11:00 PM - 11:30 PM", status: "available" }
        ],
    };

    return {
        dayName: dayName,
        slots: availabilityData[dayKey] || []
    };
}


/**
 * دالة لتحديد الأيام الخمسة القادمة وعرضها في شكل شبكة
 */
function renderAvailabilityGrid(startDate) {
    availabilityGrid.innerHTML = '';
    dayTabsContainer.innerHTML = ''; 
    selectedSlotElement = null; // إعادة تعيين التحديد عند تغيير اليوم
    selectedDateTime = null;

    // لضمان عرض 5 أيام متتالية فقط (Mon-Fri) أو 5 أيام من تاريخ البدء
    for (let i = 0; i < 5; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const data = getAvailabilityForDay(date);
        
        // 1. إنشاء زر اليوم في التبويبات (Tabs)
        const dayTab = document.createElement('button');
        dayTab.classList.add('day-tab');
        dayTab.textContent = data.dayName;
        // إضافة فئة active-day على اليوم المختار في التقويم
        if (i === 0) dayTab.classList.add('active-day'); 
        dayTabsContainer.appendChild(dayTab);

        // 2. إنشاء عمود الأوقات (Slots Column)
        const dayColumn = document.createElement('div');
        dayColumn.classList.add('day-column-grid-content'); 
        
        // إدخال الأزرار الزمنية في العمود
        if (data.slots.length === 0) {
            const msg = document.createElement('p');
            msg.textContent = date.getDay() === 0 || date.getDay() === 6 ? "Weekend" : "Fully Booked";
            msg.style.color = '#ccc';
            msg.style.padding = '10px 0';
            dayColumn.appendChild(msg);
        } else {
            data.slots.forEach(slot => {
                const slotElement = document.createElement('button');
                slotElement.classList.add('time-slot');
                slotElement.textContent = slot.time;
                
                // تخزين بيانات التاريخ الكاملة والوقت
                slotElement.setAttribute('data-date', date.toISOString().split('T')[0]); 
                slotElement.setAttribute('data-time-range', slot.time); 

                let status = slot.status === 'booked' ? 'booked' : 'available';

                // تطبيق الفئات CSS
                if (status === 'booked') {
                    slotElement.classList.add('booked-red');
                    slotElement.setAttribute('data-status', 'booked');
                } else {
                    slotElement.classList.add('available');
                    slotElement.setAttribute('data-status', 'available');
                    slotElement.addEventListener('click', handleSlotClick);
                }
                
                dayColumn.appendChild(slotElement);
            });
        }
        availabilityGrid.appendChild(dayColumn);
    }
}

/**
 * دالة لمعالجة النقر على الفتحات الزمنية
 */
function handleSlotClick(event) {
    const clickedSlot = event.currentTarget;
    const status = clickedSlot.getAttribute('data-status');

    if (isBookingConfirmed) {
        alert("You have already booked an appointment. Submission is blocked.");
        return;
    }
    if (status === 'booked') return;

    // 1. إلغاء تحديد الفتحة الزمنية السابقة
    if (selectedSlotElement && selectedSlotElement !== clickedSlot) {
        selectedSlotElement.classList.remove('selected-teal');
        selectedSlotElement.classList.add('available');
        selectedSlotElement.setAttribute('data-status', 'available');
    }

    // 2. تحديد الفتحة الزمنية الجديدة
    if (status === 'available') {
        clickedSlot.classList.remove('available'); 
        clickedSlot.classList.add('selected-teal');
        clickedSlot.setAttribute('data-status', 'selected');
        selectedSlotElement = clickedSlot;
        
        // حفظ التاريخ والوقت المختارين عالميًا
        selectedDateTime = {
            date: clickedSlot.getAttribute('data-date'),
            time: clickedSlot.getAttribute('data-time-range')
        };
    } else if (status === 'selected') {
        // إلغاء تحديد
        clickedSlot.classList.remove('selected-teal');
        clickedSlot.classList.add('available');
        clickedSlot.setAttribute('data-status', 'available');
        selectedSlotElement = null;
        selectedDateTime = null;
    }
}
// ===================================================================================


// --- CALENDAR FUNCTIONS ---
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
        const dateCell = document.createElement('div');
        dateCell.classList.add('date-cell');
        dateCell.textContent = day;
        dateCell.dataset.date = `${year}-${month + 1}-${day}`;
        
        // تحديد اليوم النشط (Selected Day)
        if (currentActiveDate && year === currentActiveDate.getFullYear() && 
            month === currentActiveDate.getMonth() && 
            day === currentActiveDate.getDate()) {
            dateCell.classList.add('selected-day');
        }
        
        // ربط النقر بتحديث التوفر
        dateCell.addEventListener('click', (e) => {
            // إزالة التحديد من اليوم القديم
            document.querySelectorAll('.calendar-grid .selected-day').forEach(cell => {
                cell.classList.remove('selected-day');
            });
            // تحديد اليوم الجديد
            e.target.classList.add('selected-day');
            
            // تحديث التاريخ الفعال
            currentActiveDate = new Date(year, month, day);
            
            // **NEW**: عرض شبكة المواعيد بدءًا من التاريخ المختار
            renderAvailabilityGrid(currentActiveDate);
        });

        calendarBody.appendChild(dateCell);
    }
    
    // Next Month's Days (Faded)
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

// --- SUBMIT BUTTON LOGIC ---
submitBtn.addEventListener('click', () => {
    
    if (isBookingConfirmed) {
        alert("You have already booked an appointment. Submission is blocked.");
        return;
    }
    
    // البحث عن الموعد المختار في الحاوية الديناميكية
    const selectedSlot = document.querySelector('.time-slot[data-status="selected"]');
    
    if (!selectedSlot || !selectedDateTime) {
        alert("Please select a time slot first.");
        return;
    }
    
    // 1. Permanently update the selected slot
    selectedSlot.classList.remove('selected-teal', 'available'); 
    selectedSlot.classList.add('booked-permanent'); 
    selectedSlot.setAttribute('data-status', 'booked'); 
    
    // 2. Lock the global state immediately after successful pseudo-booking
    isBookingConfirmed = true; 

    // 3. Show the success modal
    successModal.style.display = 'flex';
});

// Hide the modal 
document.querySelector('.modal-button').addEventListener('click', () => {
    successModal.style.display = 'none';
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    
    // عرض شبكة المواعيد بدءًا من اليوم النشط عند تحميل الصفحة
    renderAvailabilityGrid(currentActiveDate);
});

prevBtn.addEventListener('click', () => changeMonth(-1));
nextBtn.addEventListener('click', () => changeMonth(1));
