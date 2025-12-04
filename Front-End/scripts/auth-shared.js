// Shared helpers for auth-related pages
const API_BASE = 'http://127.0.0.1:3000/api';
window.API_BASE = API_BASE;

function showMessage(text, type = 'success') {
  const msg = document.getElementById('message');
  if (!msg) return;

  msg.textContent = text;
  msg.className = type;
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 4000);
}
window.showMessage = showMessage;

function setupPasswordToggle() {
  document.querySelectorAll('.toggle-pass').forEach(icon => {
    icon.addEventListener('click', function () {
      const input = this.previousElementSibling;
      if (!input) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      this.classList.toggle('fa-eye-slash', !isHidden);
      this.classList.toggle('fa-eye', isHidden);
    });
  });
}

function setupRoleToggle() {
  const buttons = Array.from(document.querySelectorAll('.toggle-btn'));
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      localStorage.setItem('selectedRole', this.textContent.trim());
    });
  });
}

function restoreRoleSelection() {
  const savedRole = localStorage.getItem('selectedRole');
  if (!savedRole) return;
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    if (btn.textContent.trim() === savedRole) {
      btn.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggle();
  setupRoleToggle();
  restoreRoleSelection();
});
