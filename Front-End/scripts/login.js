// Login page logic
(function () {
  const apiBase = window.API_BASE || 'http://localhost:3000/api';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value.trim();
      const password = e.target.password.value;
      const remember = e.target.remember?.checked;

      try {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        storage.setItem('user', JSON.stringify(data.user));

        window.showMessage?.('Login successful!', 'success');
        setTimeout(() => {
          const role = data.user.role?.toLowerCase();
          window.location.href = role === 'patient'
            ? 'patient-dashboard.html'
            : 'doctor-dashboard.html';
        }, 1200);
      } catch (err) {
        window.showMessage?.(err.message || 'Invalid credentials', 'error');
      }
    });
  });
})();
