// Sidebar Toggle
document.getElementById('menuBtn').addEventListener('click', function() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('overlay').classList.toggle('active');
});
// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    document.getElementById(this.dataset.tab).classList.add('active');
  });
});
document.getElementById('overlay').addEventListener('click', function() {
  document.getElementById('sidebar').classList.remove('active');
  this.classList.remove('active');
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
    