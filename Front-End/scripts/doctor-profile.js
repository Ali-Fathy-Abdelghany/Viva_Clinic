const API_BASE_URL = "http://127.0.0.1:3000/api";

function showMessage(text, type = 'success') {
  console.log('bye');
  
  let msg = document.getElementById('message');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'message';
    document.body.appendChild(msg);
  };

  msg.textContent = text;
  msg.className = type;
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 4000);
}
window.showMessage = showMessage;

function getDoctorId() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("doctorId") || params.get("id");
    if (fromQuery) return fromQuery;

    try {
        const userRole =
            localStorage.getItem("userRole") ||
            sessionStorage.getItem("userRole");
        if (userRole?.toLowerCase() === "doctor") {
            return JSON.parse(
                localStorage.getItem("userID") ||
                    sessionStorage.getItem("userID") ||
                    "{}"
            );
        }
    } catch (_) {
        // ignore parse errors
    }
    return null;
}

async function fetchDoctorData(doctorId) {
    if (!doctorId) {
        const heading = document.querySelector(".doctor-card .details h1");
        if (heading) heading.textContent = "Error: Doctor ID Missing.";
        return null;
    }
    try {
        const url = `${API_BASE_URL}/doctors/${doctorId}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Failed to fetch doctor data for ID: ${doctorId}. Status: ${response.status}`
            );
        }
        const data = await response.json();
        return data.data.doctor;
    } catch (error) {
        console.error("Error fetching doctor data:", error);
        const heading = document.querySelector(".doctor-card .details h1");
        if (heading) heading.textContent = "Doctor Not Found";
        return null;
    }
}

function generateWorkingHoursHTML(workingHours) {
    let html =
        '<ul class="working-hours-list" style="list-style: none; padding: 0;">';

    if (!workingHours || workingHours.length === 0) {
        return '<p style="margin-top: 10px;">Working hours not specified for this doctor.</p>';
    }

    workingHours.forEach((hour) => {
        const dayName = hour.DayOfWeek || "Day";
        const startTime = hour.StartTime
            ? hour.StartTime.substring(0, 5)
            : "N/A";
        const endTime = hour.EndTime ? hour.EndTime.substring(0, 5) : "N/A";

        html += `
      <li style="margin-bottom: 5px; display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee;">
        <strong>${dayName}:</strong>
        <span>${startTime} - ${endTime}</span>
      </li>
    `;
    });
    html += "</ul>";
    return html;
}

function findSection(titleText) {
    const titles = Array.from(document.querySelectorAll(".section-title"));
    return titles
        .find((t) =>
            t.textContent.trim().toLowerCase().includes(titleText.toLowerCase())
        )
        ?.closest(".card-section");
}

function renderListIntoSection(sectionTitle, items, formatter, emptyText) {
    const section = findSection(sectionTitle);
    const fields = section?.querySelector(".card-fields");
    if (!fields) return;
    if (!items || items.length === 0) {
        fields.innerHTML = `<p style="width:100%;">${emptyText}</p>`;
        return;
    }
    fields.innerHTML = "";
    items.forEach((item) => {
        const el = document.createElement("div");
        el.style.width = "100%";
        el.innerHTML = formatter(item);
        fields.appendChild(el);
    });
}

// Admin delete helpers
function openDeleteModal(doctorId) {
    const modal = document.getElementById("deleteDoctorModal");
    if (!modal) return;
    modal.dataset.doctorId = doctorId;
    modal.style.display = "block";
}

function closeDeleteModal() {
    const modal = document.getElementById("deleteDoctorModal");
    if (modal) {
        modal.style.display = "none";
        delete modal.dataset.doctorId;
    }
}

async function deleteDoctorById(doctorId) {
    const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    try {
        const res = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
            method: "DELETE",
            credentials: "include",
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(payload?.message || "Failed to delete doctor");
        }
        closeDeleteModal();
        showMessage("Doctor deleted successfully", "success") 
        setTimeout(() => {
            window.location.href = "ExploreAllDoctors.html";
        }, 1500);
    } catch (err) {
        closeDeleteModal();
        showMessage(err.message, "error");
    }
}

