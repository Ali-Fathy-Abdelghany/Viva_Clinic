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
        const data = (await res.json()).data;
        console.log(data);
        
        if (!res.ok) throw new Error('Login failed');


        window.showMessage?.('Login successful!', 'success');
        setTimeout(() => {
          const role = data.user.Role?.toLowerCase();
          window.userRole = role;
          localStorage.setItem('userRole', role);
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
