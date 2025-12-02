/* 
  role-sidebar.js
  Dynamically changes the sidebar depending on the user's role.

  Role must be stored as:
      localStorage.setItem("userRole", "admin");
      or
      localStorage.setItem("userRole", "doctor");
*/

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole");  
    const sidebar = document.getElementById("sidebar");
    const editBtn = document.querySelector(".book-btn");

    if (!sidebar) return;

    if (role === "doctor") {
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="admin-info">
                    <div class="admin-avatar">
                        <img class="images/doctor.png" src="" alt="Dr. Sara Ali">                    </div>
                        <span class="admin-name">Dr. Sara Ali</span>
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
    }

    // If role is admin or missing → the original sidebar remains
});