function getDoctorPhoto(doctor, fullName) {
  const user = doctor?.user || {};
  const nameForAvatar = encodeURIComponent(fullName || 'Doctor');
  return (
    doctor?.Image_url ||
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

    const fullName =
        `${user.FirstName || ""} ${user.LastName || ""}`.trim() || "Doctor";
    const specialtyName = specialty?.Name || "General Practitioner";
    const feeValue = Fee ?? "N/A";
    const yearsText = YearsOfExperience ? `${YearsOfExperience}+ Years` : "N/A";

    const profileImgElement = document.querySelector(
        ".doctor-card img.profile-pic-main"
    );
    if (profileImgElement) {
        profileImgElement.src = Image_url || "images/doctor.png";
    }

    const idElem = document.querySelector(".doctor-id");
    if (idElem) idElem.textContent = `Doctor ID: ${DoctorID}`;
    const heading = document.querySelector(".doctor-card .details h1");
    if (heading)
        heading.innerHTML = `${fullName} <span class="badge" style="color:#007977;font-size:13px;">(${specialtyName})</span>`;

    const degreeElement = document.querySelector(
        ".doctor-card .contact-info span:first-child"
    );
    if (degreeElement) {
        degreeElement.innerHTML = `<i class="fa-solid fa-stethoscope"></i> ${
            Education || "No Degree Listed"
        }`;
    }

    const experienceElement = document.querySelector(
        ".doctor-card .contact-info span:last-child"
    );
    if (experienceElement) {
        experienceElement.innerHTML = `<i class="fa-regular fa-address-card"></i> Years of Experience: ${yearsText}`;
    }

    const bookBtnContainer = document.getElementById("book-btn");
    if (bookBtnContainer) {
        const roleFromStorage = (
            localStorage.getItem("userRole") || ""
        ).toLowerCase();

        const feeHTML = `
      <div style="text-align:right; margin-bottom:10px;">
        <p style="margin:0; font-weight:bold; font-size:14px; color:#666;">Consultation Charge</p>
        <p style="margin:0; font-size:15px; font-weight:700; color:#007977;">${feeValue} EGP / 30 Minutes</p>
      </div>
    `;

        if (roleFromStorage === "admin") {
            bookBtnContainer.innerHTML = `
        ${feeHTML}
        <div class="admin-actions" id="admin-actions">
          <div class="admin-actions-row">
            <a href="register-doctor.html?doctorId=${DoctorID}" class="btn-book" style="text-decoration: none;">Update Profile</a>
            <button id="deleteDoctorBtn" class="btn-delete" style="background:#c0392b;color:#fff;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;">Delete</button>
          </div>
        </div>
      `;
            const deleteBtn = document.getElementById("deleteDoctorBtn");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", () =>
                    openDeleteModal(DoctorID)
                );
            }
        } else {
            bookBtnContainer.innerHTML = `${feeHTML}<a href="BookAppointment.html?doctorId=${DoctorID}" class="btn-book" style="text-decoration: none;">Book Appointment</a>`;
        }
        if (roleFromStorage === "doctor") {
            bookBtnContainer.style.display = "none";
        }
    }

    const phoneIcon = document.querySelector(".contact-item i.fa-phone");
    if (phoneIcon && phoneIcon.nextElementSibling) {
        phoneIcon.nextElementSibling.textContent = user.Phone || "N/A";
    }

    const emailIcon = document.querySelector(".contact-item i.fa-envelope");
    if (emailIcon && emailIcon.nextElementSibling) {
        emailIcon.nextElementSibling.textContent = user.Email || "N/A";
    }

    const bioSection = findSection("Short Bio");
    const bioElement = bioSection?.querySelector(".card-fields p");
    if (bioElement) {
        bioElement.textContent = Bio || "No bio provided.";
    }

    const awardsSection = findSection("Awards");
    if (awardsSection?.parentNode) {
        const workingHoursHTML = generateWorkingHoursHTML(workingHours);
        const newSection = document.createElement("section");
        newSection.className = "card";
        newSection.id = "workingHoursSection";
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
        "Awards",
        doctorAwards,
        (a) =>
            `<strong>${a.Award_name || "Award"}</strong> <p>${
                a.Award_description || ""
            }</p>`,
        "No Awards or Recognitions provided."
    );

    renderListIntoSection(
        "Certifications",
        doctorCertifications,
        (c) =>
            `<strong>${c.Title || "Certification"}</strong>${
                c.Description ? ` <p>${c.Description}</p>` : ""
            }`,
        "No Certifications provided."
    );

    const educationSection = findSection("Education Information");
    const educationFields = educationSection?.querySelector(".card-fields");
    if (educationFields) {
        educationFields.innerHTML = Education
            ? `<p style="width:100%;"><strong>Institution/Degree:</strong> ${Education}</p>`
            : '<p style="width:100%;">No detailed education information provided.</p>';
    }
}

// Setup navbar links based on userRole
function setupNavbarLinks(role) {
    const navLinks = document.getElementById("nav-links");
    if (!navLinks) return;

    if (role === "doctor") {
        // Doctor navbar - simple like doctor_app.html
        navLinks.innerHTML = `
            <a href="doctor_app.html" class="nav-link">Appointments</a>
        `;
    } else if (role === "admin") {
        // Admin navbar - admin specific links
        navLinks.innerHTML = `
            <a href="admin-dashboard.html" class="nav-link">Dashboard</a>
        `;
    } else {
        // Patient navbar - default with homepage links
        navLinks.innerHTML = `
            <a href="homepage.html#home" class="nav-link" data-section="home">Home</a>
            <a href="homepage.html#doctors" class="nav-link">Most Popular</a>
            <a href="homepage.html#contact" class="nav-link">Contact</a>
        `;
    }
}

