// Patient profile page logic
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const profileInput = document.getElementById('profile-picture');
    const profilePreview = document.getElementById('profile-preview');
    const sidebarProfileImg = document.getElementById('sidebar-profile-img');
    const form = document.getElementById('patient-form');
    const cancelBtn = document.getElementById('cancel-btn');

    let currentObjectUrl = null;
    const DEFAULT_IMAGE = profilePreview?.getAttribute('src') || 'images/assets/profile-placeholder.png';

    function revokeCurrentObjectUrl() {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
      }
    }

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

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        form?.reset();
        revokeCurrentObjectUrl();
        if (profilePreview) profilePreview.src = DEFAULT_IMAGE;
        if (sidebarProfileImg) sidebarProfileImg.src = DEFAULT_IMAGE;
      });
    }

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
        window.showMessage?.('Profile updated successfully!', 'success');
      });
    }
  });
})();
