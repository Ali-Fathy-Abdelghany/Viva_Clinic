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
    const logoutModal       = document.getElementById("logoutModal");       // Logout modal container
    const modalYesBtn       = document.getElementById("modalYesBtn");       // Logout confirmation button (Yes)
    const modalNoBtn        = document.getElementById("modalNoBtn");        // Logout cancellation button (No)

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

    // Close sidebar when clicking outside of it (unless clicking logout button or modal)
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
        !isModalOpen // Do not close if the modal is currently open
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

    // Attach click event to sidebar profile image and user name
    [sidebarProfileImg, sidebarUserName].forEach((el) => {
      if (el) {
        el.style.cursor = "pointer";
        el.addEventListener("click", goToProfile);
      }
    });

    // ==================== Logout Modal Logic Functions ====================
    const showLogoutModal = () => {
      if (logoutModal) {
        sidebar?.classList.remove("active"); // Close sidebar before showing modal
        logoutModal.style.display = "flex"; // Show using flex for centering
        document.body.style.overflow = "hidden"; // Prevent background scrolling behind the popup
      }
    };

    const hideLogoutModal = () => {
      if (logoutModal) {
        logoutModal.style.display = "none";
        // Restore scrolling immediately after hiding the popup
        document.body.style.overflow = "auto";
      }
    };

    const performLogout = () => {
      hideLogoutModal();
      localStorage.clear(); // Clear local storage data
      sessionStorage.clear(); // Clear session storage data
      window.location.href = "homepage.html"; // Redirect to homepage
    };

    // Attach events to the Modal buttons
    if (modalYesBtn) {
      modalYesBtn.addEventListener("click", performLogout); // On 'Yes' click, perform logout
    }
    if (modalNoBtn) {
      modalNoBtn.addEventListener("click", hideLogoutModal); // On 'No' click, hide the popup
    }

    // Hide the Modal when clicking on the background (Overlay)
    if (logoutModal) {
      logoutModal.addEventListener("click", (e) => {
        if (e.target === logoutModal) { // Check if the click was directly on the modal container itself
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
          window.location.href = "MyAppointments.html";
        } else if (text.includes("Medical Record")) {
          window.location.href = "PatientMedicalRecord.html";
        } else if (text.includes("Chats")) {
          window.location.href = "chats.html";
        } else if (text.includes("Settings")) {
          window.location.href = "settings.html";
        }
        // Note: Logout is handled separately by logoutBtn (Section 3.5)

        // Close sidebar after navigation (if it wasn't a logout button click)
        sidebar?.classList.remove("active");
      });
    });

    // ==================== 3.5 Logout Button Handler ====================
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        // 🛑 Most important step: Stop any other events that might close the Sidebar (like the document listener)
        e.stopPropagation();
        e.preventDefault(); // Prevent default link behavior if it's an anchor

        // Close Sidebar first (as agreed in the previous adjustment)
        sidebar?.classList.remove("active");

        // Show the logout confirmation modal
        showLogoutModal();
      });
    }

    // ==================== 4. Highlight Active Page in Navbar ====================
    const currentPage = window.location.pathname.split("/").pop() || "homepage.html"; // Get current page filename

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href") || "";

      // Check if the link href matches the current page (or homepage if it's the root)
      if (
        href === currentPage ||
        (currentPage === "homepage.html" && href.includes("homepage"))
      ) {
        link.classList.add("active"); // Add 'active' class to highlight
      }
    });

    // Note: Notification bell logic is in scripts/bell.js (kept separate for clarity)
  });
})();