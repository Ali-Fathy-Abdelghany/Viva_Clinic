// Reset password page logic
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = e.target.password.value;
      const confirm = e.target.confirmPassword.value;

      if (pass !== confirm) {
        window.showMessage?.('Passwords do not match!', 'error');
        return;
      }
      if (pass.length < 6) {
        window.showMessage?.('Password must be at least 6 characters', 'error');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (!token) {
        window.showMessage?.('Invalid or missing token', 'error');
        return;
      }
      fetch(`${window.API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Token: token, Password: pass, ConfirmPassword: confirm })
      })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok}) => {
        if (ok) {
          window.showMessage?.('Password changed successfully!', 'success');
          setTimeout(() => window.location.href = 'reset-success.html', 1500);
        } else {
          window.showMessage?.('Failed to reset password', 'error');
        }
      })
      .catch(() => {
        window.showMessage?.('An error occurred. Please try again.', 'error');
      });
    });
  });
})();
