document.addEventListener("DOMContentLoaded", () => {

    const role = localStorage.getItem("role");
    const editButtonContainer = document.querySelector(".edit-btn");
    const sidebar = document.querySelector(".sidebar");
    const currentPage = window.location.pathname.toLowerCase();

    // نحدد إن الصفحة صفحة مريض
    const isPatientPage = currentPage.includes("patient");

    // لو الدكتور داخل صفحة المريض → غيّري الـ sidebar وشيلي زرار Edit
    if (role === "doctor" && isPatientPage) {
        
        // تغيير ال Sidebar للدكتور
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="admin-info">
                    <div class="admin-avatar">
                        <img src="images/doctor.png" alt="Doctor">
                    </div>
                    <span class="admin-name">Doctor</span>
                </div>
            </div>

            <ul class="sidebar-menu">

                <li>
                    <a href="doctor-profile.html">
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

        // اخفاء زرار Edit Profile
        if (editButtonContainer) {
            editButtonContainer.style.display = "none";
        }
    }

    // لو المريض داخل → الزرار يظهر عادي
    if (role === "patient" && editButtonContainer) {
        editButtonContainer.style.display = "block";
    }
});
