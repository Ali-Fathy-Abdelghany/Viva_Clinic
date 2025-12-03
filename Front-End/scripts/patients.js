// patient-filter.js
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const filterIcon  = document.getElementById("filterIcon");
  const filterMenu  = document.getElementById("filterMenu");
  const searchInput = document.getElementById("searchInput");
  const role = localStorage.getItem("userRole");  
  const sidebar = document.getElementById("sidebar");
  const navbar = document.getElementById("navbar");
  const menuBtn = document.getElementById("menuBtn");           // Hamburger icon
  const profilePic = document.getElementById("profilePic");        // Navbar profile picture

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

      
    }


  // If key elements missing → stop script
  if (!filterIcon || !searchInput || !filterMenu) return;

  let currentFilter = 'name';

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (
      filterMenu.classList.contains("show") &&
      !filterMenu.contains(e.target) &&
      e.target !== filterIcon
    ) {
      filterMenu.classList.remove("show");
    }
  });

  // Toggle dropdown
  filterIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    filterMenu.classList.toggle("show");
  });

  // Filter item click
  document.querySelectorAll(".filter-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".filter-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      currentFilter = item.dataset.type;
      filterMenu.classList.remove("show");

      filterAndSearch();
    });
  });

  // Main filtering function
  function filterAndSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll(".doctor-card");

    cards.forEach(card => {
      const name      = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const specialty = card.querySelector(".specialty")?.textContent.toLowerCase() || "";
      const priceText = card.querySelector(".price")?.textContent || "";
      const price     = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;

      let shouldShow = false;

      if (currentFilter === "name") {
        shouldShow = name.includes(query);
      } else if (currentFilter === "specialty") {
        shouldShow = specialty.includes(query);
      } else if (currentFilter === "price") {
        shouldShow = query === "" || price === Number(query);
      }

      card.style.display = shouldShow ? "flex" : "none";
    });

    if (currentFilter === "price" && query === "") {
      sortByPrice();
    }
  }

  // Sorting by price
  function sortByPrice() {
    const container = document.querySelector(".doctors-container");
    const cards = Array.from(document.querySelectorAll(".doctor-card"));

    cards.sort((a, b) => {
      const priceA = parseInt(a.querySelector(".price")?.textContent.replace(/[^0-9]/g, "")) || 0;
      const priceB = parseInt(b.querySelector(".price")?.textContent.replace(/[^0-9]/g, "")) || 0;
      return priceA - priceB;
    });

    cards.forEach(c => container.appendChild(c));
  }

  
    // Three dots action menu
    const actionMenu = document.getElementById("actionMenu");
    let activeButton = null;

    document.querySelectorAll('.more').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btn.getBoundingClientRect();
        actionMenu.style.left = rect.right - 100 + 'px';
        actionMenu.style.top = rect.bottom + 'px';
        actionMenu.style.display = 'block';
        activeButton = btn;
    });
    });

    // Close when clicking outside
    window.addEventListener('click', () => {
    actionMenu.style.display = 'none';
    });

    // Menu actions
    const items = actionMenu.querySelectorAll('.menu-item');
    items[0].onclick = () => alert('Edit clicked');
    items[1].onclick = () => alert('Delete clicked');


  // Trigger search on input
  searchInput.addEventListener("input", filterAndSearch);

  // Run once on load
  filterAndSearch();

});
