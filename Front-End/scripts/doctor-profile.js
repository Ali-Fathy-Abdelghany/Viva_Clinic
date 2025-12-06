const API_BASE_URL = 'http://localhost:3000/api';

function getDoctorIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchDoctorData(doctorId) {
    if (!doctorId) {
        document.querySelector('.doctor-card .details h1').textContent = 'Error: Doctor ID Missing.';
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
        document.querySelector('.doctor-card .details h1').textContent = 'Doctor Not Found';
        return null;
    }
}


function generateWorkingHoursHTML(workingHours) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let html = '<ul class="working-hours-list" style="list-style: none; padding: 0;">';

    if (!workingHours || workingHours.length === 0) {
        return '<p style="margin-top: 10px;">Working hours not specified for this doctor.</p>';
    }
    
    workingHours.forEach(hour => {
        const dayName = days[hour.DayOfWeek] || 'Unknown Day';
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



function renderDoctorData(doctor) {
    if (!doctor) return;

    const { 
        user, 
        specialty, 
        Bio, 
        DoctorID, 
        Fee, 
        YearsOfExperience, 
        Education,
        Image_url,
        workingHours = null,
        Awards = null,
        Certifications = null 
    } = doctor;
    
    
    const fullName = `${user.FirstName} ${user.LastName}`;
    const specialtyName = specialty ? specialty.Name : 'General Practitioner';
    const feeValue = Fee || 'N/A';
    const yearsText = YearsOfExperience ? `${YearsOfExperience}+ Years` : 'N/A';

    
    const profileImgElement = document.querySelector('.doctor-card img.profile-pic-main');
    if (profileImgElement) {
        profileImgElement.src = Image_url || 'images/doctor.png';
    }

    
    document.querySelector('.doctor-id').textContent = `Doctor ID: ${DoctorID}`;
    document.querySelector('.doctor-card .details h1').innerHTML = 
        `${fullName} <span class="badge" style="color:#007977;font-size:13px;">(${specialtyName})</span>`;
    
    const degreeElement = document.querySelector('.doctor-card .contact-info span:first-child');
    if (degreeElement) {
        degreeElement.innerHTML = `<i class="fa-solid fa-stethoscope"></i> ${Education || 'No Degree Listed'}`;
    }

    const experienceElement = document.querySelector('.doctor-card .contact-info span:last-child');
    if (experienceElement) {
        experienceElement.innerHTML = `<i class="fa-regular fa-address-card"></i> Years of Experience: ${yearsText}`;
    }
    
    
    const bookBtnContainer = document.getElementById("book-btn");
    const feeHTML = `
        <div style="text-align:right; margin-bottom:10px;">
            <p style="margin:0; font-weight:bold; font-size:14px; color:#666;">Consultation Charge</p>
            <p style="margin:0; font-size:15px; font-weight:700; color:#007977;">${feeValue} EGP / 30 Minutes</p>
        </div>
    `;
    bookBtnContainer.innerHTML = feeHTML + `
        <a href="BookAppointment.html?doctorId=${DoctorID}" class="btn-book" style="text-decoration: none;">Book Appointment</a>
    `;


   
    const phoneIcon = document.querySelector('.contact-item i.fa-phone');
    if (phoneIcon && phoneIcon.nextElementSibling) {
        phoneIcon.nextElementSibling.textContent = user.Phone || 'N/A';
    }
    
    
    const emailIcon = document.querySelector('.contact-item i.fa-envelope');
    if (emailIcon && emailIcon.nextElementSibling) {
        emailIcon.nextElementSibling.textContent = user.Email || 'N/A';
    }

   
    const bioSectionTitle = Array.from(document.querySelectorAll('.section-title')).find(el => el.textContent === 'Short Bio');
    let bioElement = null;
    
    if (bioSectionTitle && bioSectionTitle.parentElement) {
       
        
        bioElement = bioSectionTitle.parentElement.querySelector('.card-fields p');
    }

    if (bioElement) {
        bioElement.textContent = Bio || 'No bio provided.';
    } else {
        console.error('Bio element could not be found. Check your HTML structure for "Short Bio" section.');
    }

    const awardsSection = document.querySelector('.card-section:has(.section-title:contains("Awards"))');
    if (awardsSection && awardsSection.parentNode) {
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
    
    
    const awardsFields = document.querySelector('.card-section:has(.section-title:contains("Awards")) .card-fields');
    if (awardsFields) {
        awardsFields.innerHTML = '<p style="width:100%;">No Awards or Recognitions provided.</p>';
    }

    
    const certificationsFields = document.querySelector('.card-section:has(.section-title:contains("Certifications")) .card-fields');
    if (certificationsFields) {
        certificationsFields.innerHTML = '<p style="width:100%;">No Certifications provided.</p>';
    }

   
    const educationFields = document.querySelector('.card-section:has(.section-title:contains("Education Information")) .card-fields');
    if (educationFields) {
        educationFields.innerHTML = Education 
            ? `<p style="width:100%;"><strong>Institution/Degree:</strong> ${Education}</p>`
            : '<p style="width:100%;">No detailed education information provided.</p>';
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const doctorId = getDoctorIdFromUrl();
    if (doctorId) {
        const doctorData = await fetchDoctorData(doctorId);
        if (doctorData) {
            renderDoctorData(doctorData);
        }
    }
});