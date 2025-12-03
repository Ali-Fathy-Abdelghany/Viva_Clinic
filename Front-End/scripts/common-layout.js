// scripts/common-layout.js
// Shared layout behaviors: Sidebar, Navbar active state, Profile clicks, Logout
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    // ==================== DOM Elements ====================
    const menuBtn           = document.getElementById("menuBtn");           // Hamburger icon
    const sidebar           = document.getElementById("sidebar");           // Sidebar container
    const profilePic        = document.getElementById("profilePic");        // Navbar profile picture
    const sidebarProfileImg = document.getElementById("sidebar-profile-img"); // Sidebar profile image
    const sidebarUserName   = document.getElementById("sidebar-user-name");   // Sidebar user name
    const logoutModal       = document.getElementById("logoutModal");     // حاوية النافذة الرئيسية
    const modalYesBtn       = document.getElementById("modalYesBtn");     // زر تأكيد الخروج (Yes)
    const modalNoBtn        = document.getElementById("modalNoBtn");

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
  const logoutBtn = document.getElementById("logoutBtn");

  const isLogoutClick = logoutBtn && logoutBtn.contains(e.target);
  const isModalOpen  = logoutModal && logoutModal.style.display === "flex";
  const isModalClick = logoutModal && logoutModal.contains(e.target);

  if (
    sidebar.classList.contains("active") &&
    !sidebar.contains(e.target) &&
    !menuBtn.contains(e.target) &&
    !isLogoutClick &&
    !isModalClick &&
    !isModalOpen
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

    // ==================== 2. Profile Picture / Name Click → Go to Profile ====================
    const goToProfile = () => {
      window.location.href = "PatientMedicalRecord.html";
      sidebar?.classList.remove("active"); // Close sidebar if open
    };

    if (profilePic) {
      profilePic.style.cursor = "pointer";
      profilePic.addEventListener("click", goToProfile);
    }

    [sidebarProfileImg, sidebarUserName].forEach((el) => {
      if (el) {
        el.style.cursor = "pointer";
        el.addEventListener("click", goToProfile);
      }
    });
    // ==================== Logout Modal Logic Functions ====================
    const showLogoutModal = () => {
      if (logoutModal) {
        sidebar?.classList.remove("active");
        logoutModal.style.display = "flex"; // أظهرها باستخدام flex لتوسيطها
        document.body.style.overflow = "hidden"; // منع السكرول خلف البوب أب
            }
        };

    const hideLogoutModal = () => {
      if (logoutModal) {
        logoutModal.style.display = "none";
        // أعد السكرول مباشرة بعد إخفاء البوب أب
        document.body.style.overflow = "auto"; 
      }
    };
    const performLogout = () => {
      hideLogoutModal();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "homepage.html";
        };

    // ربط الأحداث بأزرار الـ Modal
        if (modalYesBtn) {
            modalYesBtn.addEventListener("click", performLogout); // عند الضغط على Yes قم بالخروج
        }
        if (modalNoBtn) {
            modalNoBtn.addEventListener("click", hideLogoutModal); // عند الضغط على No قم بإخفاء البوب أب
        }
        
        // إخفاء الـ Modal عند الضغط على الخلفية (Overlay)
        if (logoutModal) {
            logoutModal.addEventListener("click", (e) => {
                if (e.target === logoutModal) {
                    hideLogoutModal();
                }
            });
        }
    // ==================== 3. Sidebar Menu Navigation ====================
    document.querySelectorAll("#sidebar ul li").forEach((item) => {
      item.addEventListener("click", function () {
        const text = this.textContent.trim();

        // Navigate based on menu item text
        if (text.includes("My Appointments")) {
          window.location.href = "my-appointments.html";
        } else if (text.includes("Medical Record")) {
          window.location.href = "PatientMedicalRecord.html";
        } else if (text.includes("Chats")) {
          window.location.href = "chats.html";
        } else if (text.includes("Settings")) {
          window.location.href = "settings.html";
        }

        // Close sidebar after navigation (except on logout to avoid flicker)
        sidebar?.classList.remove("active");
      });
    });
    // في ملف scripts/common-layout.js - بعد نهاية حلقة الـ forEach وقبل القسم 4

    // ==================== 3.5 Logout Button Handler ====================
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            // 🛑 الخطوة الأكثر أهمية: إيقاف أي أحداث أخرى قد تغلق الـ Sidebar
            e.stopPropagation(); 
            e.preventDefault();
            
            // إغلاق Sidebar أولاً (كما اتفقنا في التعديل السابق)
            sidebar?.classList.remove("active");
            
            // إظهار نافذة تأكيد الخروج
            showLogoutModal(); 
        });
    }

    // ==================== 4. Highlight Active Page in Navbar ====================
    const currentPage = window.location.pathname.split("/").pop() || "homepage.html";

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href") || "";

      if (
        href === currentPage ||
        (currentPage === "homepage.html" && href.includes("homepage"))
      ) {
        link.classList.add("active");
      }
    });

    // Note: Notification bell logic is in scripts/bell.js (kept separate for clarity)
  });
})();