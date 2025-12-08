const API_BASE_URL = window.API_BASE || "http://127.0.0.1:3000/api";

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");
const filterBtn = document.getElementById("filterBtn");
const filterDropdown = document.getElementById("filterDropdown");
const searchInput = document.getElementById("doctorSearch");
const doctorsGrid = document.getElementById("doctorsGrid");
const specialtyFilterItem = document.getElementById("specialtyFilterItem");

let currentFilter = "name";
let allDoctors = [];
let specialties = [];
let selectedSpecialtyId = null;

async function showData() {
    response = await fetch(`${API_BASE_URL}/doctors`);
    data = await response.json();
}
showData();

async function fetchSpecialties() {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/specialties`);
        if (!response.ok) {
            throw new Error("Failed to fetch specialties");
        }
        const data = await response.json();
        specialties = data.data.specialties;
    } catch (error) {
        console.error("Error loading specialties:", error);
    }
}

async function fetchDoctors(searchQuery = "", specialtyId = null) {
    doctorsGrid.innerHTML = "<h2>Loading Doctors...</h2>";

    try {
        const response = await fetch(`${API_BASE_URL}/doctors?`, {
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch doctors");
        }
        const data = await response.json();

        allDoctors = data.data?.doctors || data.data || [];
        updateDoctorCount();
        renderDoctors(allDoctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        doctorsGrid.innerHTML =
            "<h2>Failed to load doctors. Please try again.</h2>";
    }
}

function renderDoctors(doctors) {
    if (doctors.length === 0) {
        doctorsGrid.innerHTML =
            "<h2>No doctors found matching your criteria.</h2>";
        return;
    }

    doctorsGrid.innerHTML = "";

    doctors.forEach((doctor) => {
        const name = `${doctor.user.FirstName} ${doctor.user.LastName}`;
        const specialtyName = doctor.specialty
            ? doctor.specialty.Name
            : "General Practitioner";
        const price = doctor.Fee;
        const imageUrl =
            doctor.Image_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name
            )}&background=random&size=128`;
        const card = document.createElement("div");
        card.className = "doctor-card";
        card.dataset.name = name.toLowerCase();
        card.dataset.specialty = (specialtyName || "").toLowerCase();
        card.dataset.price = price;
        card.dataset.doctorId = doctor.UserID || doctor.DoctorID;

        card.addEventListener("click", () => {
            window.location.href = `doctor-profile.html?doctorId=${card.dataset.doctorId}`;
        });

        card.innerHTML = `
            <img src="${imageUrl}" alt="Dr. ${name}">
            <div class="doctor-details">
                <h3>Dr. ${name}</h3>
                <p class="specialty">${specialtyName}</p>
                <p class="price" data-price="${price}">Starts from: <strong>${price} EGP</strong></p>
            </div>
        `;

        doctorsGrid.appendChild(card);
    });
}

function applyFilters() {
    const query = searchInput?.value?.trim().toLowerCase() || "";
    let filtered = [...allDoctors];

    if (currentFilter === "name") {
        filtered = filtered.filter((doc) => {
            const fullName = `${doc.user?.FirstName || ""} ${
                doc.user?.LastName || ""
            }`.toLowerCase();
            return fullName.includes(query);
        });
    } else if (currentFilter === "specialty") {
        filtered = filtered.filter((doc) => {
            const spec = doc.specialty?.Name?.toLowerCase() || "";
            return spec.includes(query);
        });
    } else if (currentFilter === "price") {
        const cap = parseInt(query, 10);
        if (!Number.isNaN(cap)) {
            filtered = filtered.filter(
                (doc) => typeof doc.Fee === "number" && doc.Fee <= cap
            );
        }
        filtered.sort((a, b) => (a.Fee || 0) - (b.Fee || 0));
    }

    renderDoctors(filtered);
}

filterBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (
        filterDropdown.classList.contains("show") &&
        !filterDropdown.contains(e.target) &&
        e.target !== filterBtn
    ) {
        filterDropdown.classList.remove("show");
    }
});

