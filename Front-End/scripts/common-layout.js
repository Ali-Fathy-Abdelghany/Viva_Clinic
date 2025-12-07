// scripts/common-layout.js
// Shared layout behaviors: sidebar, navbar active state, profile clicks, logout

(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const menuBtn           = document.getElementById("menuBtn");
    const sidebar           = document.getElementById("sidebar");
    const profilePic        = document.getElementById("profilePic");
    const sidebarProfileImg = document.getElementById("sidebar-profile-img");
    const sidebarUserName   = document.getElementsByClassName("sidebar-user-name")[0];
    const logoutModal       = document.getElementById("logoutModal");
    const modalYesBtn       = document.getElementById("modalYesBtn");
    const modalNoBtn        = document.getElementById("modalNoBtn");

    // ===== Sidebar open/close
    let overlay = document.getElementById("sidebarOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "sidebarOverlay";
      overlay.className = "overlay";
      document.body.appendChild(overlay);
    }

    const openSidebar = () => {
      sidebar?.classList.add("active");
      overlay.style.display = "block";
      document.body.style.overflow = "hidden";
    };
    const closeSidebar = () => {
      sidebar?.classList.remove("active");
      overlay.style.display = "none";
      document.body.style.overflow = "auto";
    };

    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.contains("active") ? closeSidebar() : openSidebar();
      });

      overlay.addEventListener("click", closeSidebar);

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

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("active")) {
          closeSidebar();
        }
      });
    }

    // ===== Profile click (guard if global handler exists)
    const goToProfileSafe = typeof goToProfile === "function" ? goToProfile : null;
    if (profilePic && goToProfileSafe) {
      profilePic.style.cursor = "pointer";
      profilePic.addEventListener("click", goToProfileSafe);
    }
    [sidebarProfileImg, sidebarUserName].forEach((el) => {
      if (el && goToProfileSafe) {
        el.style.cursor = "pointer";
        el.addEventListener("click", goToProfileSafe);
      }
    });

    // ===== Logout helpers
    const showLogoutModal = () => {
      if (logoutModal) {
        sidebar?.classList.remove("active");
        logoutModal.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    };

    const hideLogoutModal = () => {
      if (logoutModal) {
        logoutModal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    };

    const doLogout = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        await fetch(`${window.API_BASE||'http://127.0.0.1:3000/api'}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers,
        });
      } catch (_) {
        // ignore network errors
      } finally {
        ["token","user","userRole","role","selectedRole"].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        window.location.href = "login.html";
      }
    };
    window.vivaLogout = doLogout;

    const performLogout = () => {
      hideLogoutModal();
      doLogout();
    };
    window.startLogoutFlow = () => {
      if (logoutModal) {
        showLogoutModal();
      } else {
        performLogout();
      }
    };

    if (modalYesBtn) modalYesBtn.addEventListener("click", performLogout);
    if (modalNoBtn)  modalNoBtn.addEventListener("click", hideLogoutModal);
    if (logoutModal) {
      logoutModal.addEventListener("click", (e) => {
        if (e.target === logoutModal) hideLogoutModal();
      });
    }

    // ===== Sidebar menu navigation (non-logout)
    document.querySelectorAll("#sidebar ul li").forEach((item) => {
      item.addEventListener("click", function () {
        const text = this.textContent.trim();
        if (text.includes("My Appointments")) {
          window.location.href = "MyAppointments.html";
        } else if (text.includes("Medical Record")) {
          window.location.href = "PatientMedicalRecord.html";
        } else if (text.includes("Chats")) {
          window.location.href = "chats.html";
        } else if (text.includes("Settings")) {
          window.location.href = "settings.html";
        }
        sidebar?.classList.remove("active");
      });
    });

    // ===== Logout button binding
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        sidebar?.classList.remove("active");
        window.startLogoutFlow();
      });
    }

    // ===== Highlight active nav link
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
  });
})();
