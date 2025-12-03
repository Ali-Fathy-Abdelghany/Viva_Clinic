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