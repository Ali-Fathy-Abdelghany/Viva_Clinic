// Forgot password page logic
(function () {
  const apiBase = window.API_BASE || 'http://127.0.0.1:3000/api';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const Email = e.target.email.value.trim();

      try {
        const res = await fetch(`${apiBase}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Email })
        });
        const data = await res.json();

        if (res.ok) {
          window.showMessage?.('A reset link has been sent to your email!', 'success');
          setTimeout(() => window.location.href = 'reset-sent.html', 1000);
        } else {
          window.showMessage?.(data.message || 'Email not found', 'error');
        }
      } catch (err) {
        window.showMessage?.('Network error', 'error');
      }
    });
  });
})();
