// doctors-filter.js - Works only on the doctors listing page
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const filterIcon  = document.getElementById("filterIcon");
  const filterMenu  = document.getElementById("filterMenu");
  const searchInput = document.getElementById("searchInput");

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
