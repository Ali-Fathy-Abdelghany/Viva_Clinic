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
    const role = localStorage.getItem("userRole");  
    const sidebar = document.getElementById("sidebar");
    const editBtn = document.querySelector(".book-btn");
    const menuBtn = document.getElementById("menuBtn");           // Hamburger icon
    const profilePic = document.getElementById("profilePic");        // Navbar profile picture
    const navLink = document.getElementById("nav-link");


    // ==================== 1. Sidebar Open/Close Logic ====================
    if (menuBtn && sidebar) {
      // Create overlay if it doesn't exist (dark background when sidebar is open)
      let overlay = document.getElementById("sidebarOverlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "sidebarOverlay";
        overlay.className = "overlay";
        document.body.appendChild(overlay);
      }

      const openSidebar = () => {
        sidebar.classList.add("active");
        overlay.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent background scrolling
      };

      const closeSidebar = () => {
        sidebar.classList.remove("active");
        overlay.style.display = "none";
        document.body.style.overflow = "auto";
      };

      // Toggle sidebar when clicking the hamburger menu
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.contains("active") ? closeSidebar() : openSidebar();
      });

      // Close sidebar when clicking on the overlay
      overlay.addEventListener("click", closeSidebar);

      // Close sidebar when clicking outside of it
      document.addEventListener("click", (e) => {
        if (
          sidebar.classList.contains("active") &&
          !sidebar.contains(e.target) &&
          !menuBtn.contains(e.target)
        ) {
          closeSidebar();
        }
      });

      // Close sidebar with Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("active")) {
          closeSidebar();
        }
      });
    }


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
                    <a href="Appointments.html">
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
        editBtn.style.display = "none";

        // ==================== NEW: Click to open doctor profile ====================
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

    // If role is admin or missing → the original sidebar remains
});