filterDropdown?.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.querySelectorAll(".filter-item").forEach((item) => {
    item.addEventListener("click", () => {
        document
            .querySelectorAll(".filter-item")
            .forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        currentFilter = item.dataset.type;
        filterDropdown.classList.remove("show");
        filterAndSearch();
    });
});
function filterAndSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll(".doctor-card");

    cards.forEach((card) => {
        const name = card.dataset.name || "";
        const specialty = card.dataset.specialty || "";
        const price = parseInt(card.dataset.price) || 0;

        let shouldShow = false;

        if (currentFilter === "name") {
            shouldShow = name.includes(query) || query === "";
        } else if (currentFilter === "specialty") {
            shouldShow = specialty.includes(query) || query === "";
        } else if (currentFilter === "price") {
            shouldShow = !query || price <= parseInt(query);
        }

        card.style.display = shouldShow ? "flex" : "none";
    });
}

// Trigger search on input
searchInput.addEventListener("input", filterAndSearch);

// Check if user is admin and show admin controls
async function checkAdminRole() {
    try {
        if (localStorage.getItem("userRole") === "admin") {
            const totalDoctorsSpan =
                document.getElementById("totalDoctorsSpan");
            const adminControls = document.getElementById("adminControls");
            if (totalDoctorsSpan) totalDoctorsSpan.classList.remove("hidden");
            if (adminControls) adminControls.classList.remove("hidden");

            // Simplify navbar for admin (Home → admin dashboard)
            const navLinks = document.querySelector(".nav-links");
            if (navLinks) {
                navLinks.innerHTML = `<a href="admin-dashboard.html" class="nav-link">Dashboard</a>`;
            }

            // Swap sidebar to admin menu
            const sidebar = document.getElementById("sidebar");
            if (sidebar) {
                sidebar.innerHTML = `
                    <div class="sidebar-header">
                        <div class="admin-info">
                            <div class="admin-avatar">
                                <img src="images/default-avatar.png" alt="Profile">
                            </div>
                            <span class="admin-name">ADMIN</span>
                        </div>
                    </div>
                    <ul class="sidebar-menu">
                        <li onclick="window.location.href='admin-dashboard.html'">
                            <i class="fas fa-bar-chart"></i> Dashboard
                        </li>
                        <li onclick="window.location.href='Appointments-admin-view.html'">
                            <i class="fas fa-calendar-check"></i> Appointments
                        </li>
                        <li onclick="window.location.href='ExploreAllDoctors.html'">
                            <i class="fas fa-user-md"></i> Doctors
                        </li>
                        <li onclick="window.location.href='patients.html'">
                            <i class="fas fa-heartbeat"></i> Patients
                        </li>
                        <li onclick="window.location.href='register-doctor.html'">
                        <i class="fas fa-user-plus"></i> Add New Doctor
                    </li>
                    <li onclick="window.location.href='Add New Admin.html'">
                        <i class="fas fa-user-plus"></i> Add New Admin
                    </li>
                        <li id="logoutBtn" class="logout-item">
                            <i class="fas fa-sign-out-alt"></i> Log Out
                        </li>
                    </ul>
                `;

                // Rebind logout for newly injected sidebar
                const logoutBtn = document.getElementById("logoutBtn");
                if (logoutBtn) {
                    logoutBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof window.startLogoutFlow === "function") {
                            window.startLogoutFlow();
                        } else {
                            window.location.href = "login.html";
                        }
                    });
                }
            }

            // Ensure navbar profile does not go to patient profile
            const profilePic = document.getElementById("profilePic");
            if (profilePic) {
                profilePic.style.cursor = "pointer";
                profilePic.onclick = () => {
                    window.location.href = "admin-dashboard.html";
                };
            }
        }
    } catch (err) {
        console.error("Error checking admin role:", err);
    }
}

// Update doctor count
function updateDoctorCount() {
    const totalDoctorsCount = document.getElementById("totalDoctorsCount");
    if (totalDoctorsCount) {
        totalDoctorsCount.textContent = allDoctors.length;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchSpecialties();
    fetchDoctors();
    checkAdminRole();
});
