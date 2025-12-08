const API_BASE_URL = window.API_BASE || 'http://localhost:3000/api';

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const filterBtn = document.getElementById('filterBtn');
const filterDropdown = document.getElementById('filterDropdown');
const searchInput = document.getElementById('doctorSearch');
const doctorsGrid = document.getElementById('doctorsGrid'); 

let currentFilter = 'name';
let allDoctors = []; 
let specialties = []; 


async function showData() {
    response = await fetch("http://localhost:3000/api/doctors")
    data = await response.json()
    console.log(data)
}
showData()

async function fetchSpecialties() {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/specialties`);
        if (!response.ok) throw new Error('Failed to fetch specialties');
        const data = await response.json();
        specialties = data?.data?.specialties || [];
    } catch (error) {
        console.error('Error loading specialties:', error);
    }
}

async function fetchDoctors() {
    doctorsGrid.innerHTML = '<h2>Loading Doctors...</h2>';
    try {
        const response = await fetch(`${API_BASE_URL}/doctors`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        const data = await response.json();
        
        allDoctors = data?.data?.doctors || [];
        applyFilters(); // render with current filter
    } catch (error) {
        console.error('Error fetching doctors:', error);
        doctorsGrid.innerHTML = '<h2>Failed to load doctors. Please try again.</h2>';
    }
}

function renderDoctors(doctors) {
    if (doctors.length === 0) {
        doctorsGrid.innerHTML = '<h2>No doctors found matching your criteria.</h2>';
        return;
    }

    doctorsGrid.innerHTML = ''; 

    doctors.forEach(doctor => {
        const name = `${doctor.user.FirstName} ${doctor.user.LastName}`;
        const specialtyName = doctor.specialty ? doctor.specialty.Name : 'General Practitioner';
        const price = doctor.Fee; 
        const photo =
          doctor.Image_url ||
          doctor.ImageUrl ||
          doctor.image_url ||
          doctor.imageUrl ||
          doctor.user?.Image_url ||
          doctor.user?.ImageUrl ||
          doctor.user?.image_url ||
          doctor.user?.imageUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=256`;

        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.addEventListener('click', () => {
            window.location.href = `doctor-profile.html?id=${doctor.DoctorID}`;
        });

        card.innerHTML = `
            <img src="${photo}" alt="Dr. ${name}" onerror="this.src='images/default-avatar.png'">
            <div class="doctor-details">
                <h3>Dr. ${name}</h3>
                <p class="specialty">${specialtyName}</p>
                <p class="price" data-price="${price}">Starts from: <strong>${price} EGP</strong></p>
            </div>
            <span class="arrow">></span>
        `;

        doctorsGrid.appendChild(card);
    });
}

function applyFilters() {
    const query = searchInput?.value?.trim().toLowerCase() || '';
    let filtered = [...allDoctors];

    if (currentFilter === 'name') {
        filtered = filtered.filter((doc) => {
            const fullName = `${doc.user?.FirstName || ''} ${doc.user?.LastName || ''}`.toLowerCase();
            return fullName.includes(query);
        });
    } else if (currentFilter === 'specialty') {
        filtered = filtered.filter((doc) => {
            const spec = doc.specialty?.Name?.toLowerCase() || '';
            return spec.includes(query);
        });
    } else if (currentFilter === 'price') {
        const cap = parseInt(query, 10);
        if (!Number.isNaN(cap)) {
            filtered = filtered.filter((doc) => typeof doc.Fee === 'number' && doc.Fee <= cap);
        }
        filtered.sort((a, b) => (a.Fee || 0) - (b.Fee || 0));
    }

    renderDoctors(filtered);
}

filterBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (filterDropdown.classList.contains('show') && 
        !filterDropdown.contains(e.target) && 
        e.target !== filterBtn) {
        filterDropdown.classList.remove('show');
    }
});

filterDropdown?.addEventListener('click', (e) => {
    e.stopPropagation();
});

document.querySelectorAll('.filter-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentFilter = item.dataset.type;
        filterDropdown.classList.remove('show');
        
        if (searchInput) searchInput.value = '';
        applyFilters();
    });
});

searchInput?.addEventListener('input', applyFilters);

document.addEventListener('DOMContentLoaded', () => {
    fetchSpecialties(); 
    fetchDoctors(); 
});
