// Patient profile page logic
const genderMap = {
    M: "male",
    F: "female",
};

// Get patient ID from URL query parameter
function getPatientIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("patientId");
}

function showMessage(text, type = "success") {
    const msg = document.getElementById("message");
    if (!msg) return;

    msg.textContent = text;
    msg.className = type;
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 4000);
}

(function () {
    document.addEventListener("DOMContentLoaded", async () => {
        const specificPatientId = getPatientIdFromURL();
        const profileInput =
            document.getElementsByClassName("profile-picture")[0];
        const profilePreview = document.getElementById("profile-preview");
        const sidebarProfileImg = document.getElementById(
            "sidebar-profile-img"
        );
        const form = document.getElementById("patient-form");
        const cancelBtn = document.getElementById("cancel-btn");

        // Wait for userData to be loaded by loadData.js
        let user = {};
        let patient = {};
        
        // Poll for window.userData to be set by loadData.js
        const waitForUserData = () => {
            return new Promise((resolve) => {
                const checkData = () => {
                    if (window.userData) {
                        resolve(window.userData);
                    } else {
                        setTimeout(checkData, 100);
                    }
                };
                checkData();
            });
        };

        try {
            const userData = await waitForUserData();
            user = userData || {};
            patient = user.patientInfo || {};
            document.getElementById("first-name").value = user.FirstName || "";
            document.getElementById("last-name").value = user.LastName || "";
            document.getElementById("phone").value = user.Phone || "";
            document.getElementById("email").value = user.Email || "";
            document.getElementById("dob").value = patient.DateOfBirth
                ? new Date(patient.DateOfBirth).toISOString().split("T")[0]
                : "";
            document.getElementById("gender").value =
                genderMap[patient.Gender] || "";
            document.getElementById("blood-group").value =
                patient.BloodType || "";
            document.getElementById("address1").value = patient.Address || "";
            // Populate checkboxes for medical info if available
            try {
                const meds =
                    (user.patientInfo && user.patientInfo.patientMedicalInfo) ||
                    [];
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

                meds.forEach((m) => {
                    if (!m || !m.InfoType) return;
                    if (m.InfoType === "ChronicDisease") {
                        const val =
                            chronicReverseMap[m.Name] || m.Name.toLowerCase();
                        const el = document.querySelector(
                            `input[name="chronic"][value="${val}"]`
                        );
                        if (el) el.checked = true;
                    } else if (
                        m.InfoType === "Allergy" ||
                        m.InfoType === "Allergies"
                    ) {
                        const val =
                            allergyReverseMap[m.Name] || m.Name.toLowerCase();
                        const el = document.querySelector(
                            `input[name="allergies"][value="${val}"]`
                        );
                        if (el) el.checked = true;
                    }
                });
            } catch (err) {
                console.warn("Failed to populate medical info checkboxes", err);
            }
        } catch (err) {
            console.error("Failed to load patient data", err);
            window.showMessage?.("Failed to load patient data", "error");
            return;
        }

        let currentObjectUrl = null;
        const DEFAULT_IMAGE =
            patient.Image_url || "images/default-avatar.png";
        function revokeCurrentObjectUrl() {
            if (currentObjectUrl) {
                URL.revokeObjectURL(currentObjectUrl);
                currentObjectUrl = null;
            }
        }

        if (profileInput) {
            profileInput.addEventListener("change", (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                revokeCurrentObjectUrl();
                const url = URL.createObjectURL(file);
                currentObjectUrl = url;

                const formData = new FormData();
                formData.append("image", file);
                
                // Determine endpoint based on whether viewing specific patient
                const endpoint = specificPatientId 
                    ? `${window.API_BASE}/patients/${specificPatientId}/profile-picture`
                    : `${window.API_BASE}/patients/profile-picture`;
                
                fetch(endpoint, {
                    method: "PATCH",
                    credentials: "include",
                    body: formData,
                }).catch(() => {
                    window.showMessage?.(
                        "Failed to update profile picture",
                        "error"
                    );
                });

                if (profilePreview) profilePreview.src = url;
                if (sidebarProfileImg) sidebarProfileImg.src = url;
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                if (specificPatientId) {
                    // Admin/Doctor - go back to patients list
                    window.location.href = "patients.html";
                } else {
                    // Patient - go to their medical record
                    window.location.href = "PatientMedicalRecord.html";
                }
            });
        }

        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();

                const fields = {
                    FirstName:
                        document.getElementById("first-name")?.value ||
                        user.FirstName,
                    LastName:
                        document.getElementById("last-name")?.value ||
                        user.LastName,
                    Phone:
                        document.getElementById("phone")?.value || user.Phone,
                    Email:
                        document.getElementById("email")?.value || user.Email,
                    DateOfBirth:
                        document.getElementById("dob")?.value ||
                        user.patientInfo.DateOfBirth,
                    Gender:
                        document.getElementById("gender")?.value ||
                        user.patientInfo.Gender,
                    BloodType:
                        document.getElementById("blood-group")?.value ||
                        user.patientInfo.BloodType,
                    Address:
                        document.getElementById("address1")?.value ||
                        user.patientInfo.Address,
                    ChronicDisease:
                        document.getElementById("chronic")?.value ||
                        user.patientInfo.ChronicDisease,
                    Allergies:
                        document.getElementById("allergies")?.value ||
                        user.patientInfo.Allergies,
                };

                fields.Gender =
                    fields.Gender === "male"
                        ? "M"
                        : fields.Gender === "female"
                        ? "F"
                        : fields.Gender;
                fields.BloodType =
                    fields.BloodType === "Select" ? null : fields.BloodType;
                const payload = {};
                Object.entries(fields).forEach(([key, value]) => {
                    if (value) payload[key] = value;
                });
                // Collect checkbox arrays
                const chronicChecked = Array.from(
                    document.querySelectorAll('input[name="chronic"]:checked')
                ).map((i) => i.value);
                const allergiesChecked = Array.from(
                    document.querySelectorAll('input[name="allergies"]:checked')
                ).map((i) => i.value);
                if (chronicChecked.length)
                    payload.ChronicDisease = chronicChecked;
                if (allergiesChecked.length)
                    payload.Allergies = allergiesChecked;
                console.log(payload);

                // Determine endpoint based on whether viewing specific patient
                const endpoint = specificPatientId 
                    ? `${window.API_BASE}/patients/${specificPatientId}`
                    : `${window.API_BASE}/patients`;

                fetch(endpoint, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                })
                .then(res => {
                    if (!res.ok) throw new Error("Failed to update profile");
                    window.showMessage?.(
                        "Profile updated successfully!",
                        "success"
                    );
                    setTimeout(() => {
                        if (specificPatientId) {
                            // Admin/Doctor - go back to patients list
                            window.location.href = "patients.html";
                        } else {
                            // Patient - go to their medical record
                            window.location.href = "PatientMedicalRecord.html";
                        }
                    }, 1500);
                })
                .catch(() => {
                    window.showMessage?.("Failed to update profile", "error");
                });
            });
        }
    });
})();
