// Setup navbar and sidebar based on user role
document.addEventListener("DOMContentLoaded", function () {
    const userRole = (
        localStorage.getItem("userRole") ||
        sessionStorage.getItem("userRole") ||
        ""
    ).toLowerCase();
    const navLinks = document.querySelector(".nav-links");

    if (userRole === "admin") {
        // Admin navbar
        if (navLinks) {
            navLinks.innerHTML = `
                        <a href="admin-dashboard.html" class="nav-link">Dashboard</a>
                    `;
        }
    }
    // Patient navbar is already set by default in HTML
});

function setupSidebar() {
    const roleFromStorage = (
        localStorage.getItem("userRole") ||
        sessionStorage.getItem("userRole") ||
        ""
    ).toLowerCase();

    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    if (roleFromStorage === "admin") {
        // Admin sidebar
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
    } else if (roleFromStorage === "doctor") {
        // Doctor sidebar
        sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="admin-info">
          <div class="admin-avatar">
            <img src="images/doctor.png" id="sidebar-profile-img" alt="Profile">
          </div>
          <span class="admin-name">Doctor Name</span>
        </div>
      </div>
      <ul class="sidebar-menu">
        <li onclick="window.location.href='doctor-profile.html'">
          <i class="fas fa-user"></i> My Profile
        </li>
        <li onclick="window.location.href='doctor_app.html'">
          <i class="fas fa-calendar"></i> Appointments
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
}
setupSidebar();