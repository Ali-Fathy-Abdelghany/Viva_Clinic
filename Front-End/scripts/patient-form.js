// Patient profile page logic
const genderMap = {
    M: "male",
    F: "female",
};
function showMessage(text, type = "success") {
    const msg = document.getElementById("message");
    if (!msg) return;

    msg.textContent = text;
    msg.className = type;
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 4000);
}

(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const data = window
            .checkAuth()
            .then((data) => {
                if (!data) return;
                return data;
            })
            .catch(() => null);

        const profileInput =
            document.getElementsByClassName("profile-picture")[0];
        const profilePreview = document.getElementById("profile-preview");
        const sidebarProfileImg = document.getElementById(
            "sidebar-profile-img"
        );
        const form = document.getElementById("patient-form");
        const cancelBtn = document.getElementById("cancel-btn");

        //fill input with existing data
        let user = {};
        let patient = {};
        data.then((data) => {
            if (!data) return;
            user = data.user || {};
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
        });

        let currentObjectUrl = null;
        const DEFAULT_IMAGE =
            data.user?.patientInfo?.Image_url || "images/default-avatar.png";
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
                // update user data in the api
                fetch(`${window.API_BASE}/patients/profile-picture`, {
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
                window.location.href = "PatientMedicalRecord.html";
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

                fetch(`${window.API_BASE}/patients`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }).catch(() => {
                    window.showMessage?.("Failed to update profile", "error");
                });
                window.showMessage?.(
                    "Profile updated successfully!",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "PatientMedicalRecord.html";
                }, 1500);
            });
        }
    });
})();
