document.addEventListener("DOMContentLoaded", () => {

    // 1. تعريف العناصر الأساسية ودور المستخدم
    const role = localStorage.getItem("role"); 
    
    // عناصر الشريط الجانبي والأزرار
    const sidebar = document.querySelector(".sidebar");
    const editButtonContainer = document.querySelector(".edit-btn"); // زر التعديل القديم (في حالة وجوده)
    const editBtn = document.querySelector(".book-btn");             // زر التعديل الجديد/الحجز (المستخدم في منطق الطبيب)

    // عناصر التنقل (للوجوه والمحاذاة في شريط التنقل)
    const menuBtn = document.getElementById("menuBtn"); 
    const profilePic = document.getElementById("profilePic");
    const navLink = document.getElementById("nav-link");

    // تحديد الصفحة
    const currentPage = window.location.pathname.toLowerCase();
    const isPatientPage = currentPage.includes("patient");


    // ==================== 1. Sidebar Open/Close Logic ====================
    // هذا الجزء مسؤول عن فتح وإغلاق الشريط الجانبي بالماوس والـ ESC
    if (menuBtn && sidebar) {
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
            document.body.style.overflow = "hidden";
        };

        const closeSidebar = () => {
            sidebar.classList.remove("active");
            overlay.style.display = "none";
            document.body.style.overflow = "auto";
        };

        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.contains("active") ? closeSidebar() : openSidebar();
        });

        overlay.addEventListener("click", closeSidebar);

        document.addEventListener("click", (e) => {
            if (
                sidebar.classList.contains("active") &&
                !sidebar.contains(e.target) &&
                !menuBtn.contains(e.target)
            ) {
                closeSidebar();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && sidebar.classList.contains("active")) {
                closeSidebar();
            }
        });
    }

    if (!sidebar) return;

    // ==================== 2. Role-Based Content Switching ====================
    
    // لو الدكتور داخل صفحة المريض → غيّري الـ sidebar وشيلي زرار Edit
    if (role === "doctor" && isPatientPage) {
        
        // A. تغيير ال Sidebar للدكتور
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="admin-info">
                    <div class="admin-avatar">
                        <img src="images/doctor.png" id="sidebar-profile-img" class="profile-pic" alt="Dr. Sara Ali">
                    </div>
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

});