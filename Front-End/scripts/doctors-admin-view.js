document.addEventListener("DOMContentLoaded", () => {
    const filterBtn = document.getElementsByClassName("filter-btn")[0];
    const filterDropdown = document.getElementById("filterDropdown");
    const searchInput = document.getElementById("doctorSearch");
    const apiBase = window.API_BASE || "http://127.0.0.1:3000/api";
    let doctorsCache = [];
    let currentFilter = "name";

    const renderDoctors = (doctors) => {
        const container = document.querySelector(".doctors-container");
        if (!container) return;
        container.innerHTML = "";
        if (!doctors || doctors.length === 0) {
            container.innerHTML =
                '<p style="text-align:center;color:#666;width:100%;">No doctors found</p>';
            return;
        }
        doctors.forEach((doctor) => {
            const name = `${doctor.user.FirstName} ${doctor.user.LastName}`;
            const specialty = doctor.specialty?.Name;
            const price = doctor.Fee;
            const avatar =
                doctor?.Image_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                )}&background=random&size=128`;

            const card = document.createElement("div");
            card.className = "doctor-card";
            card.dataset.name = name.toLowerCase();
            card.dataset.specialty = specialty.toLowerCase();
            card.dataset.price = price;
            card.dataset.doctorId = doctor.DoctorID;

            card.innerHTML = `
        <img src="${avatar}" alt="${name}">
        <div class="doctor-details">
          <h3>${name}</h3>
          <p class="specialty">${specialty}</p>
          <p class="price">Starts from: <strong>${price} EGP</strong></p>
        </div>
        <span class="arrow">></span>
      `;
            card.addEventListener("click", () => {
                window.location.href = `doctor-profile.html?doctorId=${doctor.DoctorID}`;
            });
            container.appendChild(card);
        });
    };
    const loadDoctors = async () => {
        const container = document.querySelector(".doctors-container");
        if (container) {
            container.innerHTML =
                '<p style="text-align:center;color:#666;width:100%;">Loading doctors...</p>';
        }
        try {
            const res = await fetch(`${apiBase}/doctors`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to load doctors");

            doctorsCache = data.data?.doctors || data.data || [];
            renderDoctors(doctorsCache);
            filterAndSearch();
        } catch (err) {
            console.error("Error loading doctors:", err);
            if (container) {
                container.innerHTML =
                    '<p style="text-align:center;color:#d9534f;width:100%;">Failed to load doctors</p>';
            }
        }
    };

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (
            filterDropdown.classList.contains("show") &&
            !filterDropdown.contains(e.target) &&
            e.target !== filterBtn
        ) {
            filterDropdown.classList.remove("show");
        }
    });

    // Toggle dropdown
    filterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle("show");
    });
    document.querySelectorAll(".filter-item").forEach((item) => {
        item.addEventListener("click", () => {
            document
                .querySelectorAll(".filter-item")
                .forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            currentFilter = item.dataset.type;
            filterDropdown.classList.remove("show");

            filterAndSearch();
        });
    });

    // Main filtering function
    function filterAndSearch() {
        const query = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll(".doctor-card");

        cards.forEach((card) => {
            const name = card.dataset.name || "";
            const specialty = card.dataset.specialty || "";
            const price = parseInt(card.dataset.price) || 0;

            let shouldShow = false;

            if (currentFilter === "name") {
                shouldShow = name.includes(query) || query === "";
            } else if (currentFilter === "specialty") {
                shouldShow = specialty.includes(query) || query === "";
            } else if (currentFilter === "price") {
                shouldShow = !query || price <= parseInt(query);
            }

            card.style.display = shouldShow ? "flex" : "none";
        });
    }

    // Trigger search on input
    searchInput.addEventListener("input", filterAndSearch);

    // Run once on load
    loadDoctors();
});
