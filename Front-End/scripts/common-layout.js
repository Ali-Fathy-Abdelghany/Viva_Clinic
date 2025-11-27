// Shared navigation, sidebar, and notification behaviors
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const bellIcon = document.getElementById('bellIcon');
    const notificationsMenu = document.getElementById('notificationsMenu');
    const profilePic = document.getElementById('profilePic');
    const sidebarProfileImg = document.getElementById('sidebar-profile-img');
    const sidebarUserName = document.getElementById('sidebar-user-name');

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    document.addEventListener('click', (e) => {
      if (sidebar?.classList.contains('active') && !sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
        sidebar.classList.remove('active');
      }
      if (notificationsMenu?.classList.contains('active') &&
          !notificationsMenu.contains(e.target) && !bellIcon?.contains(e.target)) {
        notificationsMenu.classList.remove('active');
      }
    });

    if (bellIcon && notificationsMenu) {
      bellIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationsMenu.classList.toggle('active');
        if (notificationsMenu.classList.contains('active') && notificationsMenu.innerHTML.trim() === '') {
          notificationsMenu.innerHTML = '<div style=\"padding: 15px; text-align: center; color: #666; font-size: 14px;\">No notifications yet</div>';
        }
      });
    }

    if (profilePic) {
      profilePic.style.cursor = 'pointer';
      profilePic.addEventListener('click', () => window.location.href = 'patient.html');
    }

    [sidebarProfileImg, sidebarUserName].forEach(el => {
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          window.location.href = 'patient.html';
          sidebar?.classList.remove('active');
        });
      }
    });

    document.querySelectorAll('#sidebar ul li').forEach(item => {
      item.addEventListener('click', function () {
        const text = this.textContent.trim();
        if (text.includes('My Appointments')) window.location.href = 'my-appointments.html';
        else if (text.includes('Medical Record')) window.location.href = 'medical-record.html';
        else if (text.includes('Chats')) window.location.href = 'chats.html';
        else if (text.includes('Settings')) window.location.href = 'settings.html';
        else if (text.includes('Log Out') || this.id === 'logoutBtn') {
          if (confirm('Are you sure you want to log out?')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'homepage.html';
          }
        }
        sidebar?.classList.remove('active');
      });
    });

    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPage ||
          (currentPage === '' && link.getAttribute('href')?.includes('homepage'))) {
        link.classList.add('active');
      }
    });
  });
})();
