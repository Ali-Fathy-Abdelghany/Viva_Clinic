// patient-filter.js
/* 
  role-sidebar.js
  Dynamically changes the sidebar depending on the user's role.

  Role must be stored as:
      localStorage.setItem("userRole", "admin");
      location.reload();
      or
      localStorage.setItem("userRole", "doctor");
      location.reload();
*/

document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const filterIcon = document.getElementById("filterIcon");
    const filterMenu = document.getElementById("filterMenu");
    const searchInput = document.getElementById("searchInput");
    const role = localStorage.getItem("userRole");
    const sidebar = document.getElementById("sidebar");
    const navbar = document.getElementById("navbar");
    const menuBtn = document.getElementById("menuBtn"); // Hamburger icon
    const profilePic = document.getElementById("profilePic"); // Navbar profile picture
    const navLink = document.getElementById("nav-link");

    // // ==================== 1. Sidebar Open/Close Logic ====================
    // if (menuBtn && sidebar) {
    //   // Create overlay if it doesn't exist (dark background when sidebar is open)
    //   let overlay = document.getElementById("sidebarOverlay");
    //   if (!overlay) {
    //     overlay = document.createElement("div");
    //     overlay.id = "sidebarOverlay";
    //     overlay.className = "overlay";
    //     document.body.appendChild(overlay);
    //   }

    //   const openSidebar = () => {
    //     sidebar.classList.add("active");
    //     overlay.style.display = "block";
    //     document.body.style.overflow = "hidden"; // Prevent background scrolling
    //   };

    //   const closeSidebar = () => {
    //     sidebar.classList.remove("active");
    //     overlay.style.display = "none";
    //     document.body.style.overflow = "auto";
    //   };

    //   // Toggle sidebar when clicking the hamburger menu
    //   menuBtn.addEventListener("click", (e) => {
    //     e.stopPropagation();
    //     sidebar.classList.contains("active") ? closeSidebar() : openSidebar();
    //   });

    //   // Close sidebar when clicking on the overlay
    //   overlay.addEventListener("click", closeSidebar);

    //   // Close sidebar when clicking outside of it
    //   document.addEventListener("click", (e) => {
    //     if (
    //       sidebar.classList.contains("active") &&
    //       !sidebar.contains(e.target) &&
    //       !menuBtn.contains(e.target)
    //     ) {
    //       closeSidebar();
    //     }
    //   });

    //   // Close sidebar with Escape key
    //   document.addEventListener("keydown", (e) => {
    //     if (e.key === "Escape" && sidebar.classList.contains("active")) {
    //       closeSidebar();
    //     }
    //   });
    // }
    // ==================== 2. Role-Based Sidebar Content ====================

    if (!sidebar) return;

    if (role === "doctor") {
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="admin-info">
                    <div class="admin-avatar">
                        <img src="doctor.png" id="sidebar-profile-img" class="profile-pic" alt="Dr. Sara Ali">                    </div>
                        <span class="admin-name" id="sidebar-user-name">Dr. Sara Ali</span>
                </div>
            </div>

            <ul class="sidebar-menu">

                <li>
                    <a href="doctor-profile.html" class="active">
                        <i class="material-icons-round">person</i>
                        <span>My Profile</span>
                    </a>
                </li>

                <li>
                    <a href="doctor_Appointment.html">
                        <i class="material-icons-round">event_available</i>
                        <span>Appointments</span>
                    </a>
                </li>

                <li>
                    <a href="Patients.html">
                        <i class="material-icons-round">groups</i>
                        <span>My Patients</span>
                    </a>
                </li>


                <li>
                    <a href="settings.html">
                        <i class="material-icons-round">settings</i>
                        <span>Settings</span>
                    </a>
                </li>

                <li>
                    <a href="login.html" class="logout-item">
                        <i class="material-icons-round">logout</i>
                        <span>Log out</span>
                    </a>
                </li>

            </ul>
        `;

        // ==================== NEW: Click to open doctor profile ====================
        // Sidebar image
        const newSidebarImg = document.getElementById("sidebar-profile-img");
        const newUserName = document.getElementById("sidebar-user-name");
        if (newSidebarImg) {
            newSidebarImg.style.cursor = "pointer";
            newSidebarImg.addEventListener("click", () => {
                window.location.href = "doctor-profile.html";
            });
            newUserName.style.cursor = "pointer";
            newUserName.addEventListener("click", () => {
                window.location.href = "doctor-profile.html";
            });
        }

        // Navbar profile picture change + click to open doctor profile
        if (profilePic) {
            profilePic.src = "doctor.png";
            profilePic.style.cursor = "pointer";
            profilePic.addEventListener("click", () => {
                window.location.href = "doctor-profile.html";
            });
        }

        if (navLink) {
            navLink.addEventListener("click", () => {
                window.location.href = "doctor-profile.html";
            });
        }
    }

    // If key elements missing → stop script
    if (!filterIcon || !searchInput || !filterMenu) return;

    let currentFilter = "name";

    const apiBase = window.API_BASE || "http://127.0.0.1:3000/api";
    let patientsCache = [];

    const formatDate = (dateString) => {
        if (!dateString) return "No recent appointment";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "No recent appointment";
        return date.toLocaleDateString(undefined, {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const renderPatients = (patients) => {
        const container = document.querySelector(".patient-container");
        if (!container) return;

        container.innerHTML = "";

        if (!patients || patients.length === 0) {
            container.innerHTML =
                '<p style="text-align:center;color:#666;width:100%;">No patients found</p>';
            return;
        }

        patients.forEach((patient) => {
            const name = `${patient.FirstName} ${patient.LastName}`;
            const avatar =
                patient.patientInfo?.Image_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                )}&background=random&size=128`;

            const lastAppt = formatDate(patient?.lastAppointmentDate);

            const card = document.createElement("div");
            card.className = "patient-card";
            card.dataset.name = name.toLowerCase();
            card.dataset.appointment = lastAppt.toLowerCase();
            card.dataset.patientId = patient.UserID;
            card.innerHTML = `
          <img src="${avatar}" alt="${name}">
          <div class="patient-details">
            <h3>${name}</h3>
            <div class="card-info">
                <p class="last-app">Last Appt: ${lastAppt}</p>
            </div>
          </div>
          <button class="more">⋮</button>
      `;
            container.appendChild(card);
        });

        // Reinitialize edit-delete popup after rendering new cards
        initializeEditDeletePopup();
    };

    const loadPatients = async () => {
        const container = document.querySelector(".patient-container");
        if (container) {
            container.innerHTML =
                '<p style="text-align:center;color:#666;width:100%;">Loading patients...</p>';
        }

        try {
            const res = await fetch(`${apiBase}/admin/patients`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to load patients");

            patientsCache = data.data?.patients || [];
            renderPatients(patientsCache);
            filterAndSearch();
        } catch (err) {
            console.error("Error loading patients:", err);
            if (container) {
                container.innerHTML =
                    '<p style="text-align:center;color:#d9534f;width:100%;">Failed to load patients</p>';
            }
        }
    };

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (
            filterMenu.classList.contains("show") &&
            !filterMenu.contains(e.target) &&
            e.target !== filterIcon
        ) {
            filterMenu.classList.remove("show");
        }
    });

    // Toggle dropdown
    filterIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        filterMenu.classList.toggle("show");
    });

    // Filter item click
    document.querySelectorAll(".filter-item").forEach((item) => {
        item.addEventListener("click", () => {
            document
                .querySelectorAll(".filter-item")
                .forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            currentFilter = item.dataset.type;
            filterMenu.classList.remove("show");

            filterAndSearch();
        });
    });

    // Main filtering function
    function filterAndSearch() {
        const query = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll(".patient-card");

        cards.forEach((card) => {
            const name = card.dataset.name || "";
            const appointment = card.dataset.appointment || "";

            let shouldShow = false;

            if (currentFilter === "name") {
                shouldShow = name.includes(query);
            } else if (currentFilter === "appointment") {
                shouldShow = appointment.includes(query);
            }

            card.style.display = shouldShow ? "flex" : "none";
        });
    }

    // Trigger search on input
    searchInput.addEventListener("input", filterAndSearch);

    // Run once on load
    loadPatients();
});
