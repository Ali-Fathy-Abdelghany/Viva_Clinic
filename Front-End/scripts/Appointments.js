 document.getElementById('menuBtn').onclick = function(e) {
      e.stopPropagation();
      document.querySelector('.sidebar').classList.toggle('active');
    };
    document.addEventListener('click', function(e) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar.classList.contains('active') && !sidebar.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
    // Filter Dropdown
    document.getElementById('filterToggle').addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('filterMenu').classList.toggle('active');
    });
    document.addEventListener('click', function(e) {
      if (!document.querySelector('.filter-btn').contains(e.target)) {
        document.getElementById('filterMenu').classList.remove('active');
      }
    });

    // Status selection
    document.querySelectorAll('.status-option').forEach(option => {
      option.addEventListener('click', function() {
        this.classList.toggle('selected');
      });
    });