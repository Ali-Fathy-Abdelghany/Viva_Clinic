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

      window.showMessage?.('Password changed successfully!', 'success');
      setTimeout(() => window.location.href = 'reset-success.html', 1500);
    });
  });
})();
