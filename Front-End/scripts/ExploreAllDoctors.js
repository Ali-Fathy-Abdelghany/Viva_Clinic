const API_BASE_URL = 'http://localhost:3000/api';

const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const filterBtn = document.getElementById('filterBtn');
const filterDropdown = document.getElementById('filterDropdown');
const searchInput = document.getElementById('doctorSearch');
const doctorsGrid = document.getElementById('doctorsGrid'); 
const specialtyFilterItem = document.getElementById('specialtyFilterItem'); 

let currentFilter = 'name';
let allDoctors = []; 
let specialties = []; 
let selectedSpecialtyId = null; 

async function showData() {
    response = await fetch("http://localhost:3000/api/doctors")
    data = await response.json()
    console.log(data)
}
showData()

async function fetchSpecialties() {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/specialties`);
        if (!response.ok) {
            throw new Error('Failed to fetch specialties');
        }
        const data = await response.json();
        specialties = data.data.specialties; 
        console.log('Specialties loaded:', specialties);
        
    } catch (error) {
        console.error('Error loading specialties:', error);
    }
}



async function fetchDoctors(searchQuery = '', specialtyId = null) {
    doctorsGrid.innerHTML = '<h2>Loading Doctors...</h2>';
    const params = new URLSearchParams();

    if (specialtyId) {
        params.append('specialtyId', specialtyId);
    }
    
    if (searchQuery && (currentFilter === 'name' || currentFilter === 'specialty')) {
        params.append('search', searchQuery);
    }
    
    const url = `${API_BASE_URL}/doctors?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        
        allDoctors = data.data.doctors;
        renderDoctors(allDoctors);
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

        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.addEventListener('click', () => {
            window.location.href = `doctor-profile.html?id=${doctor.DoctorID}`;
        });

        card.innerHTML = `
            <img src="images/doctor.png" alt="Dr. ${name}">
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
        
        searchInput.value = '';
        selectedSpecialtyId = null; 
        if (currentFilter === 'price') {
             fetchDoctors(''); 
        } else {
             fetchDoctors();
        }
    });
});

function searchAndFilter() {
    const query = searchInput.value.trim();

    if (currentFilter === 'name' || currentFilter === 'specialty') {
        fetchDoctors(query);
    } else if (currentFilter === 'price') {
        const priceQuery = parseInt(query);

        let filteredAndSortedDoctors = [...allDoctors];

        if (query && !isNaN(priceQuery)) {
            filteredAndSortedDoctors = filteredAndSortedDoctors.filter(doctor => {
                const price = doctor.Fee; 
                return price <= priceQuery;
            });
        }
        
        filteredAndSortedDoctors.sort((a, b) => {
            const priceA = a.Fee;
            const priceB = b.Fee;
            return priceA - priceB;
        });

        renderDoctors(filteredAndSortedDoctors);
    }
}

searchInput?.addEventListener('input', searchAndFilter);

document.addEventListener('DOMContentLoaded', () => {
    fetchSpecialties(); 
    fetchDoctors(); 
});
