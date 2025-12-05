// async function loadPatientProfile() {
//     const apiBase = window.API_BASE || 'http://localhost:3000/api';
//     try {
//         const res = await fetch(`${apiBase}/auth/profile`, {
//             method: 'GET',
//             credentials: 'include'
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error('Failed to load profile');

//         const user = data.data.user;
//         const patient = user.patientInfo;
//         const medicalInfo = patient?.patientMedicalInfo || [];

//         // Populate patient info
//         document.getElementById('sidebar-user-name').textContent = `${user.FirstName} ${user.LastName}`;
//         document.getElementById('sidebar-user-email').textContent = user.Email;
//         document.getElementById('sidebar-user-phone').textContent = user.Phone || 'N/A';
//         document.getElementById('sidebar-user-dob').textContent = patient?.DateOfBirth
//             ? new Date(patient.DateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
//             : 'N/A';
//         document.getElementById('sidebar-user-blood-group').textContent = patient?.BloodType || 'N/A';
//         document.getElementById('sidebar-user-gender').textContent = patient?.Gender === 'M' ? 'Male' : patient?.Gender === 'F' ? 'Female' : 'N/A';

//         // Update profile pictures
//         const profileUrl = patient?.Image_url || 'images/default-avatar.png';
//         const profilePic = document.getElementById('profilePic');
//         const sidebarProfileImg = document.getElementById('sidebar-profile-img');
//         const profilePicPreview = document.getElementById('profilePicPreview');

//         if (profilePic) profilePic.src = profileUrl;
//         if (sidebarProfileImg) sidebarProfileImg.src = profileUrl;
//         if (profilePicPreview) profilePicPreview.src = profileUrl;

//         // Populate medical checkboxes
//         const chronicReverseMap = {
//             Diabetes: 'diabetes',
//             Hypertension: 'hypertension',
//             Asthma: 'asthma',
//             ChronicOther: 'other'
//         };
//         const allergyReverseMap = {
//             Medication: 'medication',
//             Environmental: 'environmental',
//             Food: 'food',
//             AllergyOther: 'other'
//         };

//         medicalInfo.forEach((m) => {
//             if (!m || !m.InfoType) return;
//             if (m.InfoType === 'ChronicDisease') {
//                 const val = chronicReverseMap[m.Name] || m.Name.toLowerCase();
//                 const el = document.querySelector(`input[name="chronic"][value="${val}"]`);
//                 if (el) el.checked = true;
//             } else if (m.InfoType === 'Allergy') {
//                 const val = allergyReverseMap[m.Name] || m.Name.toLowerCase();
//                 const el = document.querySelector(`input[name="allergies"][value="${val}"]`);
//                 if (el) el.checked = true;
//             }
//         });

//     } catch (err) {
//         console.error('Error loading profile:', err);
//     }
// }

