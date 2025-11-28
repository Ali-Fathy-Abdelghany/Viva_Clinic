// OTP verification page logic
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const otpInputs = document.querySelectorAll('.otp-inputs input');
    const timerEl = document.getElementById('timer');
    const resendLink = document.getElementById('resendLink');
    const form = document.getElementById('otpForm');

    if (otpInputs.length) {
      otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
          if (input.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !input.value && index > 0) {
            otpInputs[index - 1].focus();
          }
        });
      });
    }

    if (timerEl && resendLink) {
      let time = 45;
      const updateTimer = () => timerEl.textContent = `00:${time.toString().padStart(2, '0')}`;
      updateTimer();
      resendLink.style.pointerEvents = 'none';
      resendLink.style.color = '#aaa';

      const countdown = setInterval(() => {
        time--;
        updateTimer();
        if (time <= 0) {
          clearInterval(countdown);
          timerEl.textContent = '';
          resendLink.style.pointerEvents = 'auto';
          resendLink.style.color = '#007977';
          resendLink.textContent = 'Resend Code';
        }
      }, 1000);

      resendLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.showMessage?.('New verification code sent!', 'success');
        time = 45;
        updateTimer();
        resendLink.style.pointerEvents = 'none';
        resendLink.style.color = '#aaa';
        resendLink.textContent = 'Resend Code';
      });
    }

    if (form && otpInputs.length) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = Array.from(otpInputs).map(i => i.value).join('');
        if (code.length === 6) {
          window.showMessage?.('Verified successfully!', 'success');
          setTimeout(() => window.location.href = 'reset-password.html', 1000);
        } else {
          window.showMessage?.('Please enter the full 6-digit code', 'error');
        }
      });
    }
  });
})();
