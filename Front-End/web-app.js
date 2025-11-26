// ==================================================================
// Viva Clinic - Frontend JavaScript (web-app.js)
// Organized & Fully Commented in English
// ==================================================================

const API_BASE = 'http://localhost:3000/api'; // Backend API base URL

// ==================================================================
// Utility: Show toast message (success / error)
// ==================================================================
function showMessage(text, type = 'success') {
  const msg = document.getElementById('message');
  if (!msg) return;

  msg.textContent = text;
  msg.className = type; // 'success' or 'error'
  msg.classList.add('show');

  setTimeout(() => msg.classList.remove('show'), 4000);
}

// ==================================================================
// Password Visibility Toggle (Eye icon)
// ==================================================================
document.querySelectorAll('.toggle-pass').forEach(icon => {
  icon.addEventListener('click', function () {
    const input = this.previousElementSibling; // The password input
    if (input.type === 'password') {
      input.type = 'text';
      this.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
      input.type = 'password';
      this.classList.replace('fa-eye', 'fa-eye-slash');
    }
  });
});

// ==================================================================
// Role Toggle Buttons (Patient / Doctor) - Remember selection
// ==================================================================
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    // Remove active from all buttons
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    // Activate clicked one
    this.classList.add('active');
    // Save role to localStorage
    localStorage.setItem('selectedRole', this.textContent.trim().toLowerCase());
  });
});

// Restore saved role on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedRole = localStorage.getItem('selectedRole') || 'patient';
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    if (btn.textContent.trim().toLowerCase() === savedRole) {
      btn.classList.add('active');
    }
  });
});

// ==================================================================
// OTP Input Fields - Auto-focus & Backspace navigation
// ==================================================================
const otpInputs = document.querySelectorAll('.otp-inputs input');
otpInputs.forEach((input, index) => {
  // Move to next field when a digit is entered
  input.addEventListener('input', () => {
    if (input.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  // Go back on Backspace when field is empty
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

// ==================================================================
// OTP Timer (45 seconds) + Resend Code
// ==================================================================
if (document.getElementById('timer')) {
  let time = 45;
  const timerEl = document.getElementById('timer');
  const resendLink = document.getElementById('resendLink');

  const countdown = setInterval(() => {
    time--;
    timerEl.textContent = `00:${time.toString().padStart(2, '0')}`;

    if (time <= 0) {
      clearInterval(countdown);
      timerEl.textContent = '';
      resendLink.style.pointerEvents = 'auto';
      resendLink.style.color = '#007977';
      resendLink.textContent = 'Resend Code';
    }
  }, 1000);

  // Resend OTP
  resendLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showMessage('New verification code sent!', 'success');
    time = 45;
    timerEl.textContent = '00:45';
    resendLink.style.pointerEvents = 'none';
    resendLink.style.color = '#aaa';
    resendLink.textContent = 'Resend Code';
  });
}

// ==================================================================
// Authentication Forms Handling
// ==================================================================

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
        showMessage(result.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showMessage('Server error. Please try again later.', 'error');
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
    const remember = e.target.remember?.checked;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Save token & user (persistent if "Remember me" checked)
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
        window.location.href = role === 'patient'
          ? 'patient-dashboard.html'
          : 'doctor-dashboard.html';
      }, 1200);

    } catch (err) {
      showMessage(err.message || 'Invalid credentials', 'error');
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
        showMessage('Reset link sent to your email!', 'success');
        setTimeout(() => window.location.href = 'reset-sent.html', 2000);
      } else {
        showMessage(data.message || 'Email not found', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
    }
  });
}

// OTP Verification Form
const otpForm = document.getElementById('otpForm');
if (otpForm) {
  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = Array.from(otpInputs).map(i => i.value).join('');
    if (code.length === 6) {
      showMessage('Verified successfully!', 'success');
      setTimeout(() => window.location.href = 'reset-password.html', 1000);
    } else {
      showMessage('Please enter the full 6-digit code', 'error');
    }
  });
}

// Reset Password Form
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
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    showMessage('Password changed successfully!', 'success');
    setTimeout(() => window.location.href = 'reset-success.html', 1500);
  });
}

