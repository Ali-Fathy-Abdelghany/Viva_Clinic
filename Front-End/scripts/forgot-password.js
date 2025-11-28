// Forgot password page logic
(function () {
  const apiBase = window.API_BASE || 'http://localhost:3000/api';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value.trim();

      try {
        const res = await fetch(`${apiBase}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (res.ok) {
          window.showMessage?.('Reset link sent to your email!', 'success');
          setTimeout(() => window.location.href = 'reset-sent.html', 2000);
        } else {
          window.showMessage?.(data.message || 'Email not found', 'error');
        }
      } catch (err) {
        window.showMessage?.('Network error', 'error');
      }
    });
  });
})();
