
const API_BASE = 'http://localhost:3000/api';

function showMessage(text, type = 'success') {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = type;
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 4000);
}

document.querySelectorAll('.toggle-pass').forEach(icon => {
  icon.addEventListener('click', function () {
    const input = this.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      this.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
      input.type = 'password';
      this.classList.replace('fa-eye', 'fa-eye-slash');
    }
  });
});

document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    localStorage.setItem('selectedRole', this.textContent.trim().toLowerCase());
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const savedRole = localStorage.getItem('selectedRole') || 'patient';
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    if (btn.textContent.trim().toLowerCase() === savedRole) {
      btn.classList.add('active');
    }
  });
});

// OTP Inputs Auto Focus
const otpInputs = document.querySelectorAll('.otp-inputs input');
otpInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    if (input.value.length === 1 && index < 5) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

// OTP Timer (45 ثانية)
if (document.getElementById('timer')) {
  let time = 45;
  const timerEl = document.getElementById('timer');
  const resendLink = document.getElementById('resendLink');
  const timer = setInterval(() => {
    time--;
    timerEl.textContent = `00:${time.toString().padStart(2, '0')}`;
    if (time <= 0) {
      clearInterval(timer);
      timerEl.textContent = '';
      resendLink.style.pointerEvents = 'auto';
      resendLink.style.color = '#007977';
      resendLink.textContent = 'Resend Code';
    }
  }, 1000);

  // Resend Code
  document.getElementById('resendLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showMessage('New code sent!', 'success');
    time = 45;
    timerEl.textContent = '00:45';
    resendLink.style.pointerEvents = 'none';
    resendLink.style.color = '#aaa';
  });
}

// ==================== Forms Submit ====================

// Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);
    data.role = localStorage.getItem('selectedRole') || 'patient';

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        showMessage('Registered successfully! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
      } else {
        showMessage(result.message || 'Error', 'error');
      }
    } catch (err) {
      showMessage('Server error', 'error');
    }
  });
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const remember = e.target.remember.checked;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (remember) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }

      showMessage('Login successful!', 'success');
      setTimeout(() => {
        const role = data.user.role.toLowerCase();
        if (role === 'patient') window.location.href = 'patient-dashboard.html';
        else window.location.href = 'doctor-dashboard.html';
      }, 1200);

    } catch (err) {
      showMessage(err.message, 'error');
    }
  });
}

// Forgot Password
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('Reset link sent!', 'success');
        setTimeout(() => window.location.href = 'reset-sent.html', 2000);
      } else {
        showMessage(data.message || 'Error', 'error');
      }
    } catch (err) {
      showMessage('Server error', 'error');
    }
  });
}

// OTP Verification
const otpForm = document.getElementById('otpForm');
if (otpForm) {
  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = Array.from(otpInputs).map(i => i.value).join('');
    if (code.length === 6) {
      showMessage('Verified!', 'success');
      setTimeout(() => window.location.href = 'reset-password.html', 1000);
    } else {
      showMessage('Please enter full code', 'error');
    }
  });
}

// Reset Password
const resetForm = document.getElementById('resetForm');
if (resetForm) {
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = e.target.password.value;
    const confirm = e.target.confirmPassword.value;
    if (pass !== confirm) {
      showMessage('Passwords do not match!', 'error');
      return;
    }
    if (pass.length < 6) {
      showMessage('Password too short!', 'error');
      return;
    }
    showMessage('Password changed successfully!', 'success');
    setTimeout(() => window.location.href = 'reset-success.html', 1500);
  });
}