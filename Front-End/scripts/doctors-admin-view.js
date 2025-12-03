document.addEventListener('DOMContentLoaded', () => {
  // ==================== العناصر الأساسية ====================
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('actionModal');
  const cancelBtn = modal.querySelector('.cancel-btn');
  const confirmBtn = modal.querySelector('.confirm-btn');
  const filterBtn = document.querySelector('.filter-btn');
  const filterDropdown = document.getElementById('filterDropdown');

  let currentCard = null;

  // ==================== Sidebar & Overlay ====================
  menuBtn.onclick = () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  };

  overlay.onclick = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    modal.classList.remove('show');
    filterDropdown.classList.remove('show');
  };

  // ==================== Action Modal (Edit / Delete) ====================
  document.querySelectorAll('.more-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      currentCard = btn.closest('.doctor-card');
      modal.classList.add('show');

      // ريست الاختيار للـ Edit كل مرة
      document.querySelector('input[name="action"][value="edit"]').checked = true;
      document.querySelector('input[name="action"][value="delete"]').checked = false;
    };
  });

  cancelBtn.onclick = () => modal.classList.remove('show');

  confirmBtn.onclick = () => {
    if (!currentCard) return;

    const selectedAction = document.querySelector('input[name="action"]:checked').value;

    if (selectedAction === 'delete') {
      currentCard.remove();
      updateTotalCount();
    } else if (selectedAction === 'edit') {
      const doctorId = currentCard.dataset.id || 'new';
      window.location.href = `register-doctor.html?id=${doctorId}`;
    }

    modal.classList.remove('show');
  };

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('show');
  };

  // تحديث عدد الدكاترة
  function updateTotalCount() {
    const count = document.querySelectorAll('.doctor-card').length;
    document.getElementById('totalDoctors').textContent = count;
  }

  // ==================== الفلتر دلوقتي شغال 100% ====================
  if (filterBtn && filterDropdown) {
    // فتح وإغلاق الفلتر
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterDropdown.classList.toggle('show');
    });

    // إغلاق الفلتر لما تضغطي بره
    document.addEventListener('click', (e) => {
      if (filterDropdown.classList.contains('show') &&
          !filterDropdown.contains(e.target) &&
          !filterBtn.contains(e.target)) {
        filterDropdown.classList.remove('show');
      }
    });

    // منع إغلاق الفلتر لما تضغطي جواه
    filterDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // تغيير نوع الفلتر (Name / Specialty / Price)
    document.querySelectorAll('.filter-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // هنا ممكن تضيفي الكود بتاع البحث أو الترتيب بعدين
        // دلوقتي بس بيغير الشكل
        filterDropdown.classList.remove('show');
      });
    });
  }

  // ==================== View Mode (Grid / List) - اختياري ====================
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      const grid = document.getElementById('doctorsGrid');
      if (view === 'grid') {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
      } else {
        grid.style.gridTemplateColumns = '1fr';
      }
    });
  });
});