const menuBtn        = document.getElementById('menuBtn');
const sidebar        = document.getElementById('sidebar');
const overlay        = document.getElementById('sidebarOverlay');
const filterBtn      = document.getElementById('filterBtn');
const filterDropdown = document.getElementById('filterDropdown');
const searchInput    = document.getElementById('doctorSearch');

let currentFilter = 'name';

/* menuBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.style.overflow = sidebar.classList.contains("active") ? "hidden" : "auto";
});

overlay?.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}); */

// ================= فتح وإغلاق الفلتر (الحل المضمون) =================
filterBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  filterDropdown.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (filterDropdown.classList.contains('show') && 
      !filterDropdown.contains(e.target) && 
      e.target !== filterBtn) {
    filterDropdown.classList.remove('show');
  }
});

filterDropdown?.addEventListener('click', (e) => {
  e.stopPropagation();
});

// ================= تغيير نوع الفلتر =================
document.querySelectorAll('.filter-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentFilter = item.dataset.type;
    filterDropdown.classList.remove('show');
  });
});

// ================= البحث والفلترة =================
function searchAndFilter() {
  const query = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.doctor-card').forEach(card => {
    const name      = card.querySelector('h3').textContent.toLowerCase();
    const specialty = card.querySelector('.specialty').textContent.toLowerCase();
    const priceText = card.querySelector('.price').textContent;
    const price     = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

    let show = true;

    if (query) {
      if (currentFilter === 'name') {
        show = name.includes(query);
      } else if (currentFilter === 'specialty') {
        show = specialty.includes(query);
      } else if (currentFilter === 'price') {
        show = price <= parseInt(query);
      }
    }

    card.style.display = show ? 'flex' : 'none';
  });
}

searchInput?.addEventListener('input', searchAndFilter);

// ---------------------------------------------
// Replace Sidebar in ExploreAllDoctors Page
// with the Admin Sidebar (from doctor profile page)
// ---------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay") || document.getElementById("overlay");
    const menuBtn = document.getElementById("menuBtn");
    const role = localStorage.getItem("role"); 

    if (!sidebar) return;

  
    if (role === "admin") {
    // ---------------------------------------------
    // 1. Inject ADMIN SIDEBAR HTML
    // ---------------------------------------------
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
        <li onclick="window.location.href='ExploreAllDoctors.html'">
          <i class="fas fa-user-md"></i> Doctors
        </li>
        <li onclick="window.location.href='patients.html'">
          <i class="fas fa-heartbeat"></i> Patients
        </li>
        <li onclick="window.location.href='register-doctor.html'">
          <i class="fas fa-user-plus"></i> Register
        </li>
        <li onclick="window.location.href='settings.html'">
          <i class="fas fa-cog"></i> Settings
        </li>
        <li id="logoutBtn" class="logout-item">
          <i class="fas fa-sign-out-alt"></i> Log Out
        </li>
      </ul>
    `;

    // ---------------------------------------------
    // 2. Sidebar Open/Close Logic
    // ---------------------------------------------
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("active");
        });
    }

    if (overlay) {
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        });
    }

    // ---------------------------------------------
    // 3. Logout Modal Trigger
    // ---------------------------------------------
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const modalYes = document.getElementById("modalYesBtn");
    const modalNo = document.getElementById("modalNoBtn");

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener("click", () => {
            logoutModal.style.display = "flex";
        });

        modalNo.addEventListener("click", () => {
            logoutModal.style.display = "none";
        });

        modalYes.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
        });
    }
  }
});