// Setup sidebar based on userRole
function setupSidebar() {
    const roleFromStorage = (
        localStorage.getItem("userRole") ||
        sessionStorage.getItem("userRole") ||
        ""
    ).toLowerCase();

    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    // Also setup navbar links based on role
    setupNavbarLinks(roleFromStorage);

    if (roleFromStorage === "admin") {
        // Admin sidebar
        sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="admin-info">
          <div class="admin-avatar">
            <img src="images/default-avatar.png" alt="Profile">
          </div>
          <span class="admin-name">ADMIN</span>
        </div>
      </div>
      <ul class="sidebar-menu">
        <li onclick="window.location.href='admin-dashboard.html'">
          <i class="fas fa-bar-chart"></i> Dashboard
        </li>
        <li onclick="window.location.href='Appointments-admin-view.html'">
          <i class="fas fa-calendar-check"></i> Appointments
        </li>
        <li onclick="window.location.href='ExploreAllDoctors.html'">
          <i class="fas fa-user-md"></i> Doctors
        </li>
        <li onclick="window.location.href='patients.html'">
          <i class="fas fa-heartbeat"></i> Patients
        </li>
        <i class="fas fa-user-plus"></i> Add New Doctor
                    </li>
                    <li onclick="window.location.href='Add New Admin.html'">
                        <i class="fas fa-user-plus"></i> Add New Admin
                    </li>
        <li id="logoutBtn" class="logout-item">
          <i class="fas fa-sign-out-alt"></i> Log Out
        </li>
      </ul>
    `;
        // Rebind logout for newly injected sidebar
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.startLogoutFlow === "function") {
                    window.startLogoutFlow();
                } else {
                    window.location.href = "login.html";
                }
            });
        }
    } else if (roleFromStorage === "doctor") {
        // Doctor sidebar
        sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="admin-info">
          <div class="admin-avatar">
            <img src="images/doctor.png" id="sidebar-profile-img" alt="Profile">
          </div>
          <span class="admin-name">Doctor Name</span>
        </div>
      </div>
      <ul class="sidebar-menu">
        <li onclick="window.location.href='doctor-profile.html'">
          <i class="fas fa-user"></i> My Profile
        </li>
        <li onclick="window.location.href='doctor_app.html'">
          <i class="fas fa-calendar"></i> Appointments
        </li>
        <li id="logoutBtn" class="logout-item">
          <i class="fas fa-sign-out-alt"></i> Log Out
        </li>
      </ul>
    `;
        // Rebind logout for newly injected sidebar
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.startLogoutFlow === "function") {
                    window.startLogoutFlow();
                } else {
                    window.location.href = "login.html";
                }
            });
        }
    } else if (roleFromStorage === "patient") {
        // Patient sidebar
        sidebar.innerHTML = `
      <div class="user-info">
        <img src="images/default-avatar.png" id="sidebar-profile-img" alt="User Avatar">
        <h3 class="sidebar-user-name">Loading...</h3>
        <p class="sidebar-user-email">loading@demo.com</p>
      </div>
      <ul class="sidebar-menu">
        <li onclick="window.location.href='MyAppointments.html'">
          <i class="fas fa-calendar-check"></i> My Appointments
        </li>
        <li onclick="window.location.href='PatientMedicalRecord.html'">
          <i class="fas fa-file-medical"></i> Medical Record
        </li>
        <li onclick="window.location.href='chats.html'">
          <i class="fas fa-comments"></i> Chats
        </li>
        <li id="logoutBtn" class="logout-item">
          <i class="fas fa-sign-out-alt"></i> Log Out
        </li>
      </ul>
    `;
        // Rebind logout for newly injected sidebar
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.startLogoutFlow === "function") {
                    window.startLogoutFlow();
                } else {
                    window.location.href = "login.html";
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    setupSidebar();
    const deleteCancel = document.getElementById("deleteDoctorCancel");
    if (deleteCancel) {
        deleteCancel.addEventListener("click", closeDeleteModal);
    }
    const deleteConfirm = document.getElementById("deleteDoctorConfirm");
    if (deleteConfirm) {
        deleteConfirm.addEventListener("click", () => {
            const modal = document.getElementById("deleteDoctorModal");
            const doctorId = modal?.dataset?.doctorId;
            if (doctorId) {
                deleteDoctorById(doctorId);
            }
        });
    }
    const doctorId = getDoctorId();
    if (doctorId) {
        const doctorData = await fetchDoctorData(doctorId);
        if (doctorData) {
            renderDoctorData(doctorData);
        }
    } else {
        const heading = document.querySelector(".doctor-card .details h1");
        if (heading) heading.textContent = "Doctor Not Found";
    }
});