// ==================================================================
// Dashboard Shared Features (Navbar, Sidebar, Notifications, Profile)
// ==================================================================
document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const bellIcon = document.getElementById("bellIcon");
  const notificationsMenu = document.getElementById("notificationsMenu");
  const profilePic = document.getElementById("profilePic");
  const sidebarProfileImg = document.getElementById("sidebar-profile-img");
  const sidebarUserName = document.getElementById("sidebar-user-name");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle sidebar (hamburger menu)
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));
  }

  // Close sidebar & notifications when clicking outside
  document.addEventListener("click", (e) => {
    if (sidebar?.classList.contains("active") &&
        !sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
      sidebar.classList.remove("active");
    }
    if (notificationsMenu?.classList.contains("active") &&
        !notificationsMenu.contains(e.target) && !bellIcon?.contains(e.target)) {
      notificationsMenu.classList.remove("active");
    }
  });

  // Notifications dropdown
  if (bellIcon && notificationsMenu) {
    bellIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationsMenu.classList.toggle("active");

      if (notificationsMenu.classList.contains("active") && notificationsMenu.innerHTML.trim() === "") {
        notificationsMenu.innerHTML = `
          <div style="padding: 15px; text-align: center; color: #666; font-size: 14px;">
            No notifications yet
          </div>
        `;
      }
    });
  }

  // Profile picture click → go to patient profile
  if (profilePic) {
    profilePic.style.cursor = "pointer";
    profilePic.addEventListener("click", () => window.location.href = "patient.html");
  }

  // Sidebar profile image/name click → go to profile
  [sidebarProfileImg, sidebarUserName].forEach(el => {
    if (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        window.location.href = "patient.html";
        sidebar.classList.remove("active");
      });
    }
  });

  // Sidebar menu navigation
  document.querySelectorAll("#sidebar ul li").forEach(item => {
    item.addEventListener("click", function () {
      const text = this.textContent.trim();

      if (text.includes("My Appointments")) window.location.href = "my-appointments.html";
      else if (text.includes("Medical Record")) window.location.href = "medical-record.html";
      else if (text.includes("Chats")) window.location.href = "chats.html";
      else if (text.includes("Settings")) window.location.href = "settings.html";
      else if (text.includes("Log Out") || this.id === "logoutBtn") {
        if (confirm("Are you sure you want to log out?")) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "homepage.html";
        }
      }

      sidebar.classList.remove("active");
    });
  });

  // Highlight active nav link based on current page
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentPage ||
        (currentPage === "" && link.getAttribute("href").includes("homepage"))) {
      link.classList.add("active");
    }
  });
});

// ==================================================================
// Patient Profile Page - Image Upload & Form Handling
// ==================================================================
document.addEventListener("DOMContentLoaded", function () {
  const profileInput = document.getElementById('profile-picture');
  const profilePreview = document.getElementById('profile-preview');
  const sidebarProfileImg = document.getElementById('sidebar-profile-img');
  const form = document.getElementById('patient-form');
  const cancelBtn = document.getElementById('cancel-btn');

  const PLACEHOLDER = 'assets/profile-placeholder.png'; // Update path if needed
  let currentObjectUrl = null;

  // Clean up previous object URL to prevent memory leaks
  function revokeCurrentObjectUrl() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  }

  // Profile picture preview (updates both form and sidebar)
  if (profileInput) {
    profileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      revokeCurrentObjectUrl();
      const url = URL.createObjectURL(file);
      currentObjectUrl = url;

      if (profilePreview) profilePreview.src = url;
      if (sidebarProfileImg) sidebarProfileImg.src = url;
    });
  }

  // Cancel button: reset form + restore placeholder image
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      form?.reset();
      revokeCurrentObjectUrl();
      if (profilePreview) profilePreview.src = PLACEHOLDER;
      if (sidebarProfileImg) sidebarProfileImg.src = PLACEHOLDER;
    });
  }

  // Form submit (demo - logs data, ready for API)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const payload = {
        firstName: document.getElementById('first-name')?.value || '',
        lastName: document.getElementById('last-name')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        dob: document.getElementById('dob')?.value || '',
        gender: document.getElementById('gender')?.value || '',
        bloodGroup: document.getElementById('blood-group')?.value || '',
        address1: document.getElementById('address1')?.value || '',
        address2: document.getElementById('address2')?.value || '',
        chronicIllness: document.getElementById('chronic')?.value || '',
        allergies: document.getElementById('allergies')?.value || '',
        pastSurgeries: document.getElementById('past-surgeries')?.value || '',
        currentMedication: document.getElementById('current-medication')?.value || ''
      };

      console.log('Patient Profile Saved (Demo):', payload);
      showMessage('Profile updated successfully!', 'success');

      // TODO: Send payload to backend via fetch()
      // await fetch(`${API_BASE}/patient/profile`, { method: 'PUT', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } })
    });
  }
});