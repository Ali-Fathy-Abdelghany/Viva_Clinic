// new-doctor.js
document.addEventListener('DOMContentLoaded', () => {
  // صورة الدكتور
  const photoInput = document.getElementById('doctor-photo');
  const preview = document.getElementById('profile-preview');
  const uploadBtn = document.querySelector('.upload-btn');

  uploadBtn.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      preview.src = url;
    }
  });

  // تبويب الأيام
  document.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // إضافة صفوف جديدة
  document.querySelectorAll('.add-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.parentElement.parentElement;
      const newRow = btn.parentElement.cloneNode(true);
      newRow.querySelector('input, select').value = '';
      container.appendChild(newRow);
    });
  });

  // زر Add Doctor
  document.querySelector('.btn-add').addEventListener('click', () => {
    alert('Doctor Added Successfully! (Demo)');
  });
});