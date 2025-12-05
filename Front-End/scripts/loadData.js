const api_base = 'http://127.0.0.1:3000/api';
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
        const data = await checkAuth();
        if (!data) return;
        window.userData = data;
        console.log(data);
        
        const user = data.user || {};
        const patient = user.patientInfo || {};
        const avatar = patient.Image_url ?? "images/default-avatar.png";
        const fullName =
            `${user.FirstName ?? ""}  ${user.LastName ?? ""}`.trim() || "User";
        const phone = user.Phone ?? "not provided";
        const profilePic = document.getElementById("profilePic");
        const sidebarProfileImg = document.getElementById(
            "sidebar-profile-img"
        );
        const profilePicPreview = document.getElementById("profilePicPreview");
        const sidebarUserName = document.getElementsByClassName("sidebar-user-name");
        const sidebarUserEmail = document.getElementsByClassName("sidebar-user-email");
        const phoneElem = document.getElementById("sidebar-user-phone");
        const userID = document.getElementsByClassName("patient-id")[0];
        const address= document.getElementsByClassName("address")[0];
        const dobElem = document.getElementById("sidebar-user-dob");
        const bloodGroupElem = document.getElementById("sidebar-user-blood-group");
        const genderElem = document.getElementById("sidebar-user-gender");
        const profilePreview = document.getElementById("profile-preview");

        if(sidebarUserEmail) {
            for (const elem of sidebarUserEmail) {
                elem.textContent = user.Email || "N/A";
            }
        }
        if(profilePreview) profilePreview.src = avatar; 
        const genderMap = { M: "Male", F: "Female" };
        if(genderElem) genderElem.textContent = genderMap[patient.Gender] || "N/A";
        if(bloodGroupElem) bloodGroupElem.textContent = patient.BloodType || "N/A";
        if(dobElem) dobElem.textContent = patient.DateOfBirth ? new Date(patient.DateOfBirth).toLocaleDateString() : "N/A";
        if(address) address.textContent=patient.Address || "No address provided";
        if (userID) userID.textContent = patient.PatientID || "N/A";
        // if (profilePic) {
        //     for (const elem of profilePic) {
        //         elem.src = avatar;
        //     }
        // }
        if (profilePic) profilePic.src = avatar;
        if (profilePicPreview) profilePicPreview.src = avatar;
        if (phoneElem) phoneElem.textContent = phone;
        if (sidebarProfileImg) sidebarProfileImg.src = avatar;
        if (sidebarUserName) {
            for (const elem of sidebarUserName) {
                elem.textContent = fullName;
            }
        }

         // Populate medical checkboxes
        const chronicReverseMap = {
            Diabetes: 'diabetes',
            Hypertension: 'hypertension',
            Asthma: 'asthma',
            ChronicOther: 'other'
        };
        const allergyReverseMap = {
            Medication: 'medication',
            Environmental: 'environmental',
            Food: 'food',
            AllergyOther: 'other'
        };

        const medicalInfo = patient.patientMedicalInfo || [];
        medicalInfo.forEach((m) => {
            if (!m || !m.InfoType) return;
            if (m.InfoType === "ChronicDisease") {
                const val = chronicReverseMap[m.Name] || m.Name.toLowerCase();
                const el = document.querySelector(`input[name="chronic"][value="${val}"]`);
                if (el) el.checked = true;
            } else if (m.InfoType === "Allergy") {
                const val = allergyReverseMap[m.Name] || m.Name.toLowerCase();
                const el = document.querySelector(`input[name="allergies"][value="${val}"]`);
                if (el) el.checked = true;
            }
        });
    } catch (err) {
        console.error("Failed to load profile", err);
    }
});
