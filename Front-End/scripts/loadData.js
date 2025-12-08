const api_base = "http://127.0.0.1:3000/api";

function showMessage(text, type = 'success') {
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

// Get specific patient ID from URL query parameter (e.g., ?patientId=123)
function getPatientIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("patientId");
}

// Fetch data: either specific patient (if patientId in URL) or current user
async function fetchPatientData() {
    const specificPatientId = getPatientIdFromURL();

    try {
        if (specificPatientId) {
            // Admin/Doctor viewing specific patient
            const res = await fetch(
                `${api_base}/patients/${specificPatientId}`,
                {
                    credentials: "include",
                }
            );
            if (!res.ok) throw new Error("Failed to fetch patient data");
            const data = await res.json();
            const edit_btn = document.getElementsByClassName("btn-edit")[0];
            if(edit_btn )edit_btn.onclick = () => {
                window.location.href = `patient-form.html?patientId=${specificPatientId}`;
            };
            return data.data?.patient;
        } else {
            // Patient viewing own profile
            const res = await fetch(`${api_base}/auth/profile`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Not logged in");
            const data = await res.json();
            return data.data?.user;
        }
    } catch (err) {
        console.error("Error fetching patient data:", err);
        return null;
    }
}

async function checkAuth() {
    try {
        const res = await fetch(`${api_base}/auth/profile`, {
            credentials: "include", // SEND COOKIE AUTOMATICALLY
        });
        if (!res.ok) throw new Error("Not logged in");

        const data = await res.json();
        return data.data;
    } catch {
        return null;
    }
}
window.checkAuth = checkAuth;

// Initialize profile UI once DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
    try {
        // Determine if we should fetch specific patient or current user
        const specificPatientId = getPatientIdFromURL();
        let userData;
        let currentUserData;

        if (specificPatientId) {
            // Admin/Doctor viewing specific patient
            // First get current logged-in user for navbar/sidebar
            const authData = await checkAuth();
            if (!authData) return;
            currentUserData = authData.user;
            
            // Then fetch specific patient data for page content
            userData = await fetchPatientData();
            if (!userData) {
                console.error("Failed to load patient data");
                return;
            }
        } else {
            // Patient viewing own profile
            const authData = await checkAuth();
            if (!authData) return;
            userData = authData.user;
            currentUserData = userData; // Same user for both
        }
        
        const user = userData || {};
        const patient = user.patientInfo || {};
        
        // For navbar/sidebar, always use currentUserData
        const currentUser = currentUserData || {};
        const currentPatient = currentUser.patientInfo || currentUser.doctorInfo || {};
        const currentAvatar = currentPatient.Image_url ?? "images/default-avatar.png";
        const currentFullName =
            `${currentUser.FirstName ?? ""}  ${currentUser.LastName ?? ""}`.trim() || "User";
        const currentPhone = currentUser.Phone ?? "not provided";
        
        // For page content, use userData (the specific patient if viewing as admin/doctor)
        const avatar = patient.Image_url ?? "images/default-avatar.png";
        const fullName =
            `${user.FirstName ?? ""}  ${user.LastName ?? ""}`.trim() || "User";
        console.log(user.Phone);
        
        const phone = user.Phone ?? "not provided";
        const profilePic = document.getElementById("profilePic");
        
        const sidebarProfileImg = document.getElementById(
            "sidebar-profile-img"
        );
        const profilePicPreview = document.getElementById("profilePicPreview");
        const sidebarUserName =
            document.getElementsByClassName("sidebar-user-name");
        const sidebarUserEmail =
            document.getElementsByClassName("sidebar-user-email");
        const phoneElem = document.getElementById("sidebar-user-phone");
        const userID = document.getElementsByClassName("patient-id")[0];
        const address = document.getElementsByClassName("address")[0];
        const dobElem = document.getElementById("sidebar-user-dob");
        const bloodGroupElem = document.getElementById(
            "sidebar-user-blood-group"
        );
        const genderElem = document.getElementById("sidebar-user-gender");
        const profilePreview = document.getElementById("profile-preview");
        const adminName=document.getElementsByClassName("admin-name")[0];
        // Navbar/Sidebar elements - use currentUserData
        if (profilePic) profilePic.src = currentAvatar;
        if (sidebarProfileImg) sidebarProfileImg.src = currentAvatar;
        if (sidebarUserName) {
            for (const elem of sidebarUserName) {
                // Only update first occurrence (sidebar), keep others for page content
                if (elem === sidebarUserName[0]) {
                    elem.textContent = currentFullName;
                }
            }
        }
        if (sidebarUserEmail) {
            for (const elem of sidebarUserEmail) {
                // Only update first occurrence (sidebar)
                if (elem === sidebarUserEmail[0]) {
                    elem.textContent = currentUser.Email || "N/A";
                }
            }
        }

        // Page content elements - use userData (specific patient)
        if (profilePreview) profilePreview.src = avatar;
        if (profilePicPreview) profilePicPreview.src = avatar;
        
        // Update page-specific content (non-sidebar/navbar elements)
        const genderMap = { M: "Male", F: "Female" };
        if (genderElem) genderElem.textContent = genderMap[patient.Gender] || "N/A";
        if (bloodGroupElem) bloodGroupElem.textContent = patient.BloodType || "N/A";
        if (dobElem) dobElem.textContent = patient.DateOfBirth
            ? new Date(patient.DateOfBirth).toLocaleDateString()
            : "N/A";
        if (address) address.textContent = patient.Address || "No address provided";
        if (userID) userID.textContent = patient.PatientID || "N/A";
        if (phoneElem) phoneElem.textContent = phone;
        if(adminName) adminName.textContent= currentFullName;
        // Update remaining sidebarUserName elements (page content only)
        if (sidebarUserName && sidebarUserName.length > 1) {
            for (let i = 1; i < sidebarUserName.length; i++) {
                sidebarUserName[i].textContent = fullName;
            }
        }
        
        // Update remaining sidebarUserEmail elements (page content only)
        if (sidebarUserEmail && sidebarUserEmail.length > 1) {
            for (let i = 1; i < sidebarUserEmail.length; i++) {
                sidebarUserEmail[i].textContent = user.Email || "N/A";
            }
        }

        // Populate medical checkboxes
        const chronicReverseMap = {
            Diabetes: "diabetes",
            Hypertension: "hypertension",
            Asthma: "asthma",
            ChronicOther: "other",
        };
        const allergyReverseMap = {
            Medication: "medication",
            Environmental: "environmental",
            Food: "food",
            AllergyOther: "other",
        };

        const medicalInfo = patient.patientMedicalInfo || [];
        medicalInfo.forEach((m) => {
            if (!m || !m.InfoType) return;
            if (m.InfoType === "ChronicDisease") {
                const val = chronicReverseMap[m.Name] || m.Name.toLowerCase();
                const el = document.querySelector(
                    `input[name="chronic"][value="${val}"]`
                );
                if (el) el.checked = true;
            } else if (m.InfoType === "Allergy") {
                const val = allergyReverseMap[m.Name] || m.Name.toLowerCase();
                const el = document.querySelector(
                    `input[name="allergies"][value="${val}"]`
                );
                if (el) el.checked = true;
            }
        });
        
        // Expose userData to window so patient-form.js can access it
        window.userData = userData;
    } catch (err) {
        console.error("Failed to load profile", err);
    }
});