async function loadMedicalRecords() {
    const apiBase = window.API_BASE || "http://localhost:3000/api";
    try {
        const res = await fetch(`${apiBase}/patients/medical-records`, {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to load medical records");

        const tbody = document.querySelector(".medical-records-table tbody");
        if (!tbody) return;

        tbody.innerHTML = "";
        const records = data.data.medicalRecords || [];

        if (records.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">No medical records found</td></tr>';
            return;
        }

        records.forEach((record, index) => {
            const row = document.createElement("tr");
            if (index === 0) row.classList.add("highlight-row");

            const appointmentDate = new Date(
                record.appointment.AppointmentDate
            ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            const doctorName = `${record.appointment.doctor.user.FirstName} ${record.appointment.doctor.user.LastName}`;
            const specialty =
                record.appointment.doctor.specialty?.Name || "N/A";

            row.innerHTML = `
                <td>${specialty}</td>
                <td>${doctorName}</td>
                <td>${appointmentDate}</td>
                <td>
                    <i class="fas fa-file-alt action-icon" onclick="openPrescriptionModal(${record.RecordID})"></i> 
                    <i class="fas fa-download action-icon" onclick="downloadPrescription(${record.RecordID})"></i>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Store records globally for modal access
        window.medicalRecordsData = records;
    } catch (err) {
        console.error("Error loading medical records:", err);
        window.showMessage?.("Failed to load medical records", "error");
    }
}

function openPrescriptionModal(recordId) {
    const record = window.medicalRecordsData?.find(
        (r) => r.RecordID === recordId
    );
    if (!record) return;

    const modal = document.getElementById("prescriptionModal");
    if (!modal) return;

    // Get patient data from page
    const patientName =
        document.querySelector(".sidebar-user-name")?.textContent || "N/A";
    const patientGender =
        document.getElementById("sidebar-user-gender")?.textContent || "N/A";
    const patientDOB = document.getElementById("sidebar-user-dob")?.textContent;

    // Calculate age from DOB
    let age = "N/A";
    if (patientDOB && patientDOB !== "N/A") {
        // const dobParts = patientDOB.split("/");
        // console.log(dobParts);

        // if (dobParts.length === 3) {
        //     const monthMap = {
        //         Jan: 0,
        //         Feb: 1,
        //         Mar: 2,
        //         Apr: 3,
        //         May: 4,
        //         Jun: 5,
        //         Jul: 6,
        //         Aug: 7,
        //         Sep: 8,
        //         Oct: 9,
        //         Nov: 10,
        //         Dec: 11,
        //     };
        //     const dob = new Date(
        //         dobParts[2],
        //         monthMap[dobParts[1]],
        //         dobParts[0]
        //     );
        //     age = new Date().getFullYear() - dob.getFullYear();
        // }

        const dob = new Date(patientDOB);
        age = new Date().getFullYear() - dob.getFullYear();
    }

    // Populate modal with data
    const doctorImageUrl = record.appointment.doctor.Image_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            record.appointment.doctor.user.FirstName + " " + record.appointment.doctor.user.LastName
        )}&background=random&size=128`;
    const doctorName = `${record.appointment.doctor.user.FirstName} ${record.appointment.doctor.user.LastName}`;
    const specialty = record.appointment.doctor.specialty?.Name || "N/A";
    const appointmentDate = new Date(
        record.appointment.AppointmentDate
    ).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    // Update modal content
    modal.querySelector(
        ".doctor-profile-pic"
    ).src=doctorImageUrl
    modal.querySelector(
        ".doctor-info p strong"
    ).textContent = `Dr. ${doctorName}`;
    modal.querySelector(".specialty-hashtag").textContent = `#${specialty}`;
    modal.querySelector(".date-box span").textContent = appointmentDate;

    modal.querySelector(
        ".patient-details-modal p:nth-child(1)"
    ).innerHTML = `<strong>Patient Name:</strong> ${patientName}`;
    modal.querySelector(
        ".patient-details-modal p:nth-child(2)"
    ).innerHTML = `<strong>Age:</strong> ${age}`;
    modal.querySelector(
        ".patient-details-modal p:nth-child(3)"
    ).innerHTML = `<strong>Gender:</strong> ${patientGender}`;

    const diagnosisBox = modal.querySelectorAll(".input-display-box")[0];
    const drugBox = modal.querySelectorAll(".input-display-box")[1];

    if (diagnosisBox) diagnosisBox.textContent = record.Diagnosis || "N/A";
    if (drugBox) drugBox.textContent = record.Drug || "N/A";

    // Show modal
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("prescriptionModal");
    if (modal) modal.style.display = "none";
}

function downloadPrescription(recordId) {
    const toast = document.getElementById("downloadToast");
    if (toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
    console.log("Downloading prescription for record:", recordId);
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
    const modal = document.getElementById("prescriptionModal");
    if (e.target === modal) closeModal();
});

document.addEventListener("DOMContentLoaded", () => {
    loadMedicalRecords();
});
