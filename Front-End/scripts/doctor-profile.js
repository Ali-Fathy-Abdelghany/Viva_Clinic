const API_BASE_URL = 'http://localhost:3000/api';

function getDoctorId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('id');
  if (fromQuery) return fromQuery;

  try {
    const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.Role?.toLowerCase() === 'doctor' && user.UserID) {
        return user.UserID;
      }
    }
  } catch (_) {
    // ignore parse errors
  }
  return null;
}

async function fetchDoctorData(doctorId) {
  if (!doctorId) {
    const heading = document.querySelector('.doctor-card .details h1');
    if (heading) heading.textContent = 'Error: Doctor ID Missing.';
    return null;
  }
  try {
    const url = `${API_BASE_URL}/doctors/${doctorId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch doctor data for ID: ${doctorId}. Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data.doctor;
  } catch (error) {
    console.error('Error fetching doctor data:', error);
    const heading = document.querySelector('.doctor-card .details h1');
    if (heading) heading.textContent = 'Doctor Not Found';
    return null;
  }
}

function generateWorkingHoursHTML(workingHours) {
  let html = '<ul class="working-hours-list" style="list-style: none; padding: 0;">';

  if (!workingHours || workingHours.length === 0) {
    return '<p style="margin-top: 10px;">Working hours not specified for this doctor.</p>';
  }

  workingHours.forEach((hour) => {
    const dayName = hour.DayOfWeek || 'Day';
    const startTime = hour.StartTime ? hour.StartTime.substring(0, 5) : 'N/A';
    const endTime = hour.EndTime ? hour.EndTime.substring(0, 5) : 'N/A';

    html += `
      <li style="margin-bottom: 5px; display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee;">
        <strong>${dayName}:</strong>
        <span>${startTime} - ${endTime}</span>
      </li>
    `;
  });
  html += '</ul>';
  return html;
}

function findSection(titleText) {
  const titles = Array.from(document.querySelectorAll('.section-title'));
  return titles.find((t) => t.textContent.trim().toLowerCase().includes(titleText.toLowerCase()))?.closest('.card-section');
}

function renderListIntoSection(sectionTitle, items, formatter, emptyText) {
  const section = findSection(sectionTitle);
  const fields = section?.querySelector('.card-fields');
  if (!fields) return;
  if (!items || items.length === 0) {
    fields.innerHTML = `<p style="width:100%;">${emptyText}</p>`;
    return;
  }
  fields.innerHTML = '';
  items.forEach((item) => {
    const el = document.createElement('div');
    el.style.width = '100%';
    el.innerHTML = formatter(item);
    fields.appendChild(el);
  });
}

function getDoctorPhoto(doctor, fullName) {
  const user = doctor?.user || {};
  const nameForAvatar = encodeURIComponent(fullName || 'Doctor');
  return (
    doctor?.Image_url ||
    doctor?.ImageUrl ||
    doctor?.image_url ||
    doctor?.imageUrl ||
    user.Image_url ||
    user.ImageUrl ||
    user.image_url ||
    user.imageUrl ||
    `https://ui-avatars.com/api/?name=${nameForAvatar}&background=random&size=256`
  );
}

