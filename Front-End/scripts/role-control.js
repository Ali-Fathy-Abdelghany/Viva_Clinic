/* 
  role-control.js
  Dynamically changes the page depending on the user's role AND the page itself.

  Role must be stored as:
      localStorage.setItem("role", "admin");
      location.reload();
      or
      localStorage.setItem("role", "doctor");
      location.reload();
      or
      localStorage.setItem("role", "patient");
      location.reload();
*/

document.addEventListener("DOMContentLoaded", () => {

    // 1. تعريف العناصر الأساسية ودور المستخدم
    const role = localStorage.getItem("role"); 
    
    // عناصر الشريط الجانبي والأزرار
    const sidebar = document.querySelector(".sidebar");
    const editButtonContainer = document.querySelector(".edit-btn"); // زر التعديل القديم (في حالة وجوده)
    const editBtn = document.querySelector(".book-btn");             // زر التعديل الجديد/الحجز (المستخدم في منطق الطبيب)
    const Btnedit = document.getElementById("book-btn");  // to edit the section in patient view


    // عناصر التنقل (للوجوه والمحاذاة في شريط التنقل)
    const menuBtn = document.getElementById("menuBtn"); 
    const profilePic = document.getElementById("profilePic");
    const navLink = document.getElementById("nav-link");
    const navBar = document.getElementById("nav-links");  // to change nav links in patient view

    
    // تحديد الصفحة
    const currentPage = window.location.pathname.toLowerCase();
    const isPatientPage = currentPage.includes("patient");
    const isDoctorProfilePage = currentPage.includes("doctor-profile");
    // ==================== 1. Logout Button Binding Function ====================
    function bindLogout() {
        const logoutBtn = document.getElementById("logoutBtn");
        if (!logoutBtn) return;

    logoutBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const logoutModal = document.getElementById("logoutModal");
    if (logoutModal) {
      logoutModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  });
}
    // ==================== 2. Role-Based Content Switching ====================
    
    // لو الدكتور داخل صفحة المريض → غيّري الـ sidebar وشيلي زرار Edit
    if (role === "doctor") {
        
        // A. تغيير ال Sidebar للدكتور
            sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="admin-info">
                    <div class="admin-avatar">
                        <img src="images/doctor.png" id="sidebar-profile-img" alt="Dr. Sara Ali"> 
                    </div>
                    <span class="admin-name" id="sidebar-user-name">Dr. Sara Ali</span>
                </div>
            </div>

            <ul class="sidebar-menu">
                <li onclick="window.location.href='doctor-profile'">
                    <i class="fas fa-user"></i> My Profile
                </li>
                <li onclick="window.location.href='doctor_Appointment.html'">
                    <i class="fas fa-calendar"></i> Appointments
                </li>
                <li onclick="window.location.href='settings.html'">
                    <i class="fas fa-cog"></i> Settings
                </li>
                <li id="logoutBtn" class="logout-item" href="logout-modal.html">
                    <i class="fas fa-sign-out-alt"></i> Log Out
                </li>
            </ul>
        `;
        bindLogout();


        // B. إخفاء زر التعديل (Edit) أو الحجز (Book)
        if (editBtn) {
             editBtn.style.display = "none";
        }
        if (editButtonContainer) { // إخفاء زر التعديل الآخر إذا كان موجوداً
            editButtonContainer.style.display = "none";
        }

        // C. ==================== تفعيل روابط النقر الجديدة ====================
        // هذه الأجزاء يجب أن تعمل الآن لأن عناصرها تم إدخالها للتو عبر innerHTML

        // Sidebar Profile Picture/Name click functionality
        const newSidebarImg = document.getElementById("sidebar-profile-img");
        const newUserName = document.getElementById("sidebar-user-name");
        
        const redirectToDoctorProfile = () => {
             window.location.href = "doctor-profile.html";
        };

        if (newSidebarImg) {
            newSidebarImg.style.cursor = "pointer";
            newSidebarImg.addEventListener("click", redirectToDoctorProfile);
        }
        
        if (newUserName) {
            newUserName.style.cursor = "pointer";
            newUserName.addEventListener("click", redirectToDoctorProfile);
        }

        // Navbar profile picture change + click to open doctor profile
        if (profilePic) {
            profilePic.src = "images/doctor.png";
            profilePic.style.cursor = "pointer";
            profilePic.parentElement.href = "doctor-profile.html"; // لو الصورة جوه <a> بالفعل
        }

        // Navbar Link click
        if (navLink) {
            navLink.addEventListener("click", redirectToDoctorProfile);
        }
    }

    // لو المريض داخل → الزرار يظهر عادي
    // هذا الشرط يتحقق فقط إذا لم يتحقق شرط الطبيب أعلاه
    if (role === "patient" && editButtonContainer) {
        editButtonContainer.style.display = "block";
    }
    // ==================== 3. Hide Navbar Links for Doctor ====================
    if (role === "doctor" && isPatientPage){
        const navbarLinks = document.querySelectorAll(".nav-links .nav-link");
        navbarLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            if (text === "home" || text === "most popular" || text === "contact") {
                link.style.display = "none";
            }
        });
    }


    if (role === "patient" && isDoctorProfilePage) {
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
                <li onclick="window.location.href='MyAppointments.html'">
                    <i class="fas fa-calendar-check"></i> My Appointments
            
                <li onclick="window.location.href='PatientMedicalRecord.html'">
                    <i class="fas fa-file-medical"></i> Medical Record
                </li>
                <li onclick="window.location.href='chats.html'">
                    <i class="fas fa-comments"></i> Chats
                </li>
                <li onclick="window.location.href='settings.html'">
                    <i class="fas fa-cog"></i> Settings
                </li>
                <li id="logoutBtn" class="logout-item">
                    <i class="fas fa-sign-out-alt"></i> Log Out
                </li>
            </ul>
        `;
        bindLogout();


        navBar.innerHTML = `
            <a href="homepage.html" class="nav-link">Home</a>
            <a href="homepage.html#doctors" class="nav-link">Most Popular</a>
            <a href="homepage.html#contact" class="nav-link">Contact</a>
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

        // Navbar profile picture change + click to open patient profile
        if (profilePic) {
            profilePic.src = "images/patient.png";
            profilePic.style.cursor = "pointer";
            profilePic.addEventListener("click", () => {
                window.location.href = "PatientMedicalRecord.html";
            });
        }    

    }
});

