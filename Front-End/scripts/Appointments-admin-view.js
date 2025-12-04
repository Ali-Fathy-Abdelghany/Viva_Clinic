document.addEventListener('DOMContentLoaded', () => {
  // ==================== فلتر المواعيد ====================
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterToggle = document.getElementById('filterToggle');
  const filterMenu = document.getElementById('filterMenu');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  const patientNameFilter = document.getElementById('patientNameFilter');
  const doctorFilter = document.getElementById('doctorFilter');
  const modeFilter = document.getElementById('modeFilter');
  const statusOptions = document.querySelectorAll('.status-option');
  const cards = document.querySelectorAll('.appointment-card');
  const container = document.getElementById('tableContainer');

  // منع إغلاق الفلتر
  filterMenu.addEventListener('click', e => e.stopPropagation());
  filterToggle.addEventListener('click', e => {
    e.stopPropagation();
    filterMenu.classList.toggle('active');
  });
  document.addEventListener('click', e => {
    if (!filterToggle.contains(e.target) && !filterMenu.contains(e.target)) {
      filterMenu.classList.remove('active');
    }
  });

  statusOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      opt.classList.toggle('selected');
      applyFiltersAndSort();
    });
  });

  function applyFiltersAndSort() {
    const term = searchInput.value.toLowerCase().trim();
    const sortValue = sortSelect.value;
    const selectedStatuses = Array.from(statusOptions)
      .filter(opt => opt.classList.contains('selected'))
      .map(opt => opt.dataset.status);

    const visibleCards = Array.from(cards).filter(card => {
      const patientName = card.querySelector('.patient-info .person-name')?.textContent.toLowerCase() || '';
      const doctorName = card.querySelector('.doctor-info .person-name')?.textContent.toLowerCase() || '';
      const specialty = card.querySelector('.doctor-info .person-detail')?.textContent.toLowerCase() || '';
      const phone = card.querySelector('.patient-info .person-detail')?.textContent || '';
      const mode = card.querySelector('.mode')?.textContent || '';
      const status = card.dataset.status || '';
      const cardDate = new Date(card.dataset.date);

      if (dateFrom.value && cardDate < new Date(dateFrom.value)) return false;
      if (dateTo.value && cardDate > new Date(dateTo.value)) return false;
      if (patientNameFilter.value && !patientName.includes(patientNameFilter.value.toLowerCase())) return false;
      if (doctorFilter.value && !doctorName.includes(doctorFilter.value)) return false;
      if (modeFilter.value && mode !== modeFilter.value) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(status)) return false;

      return patientName.includes(term) || doctorName.includes(term) || specialty.includes(term) || phone.includes(term);
    });

    visibleCards.sort((a, b) => {
      const dateA = new Date(a.dataset.date);
      const dateB = new Date(b.dataset.date);
      const feeA = Number(a.dataset.fee) || 0;
      const feeB = Number(b.dataset.fee) || 0;

      if (sortValue === 'recent') return dateB - dateA;
      if (sortValue === 'oldest') return dateA - dateB;
      if (sortValue === 'fee-high') return feeB - feeA;
      if (sortValue === 'fee-low') return feeA - feeB;
      return 0;
    });

    visibleCards.forEach(card => container.appendChild(card));
    cards.forEach(card => {
      card.style.display = visibleCards.includes(card) ? '' : 'none';
    });
  }

  // Events
  searchInput.addEventListener('input', applyFiltersAndSort);
  sortSelect.addEventListener('change', applyFiltersAndSort);
  dateFrom.addEventListener('change', applyFiltersAndSort);
  dateTo.addEventListener('change', applyFiltersAndSort);
  patientNameFilter.addEventListener('input', applyFiltersAndSort);
  doctorFilter.addEventListener('change', applyFiltersAndSort);
  modeFilter.addEventListener('change', applyFiltersAndSort);
  applyFiltersAndSort();

  // ==================== السايد بار ====================
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !menuBtn.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });
});