function renderDoctorData(doctor) {
  if (!doctor) return;

  const {
    user = {},
    specialty,
    Bio,
    DoctorID,
    Fee,
    YearsOfExperience,
    Education,
    Image_url,
    workingHours = [],
    doctorAwards = [],
    doctorCertifications = [],
  } = doctor;

  const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'Doctor';
  const specialtyName = specialty?.Name || 'General Practitioner';
  const feeValue = Fee ?? 'N/A';
  const yearsText = YearsOfExperience ? `${YearsOfExperience}+ Years` : 'N/A';

  const photoUrl = getDoctorPhoto(doctor, fullName);
  const profileImgElement = document.querySelector('.doctor-card img.profile-pic-main');
  if (profileImgElement) profileImgElement.src = photoUrl;
  const navPic = document.getElementById('profilePic');
  if (navPic) navPic.src = photoUrl;

  const idElem = document.querySelector('.doctor-id');
  if (idElem) idElem.textContent = `Doctor ID: ${DoctorID}`;
  const heading = document.querySelector('.doctor-card .details h1');
  if (heading) heading.innerHTML = `${fullName} <span class="badge" style="color:#007977;font-size:13px;">(${specialtyName})</span>`;

  const degreeElement = document.querySelector('.doctor-card .contact-info span:first-child');
  if (degreeElement) {
    degreeElement.innerHTML = `<i class="fa-solid fa-stethoscope"></i> ${Education || 'No Degree Listed'}`;
  }

  const experienceElement = document.querySelector('.doctor-card .contact-info span:last-child');
  if (experienceElement) {
    experienceElement.innerHTML = `<i class="fa-regular fa-address-card"></i> Years of Experience: ${yearsText}`;
  }

  const bookBtnContainer = document.getElementById('book-btn');
  if (bookBtnContainer) {
    const feeHTML = `
      <div style="text-align:right; margin-bottom:10px;">
        <p style="margin:0; font-weight:bold; font-size:14px; color:#666;">Consultation Charge</p>
        <p style="margin:0; font-size:15px; font-weight:700; color:#007977;">${feeValue} EGP / 30 Minutes</p>
      </div>
    `;
    bookBtnContainer.innerHTML = `${feeHTML}<a href="BookAppointment.html?doctorId=${DoctorID}" class="btn-book" style="text-decoration: none;">Book Appointment</a>`;
  }

  const phoneIcon = document.querySelector('.contact-item i.fa-phone');
  if (phoneIcon && phoneIcon.nextElementSibling) {
    phoneIcon.nextElementSibling.textContent = user.Phone || 'N/A';
  }

  const emailIcon = document.querySelector('.contact-item i.fa-envelope');
  if (emailIcon && emailIcon.nextElementSibling) {
    emailIcon.nextElementSibling.textContent = user.Email || 'N/A';
  }

  const bioSection = findSection('Short Bio');
  const bioElement = bioSection?.querySelector('.card-fields p');
  if (bioElement) {
    bioElement.textContent = Bio || 'No bio provided.';
  }

  const awardsSection = findSection('Awards');
  if (awardsSection?.parentNode) {
    const workingHoursHTML = generateWorkingHoursHTML(workingHours);
    const newSection = document.createElement('section');
    newSection.className = 'card';
    newSection.id = 'workingHoursSection';
    newSection.innerHTML = `
      <div class="card-section">
        <div class="section-title">Working Hours</div>
        <div class="card-fields">
          ${workingHoursHTML}
        </div>
      </div>
    `;
    awardsSection.parentNode.insertBefore(newSection, awardsSection);
  }

  renderListIntoSection(
    'Awards',
    doctorAwards,
    (a) => `<strong>${a.Award_name || 'Award'}</strong> <p>${a.Award_description || ''}</p>`,
    'No Awards or Recognitions provided.'
  );

  renderListIntoSection(
    'Certifications',
    doctorCertifications,
    (c) =>
      `<strong>${c.Title || 'Certification'}</strong>${c.Description ? ` <p>${c.Description}</p>` : ''}`,
    'No Certifications provided.'
  );

  const educationSection = findSection('Education Information');
  const educationFields = educationSection?.querySelector('.card-fields');
  if (educationFields) {
    educationFields.innerHTML = Education
      ? `<p style="width:100%;"><strong>Institution/Degree:</strong> ${Education}</p>`
      : '<p style="width:100%;">No detailed education information provided.</p>';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const doctorId = getDoctorId();
  if (doctorId) {
    const doctorData = await fetchDoctorData(doctorId);
    if (doctorData) {
      renderDoctorData(doctorData);
    }
  } else {
    const heading = document.querySelector('.doctor-card .details h1');
    if (heading) heading.textContent = 'Doctor Not Found';
  }
});
