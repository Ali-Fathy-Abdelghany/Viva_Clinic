// Login page logic
(function () {
  const apiBase = window.API_BASE || 'http://127.0.0.1:3000/api';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const Email = e.target.email.value.trim();
      const Password = e.target.password.value;
      const remember = e.target.remember?.checked;

      try {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ Email, Password })
        });
        const payload = await res.json();
        const data = payload?.data || {};

        if (!res.ok) throw new Error(payload?.message || 'Login failed');

        const token = data.token || data.accessToken;
        const user = data.user;

        // Persist token for API calls that need Authorization header
        if (token) {
          if (remember) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user || {}));
          } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user || {}));
          }
        }


        window.showMessage?.('Login successful!', 'success');
        setTimeout(() => {
          const role = user?.Role?.toLowerCase();
          window.userRole = role;
          localStorage.setItem('userRole', role);
          window.userID = user?.UserID;
          localStorage.setItem('userID', user?.UserID);
          window.location.href = role === 'patient'
            ? 'homepage.html'
            : role === 'doctor'
            ? 'doctor-profile.html'
            : 'admin-dashboard.html';
        }, 1200);
      } catch (err) {
        window.showMessage?.('Invalid credentials', 'error');
      }
    });
  });
})();
