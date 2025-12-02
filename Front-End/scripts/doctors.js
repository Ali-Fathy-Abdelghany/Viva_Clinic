// doctors-filter.js - Works only on the doctors listing page
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const filterIcon  = document.getElementById("filterIcon");   // Button that opens the filter dropdown
  const filterMenu  = document.getElementById("filterMenu");   // The dropdown menu with filter options
  const searchInput = document.getElementById("searchInput");   // Search input field

  // If we're not on the doctors page (missing key elements), exit early
  if (!filterIcon || !searchInput) return;

  let currentFilter = 'name'; // Default filter type: search by doctor name

  // Close the filter dropdown when clicking outside of it
  document.addEventListener('click', (e) => 
    {
    if (
      filterMenu?.classList.contains('show') &&
      !filterMenu.contains(e.target) &&
      e.target !== filterIcon
    ) {
      filterMenu.classList.remove('show');
    }
  });

  // Toggle filter dropdown when clicking the filter icon
  filterIcon.addEventListener('click', (e) => {
    e.stopPropagation();                    // Prevent click from bubbling and closing immediately
    filterMenu.classList.toggle('show');
  });

  // Handle clicking on a filter option (Name, Specialty, Price)
  document.querySelectorAll('.filter-item').forEach(item => {
    item.addEventListener('click', () => {
      // Remove 'active' class from all items
      document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
      
      // Mark the selected item as active
      item.classList.add('active');
      
      // Update current filter type based on data-type attribute
      currentFilter = item.dataset.type;
      
      // Close the dropdown
      filterMenu.classList.remove('show');
      
      // Apply filtering + searching immediately
      filterAndSearch();
    });
  });

  /**
   * Main function: filters and searches doctor cards based on current filter type and search query
   */
  function filterAndSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.doctor-card');

    cards.forEach(card => {
      // Extract data from each card
      const name      = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const specialty = card.querySelector('.specialty')?.textContent.toLowerCase() || '';
      const priceText = card.querySelector('.price')?.textContent || '';
      const price     = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

      let shouldShow = false;

      // Apply filter logic based on selected type
      if (currentFilter === 'name') {
        shouldShow = name.includes(query);
      } else if (currentFilter === 'specialty') {
        shouldShow = specialty.includes(query);
      } else if (currentFilter === 'price') {
        // For price: exact match only if user typed a number, otherwise show all
        shouldShow = query === '' || price === Number(query);
      }

      // Show or hide the card
      card.style.display = shouldShow ? 'flex' : 'none';
    });

    // If filtering by price and search is empty → sort cards by price (ascending)
    if (currentFilter === 'price' && query === '') {
      sortByPrice();
    }
  }

  /**
   * Sort all doctor cards by price in ascending order
   */
  function sortByPrice() {
    const container = document.querySelector('.doctors-container');
    const cards = Array.from(document.querySelectorAll('.doctor-card'));

    // Sort cards by numeric price
    cards.sort((a, b) => {
      const priceA = parseInt(a.querySelector('.price')?.textContent.replace(/[^0-9]/g, '')) || 0;
      const priceB = parseInt(b.querySelector('.price')?.textContent.replace(/[^0-9]/g, '')) || 0;
      return priceA - priceB;
    });

    // Re-append cards in sorted order
    cards.forEach(card => container.appendChild(card));
  }

  // Trigger search/filter on every input change
  searchInput.addEventListener('input', filterAndSearch);

  // Initial filter on page load (in case there's a pre-filled search)
  filterAndSearch();
});