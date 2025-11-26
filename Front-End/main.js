
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

// ==================== Patient Info Form ====================
// main.js (مخصص للـ patient-page)
// تأكدي إن <body> فيه class="patient-page" علشان الكود يشتغل فقط على الصفحة دي
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('patient-page')) return;

  // عناصر الـ Sidebar و TopBar
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn = document.getElementById('close-sidebar');

  // عناصر البروفايل + الفورم
  const profileInput = document.getElementById('profile-picture');
  const profilePreview = document.getElementById('profile-preview');
  const sidebarProfileImg = document.getElementById('sidebar-profile-img');

  const form = document.getElementById('patient-form');
  const cancelBtn = document.getElementById('cancel-btn');

  // مسارات الصور الافتراضية (عدّلي لو اسم الملف مختلف)
  const PLACEHOLDER = 'profile-placeholder.png';

  // حالة Object URL الحالية (لو اتعملت preview) علشان نمسحها بعدين
  let currentObjectUrl = null;
  function revokeCurrentObjectUrl() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  }

  /* ---------- Sidebar open/close ---------- */

  // فتح
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (!sidebar) return;
      sidebar.style.left = '0';
    });
  }

  // غلق بزر ×
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (!sidebar) return;
      sidebar.style.left = '-250px';
    });
  }

  // غلق عند الضغط على Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar) {
      sidebar.style.left = '-250px';
    }
  });

  // غلق لما نضغط خارج الـ sidebar (مثلاً على الـ main)
  document.addEventListener('click', (e) => {
    if (!sidebar) return;
    const target = e.target;
    const clickedInsideSidebar = sidebar.contains(target);
    const clickedToggle = toggleBtn && toggleBtn.contains(target);
    if (!clickedInsideSidebar && !clickedToggle) {
      sidebar.style.left = '-250px';
    }
  });

  /* ---------- Profile image preview (form + sidebar) ---------- */
  if (profileInput) {
    profileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // نظف الـ object URL القديم
      revokeCurrentObjectUrl();

      // اعمل URL جديد للصورة
      const url = URL.createObjectURL(file);
      currentObjectUrl = url;

      // حدث الصور في الفورم والسايد بار
      if (profilePreview) profilePreview.src = url;
      if (sidebarProfileImg) sidebarProfileImg.src = url;
    });
  }

  /* ---------- Cancel button ---------- */
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // إعادة تعيين الفورم
      if (form) form.reset();

      // إرجاع صور البروفايل للـ placeholder
      revokeCurrentObjectUrl();
      if (profilePreview) profilePreview.src = PLACEHOLDER;
      if (sidebarProfileImg) sidebarProfileImg.src = PLACEHOLDER;
    });
  }

  /* ---------- Form submit (مؤقت - مثال) ---------- */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // جمع القيم من الحقول
      const payload = {
        firstName: (document.getElementById('first-name') || {}).value || '',
        lastName: (document.getElementById('last-name') || {}).value || '',
        phone: (document.getElementById('phone') || {}).value || '',
        email: (document.getElementById('email') || {}).value || '',
        dob: (document.getElementById('dob') || {}).value || '',
        gender: (document.getElementById('gender') || {}).value || '',
        bloodGroup: (document.getElementById('blood-group') || {}).value || '',
        address1: (document.getElementById('address1') || {}).value || '',
        address2: (document.getElementById('address2') || {}).value || '',
        chronicIllness: (document.getElementById('chronic') || {}).value || '',
        allergies: (document.getElementById('allergies') || {}).value || '',
        pastSurgeries: (document.getElementById('past-surgeries') || {}).value || '',
        currentMedication: (document.getElementById('current-medication') || {}).value || ''
      };

      // لو عايزة تبعثي الصورة كملف، ممكن تعملي FormData بدل JSON
      // مثال تعليق: لو عندك endpoint لرفع الصورة ثم ربطها في payload
      // -------------------------------------------------------------
      // const formData = new FormData();
      // if (profileInput.files[0]) formData.append('profilePicture', profileInput.files[0]);
      // formData.append('firstName', payload.firstName);
      // ...
      // fetch('/api/patients/:id', { method: 'PUT', headers: {...}, body: formData })

      console.log('Patient payload (demo):', payload);
      // مؤقتًا بس نعرض تأكيد للحركة
      alert('Saved (demo) — check console for payload.\nلو عايزة أبعت البيانات فعليًا للـ API أضيف fetch هنا.');
    });
  }

}); // DOMContentLoaded end
