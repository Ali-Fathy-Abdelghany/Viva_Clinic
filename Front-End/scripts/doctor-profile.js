/* 
  role-sidebar.js
  Dynamically changes the sidebar depending on the user's role.

  Role must be stored as:
      localStorage.setItem("userRole", "admin");
      location.reload();
      or
      localStorage.setItem("userRole", "doctor");
      location.reload();
      or
      localStorage.setItem("userRole", "patient");
      location.reload();
*/

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");  
    const sidebar = document.getElementById("sidebar");
    const editBtn = document.querySelector(".book-btn");  // to hide the whole section in doctor view
    const Btnedit = document.getElementById("book-btn");  // to edit the section in patient view
    const menuBtn = document.getElementById("menuBtn");           // Hamburger icon
    const profilePic = document.getElementById("profilePic");        // Navbar profile picture
    const navBar = document.getElementById("nav-links");  // to change nav links in patient view


    // ==================== 1. Sidebar Open/Close Logic ====================
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
                        <img src="images/doctor.png" id="sidebar-profile-img" class="profile-pic" alt="Dr. Sara Ali">                    </div>
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

        navBar.innerHTML = `
            <a href="doctor-profile.html" class="nav-link">Home</a>
        `;

        editBtn.style.display = "none";

        // ==================== Click to open doctor profile ====================
        // Sidebar image
        const newSidebarImg = document.getElementById("sidebar-profile-img");
        const newUserName = document.getElementById("sidebar-user-name")
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
            profilePic.src = "images/doctor.png";
            profilePic.style.cursor = "pointer";
            profilePic.addEventListener("click", () => {
                window.location.href = "doctor-profile.html";
            });
        }

    }

        if (role === "patient") {
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="admin-info">
                    <div class="admin-avatar">
                        <img src="images/patient.png" id="sidebar-profile-img" class="profile-pic" alt="User Avatar">
                    </div>
                        <span class="admin-name" id="sidebar-user-name">User Name</span>
                </div>
            </div>

            <ul class="sidebar-menu">

                <li>
                    <a href="MyAppointments.html">
                        <i class="fas fa-calendar-check"></i>
                        <span>My Appointments</span>
                    </a>
                </li>

                <li>
                    <a href="PatientMedicalRecord.html">
                        <i class="fas fa-file-medical"></i>
                        <span>Medical Record</span>
                    </a>
                </li>

                <li>
                    <a href="chats.html">
                        <i class="fas fa-comments"></i>
                        <span>Chats</span>
                    </a>
                </li>


                <li>
                    <a href="settings.html">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                </li>

                <li>
                    <a href="login.html" class="logout-item">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Log out</span>
                    </a>
                </li>

            </ul>
        `;

        navBar.innerHTML = `
            <a href="homepage.html" class="nav-link">Home</a>
            <a href="#doctors" class="nav-link">Most Popular</a>
            <a href="#contact" class="nav-link">Contact</a>
        `;
        
        Btnedit.innerHTML = `
            <!-- Consultation Charge FIRST -->
                <div style="text-align:right; margin-bottom:10px;">
                    <p style="margin:0; font-weight:bold; font-size:14px; color:#666;">Consultation Charge</p>
                    <p style="margin:0; font-size:15px; font-weight:700; color:#007977;">250 EGP / 30 Minutes</p>
                </div>

                <!-- Edit Button BELOW -->
                <a href="BookAppointment.html" class="btn-book" style="text-decoration: none;">Book Appointment</a>
        `;

        // ==================== Click to open patient profile ====================
        // Sidebar image
        const newSidebarImg = document.getElementById("sidebar-profile-img");
        const newUserName = document.getElementById("sidebar-user-name")
        if (newSidebarImg) {
            newSidebarImg.style.cursor = "pointer";
            newSidebarImg.addEventListener("click", () => {
                window.location.href = "PatientMedicalRecord.html";
            });
            newUserName.style.cursor = "pointer";
            newUserName.addEventListener("click", () => {
                window.location.href = "PatientMedicalRecord.html";
            });
        }

        // Navbar profile picture change + click to open doctor profile
        if (profilePic) {
            profilePic.src = "images/patient.png";
            profilePic.style.cursor = "pointer";
            profilePic.addEventListener("click", () => {
                window.location.href = "PatientMedicalRecord.html";
            });
        }    

    }

    // If role is admin or missing → the original sidebar remains

});

