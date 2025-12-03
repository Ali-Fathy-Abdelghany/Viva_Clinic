// Registration page logic
(function () {
  const apiBase = window.API_BASE || 'http://localhost:3000/api';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      data.role = localStorage.getItem('selectedRole') || 'Patient';
      console.log(data);
      try {
        const res = await fetch(`${apiBase}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        const result = await res.json();

        if (res.ok) {
          window.showMessage?.('Registered successfully! Redirecting...', 'success');
          setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
          window.showMessage?.(result.message || 'Registration failed', 'error');
        }
      } catch (err) {
        window.showMessage?.('Server error. Please try again later.', 'error');
      }
    });
  });
})();
