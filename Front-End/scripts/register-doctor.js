
document.addEventListener("DOMContentLoaded", () => {
  const photoInput = document.getElementById("doctor-photo");
  const preview = document.getElementById("profile-preview-img");
  const uploadBtn = document.querySelector(".upload-btn");
  const specialtySelect = document.getElementById("specialtySelect");
  const btnAdd = document.querySelector(".btn-add");
  const btnCancel = document.querySelector(".btn-cancel");

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const phone = document.getElementById("phone");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const bio = document.getElementById("bio");
  const gender = document.getElementById("gender");
  const fee = document.getElementById("fee");
  const experience = document.getElementById("experience");
  const startTimeInput = document.getElementById("startTimeInput");
  const endTimeInput = document.getElementById("endTimeInput");
  const addSlotBtn = document.getElementById("addSlotBtn");
  const clearDayBtn = document.getElementById("clearDayBtn");
  const slotsList = document.getElementById("slotsList");

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const schedule = days.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {});
  let currentDay = "Monday";

  // Check if we're in update mode
  const params = new URLSearchParams(window.location.search);
  const doctorIdForUpdate = params.get("doctorId");
  const isUpdateMode = !!doctorIdForUpdate;

  let currentObjectUrl = null;
  let uploadedImageFile = null; // Store the actual file
  const DEFAULT_IMAGE = "images/doctor-placeholder.png";

  function revokeCurrentObjectUrl() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  }

  uploadBtn?.addEventListener("click", () => photoInput.click());
  photoInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokeCurrentObjectUrl();
    const url = URL.createObjectURL(file);
    currentObjectUrl = url;
    uploadedImageFile = file; // Store the file for later use
    preview.src = url;

    if (doctorIdForUpdate) {
      // Upload immediately for existing doctor
      const formData = new FormData();
      formData.append("image", file);
      
      fetch(`${window.API_BASE || "http://127.0.0.1:3000/api"}/doctors/${doctorIdForUpdate}/profile-picture`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update profile picture");
        console.log("Profile picture updated successfully");
      })
      .catch(err => {
        console.error("Failed to update profile picture", err);
        showMessage("Failed to update profile picture", "error");
      });
    }
  });

  const renderSlots = () => {
    if (!slotsList) return;
    const slots = schedule[currentDay] || [];
    if (!slots.length) {
      slotsList.innerHTML = `<p style="color:#666;">No slots added for ${currentDay}</p>`;
      return;
    }
    slotsList.innerHTML = "";
    slots.forEach((slot, idx) => {
      const div = document.createElement("div");
      div.className = "slot-pill";
      div.textContent = `${slot.StartTime} - ${slot.EndTime}`;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-slot";
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        schedule[currentDay].splice(idx, 1);
        renderSlots();
      });
      div.appendChild(removeBtn);
      slotsList.appendChild(div);
    });
  };

  document.querySelectorAll(".day-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".day-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentDay = tab.dataset.day;
      renderSlots();
    });
  });

  const addSlot = () => {
    const start = startTimeInput.value;
    const end = endTimeInput.value;
    if (!start || !end) {
      showMessage("Select both start and end time.", "error");
      return;
    }
    if (start >= end) {
      showMessage("End time must be after start time.", "error");
      return;
    }
    schedule[currentDay].push({ DayOfWeek: currentDay, StartTime: start, EndTime: end });
    renderSlots();
    startTimeInput.value = "";
    endTimeInput.value = "";
  };

  addSlotBtn?.addEventListener("click", addSlot);
  clearDayBtn?.addEventListener("click", () => {
    schedule[currentDay] = [];
    renderSlots();
  });

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${window.API_BASE || "http://127.0.0.1:3000/api"}/doctors/specialties`);
      const data = await res.json();
      const specialties = data?.data?.specialties || [];
      specialtySelect.innerHTML = '<option value="">Select</option>';
      specialties.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.SpecialtyID;
        opt.textContent = s.Name;
        specialtySelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed to load specialties", err);
    }
  };

  const buildEducation = () => {
    const rows = document.querySelectorAll("#education-container .repeat-row");
    const parts = [];
    rows.forEach((row) => {
      const fields = row.querySelectorAll("input");
      const degree = fields[0]?.value?.trim();
      const university = fields[1]?.value?.trim();
      const from = fields[2]?.value;
      const to = fields[3]?.value;
      if (degree || university) {
        const range = from && to ? ` (${from} - ${to})` : "";
        parts.push(`${degree || ""} ${university || ""}${range}`.trim());
      }
    });
    return parts.join("; ");
  };

  const populateEducation = (educationStr) => {
    if (!educationStr) return;
    const container = document.getElementById("education-container");
    const firstRow = container?.querySelector(".repeat-row");
    if (firstRow) {
      const inputs = firstRow.querySelectorAll("input");
      if (inputs[0]) inputs[0].value = educationStr;
    }
  };

  const buildAwards = () => {
    const rows = document.querySelectorAll("#awards-container .repeat-row");
    return Array.from(rows)
      .map((row) => {
        const inputs = row.querySelectorAll("input");
        const name = inputs[0]?.value?.trim();
        const date = inputs[1]?.value;
        if (!name) return null;
        return { name, description: date || "" };
      })
      .filter(Boolean);
  };

  const populateAwards = (awards) => {
    if (!awards || !awards.length) return;
    const container = document.getElementById("awards-container");
    if (!container) return;
    const firstRow = container.querySelector(".repeat-row");
    awards.forEach((award, idx) => {
      let row = container.querySelectorAll(".repeat-row")[idx];
      if (!row && idx > 0) {
        row = firstRow.cloneNode(true);
        container.appendChild(row);
      }
      if (row) {
        const inputs = row.querySelectorAll("input");
        if (inputs[0]) inputs[0].value = award.Award_name || "";
        if (inputs[1]) inputs[1].value = award.Award_description || "";
      }
    });
  };

  const buildCertifications = () => {
    const rows = document.querySelectorAll("#certifications-container .repeat-row");
    return Array.from(rows)
      .map((row) => {
        const inputs = row.querySelectorAll("input");
        const name = inputs[0]?.value?.trim();
        const date = inputs[1]?.value;
        if (!name) return null;
        return { name, description: date || "" };
      })
      .filter(Boolean);
  };

  const populateCertifications = (certs) => {
    if (!certs || !certs.length) return;
    const container = document.getElementById("certifications-container");
    if (!container) return;
    const firstRow = container.querySelector(".repeat-row");
    certs.forEach((cert, idx) => {
      let row = container.querySelectorAll(".repeat-row")[idx];
      if (!row && idx > 0) {
        row = firstRow.cloneNode(true);
        container.appendChild(row);
      }
      if (row) {
        const inputs = row.querySelectorAll("input");
        if (inputs[0]) inputs[0].value = cert.Title || "";
        if (inputs[1]) inputs[1].value = cert.Description || "";
      }
    });
  };

  const populateWorkingHours = (hours) => {
    if (!hours || !hours.length) return;
    hours.forEach((h) => {
      const day = h.DayOfWeek;
      if (schedule[day]) {
        schedule[day].push({
          DayOfWeek: day,
          StartTime: h.StartTime?.substring(0, 5) || h.StartTime,
          EndTime: h.EndTime?.substring(0, 5) || h.EndTime,
        });
      }
    });
    renderSlots();
  };

  const fetchDoctorData = async (doctorId) => {
    try {
      const res = await fetch(`${window.API_BASE || "http://127.0.0.1:3000/api"}/doctors/${doctorId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch doctor");
      const doctor = data?.data?.doctor;
      if (!doctor) throw new Error("Doctor not found");

      // Populate form fields
      firstName.value = doctor.user?.FirstName || "";
      lastName.value = doctor.user?.LastName || "";
      phone.value = doctor.user?.Phone || "";
      email.value = doctor.user?.Email || "";
      password.value = ""; // Don't populate password for security
      password.placeholder = "Leave blank to keep current password";
      bio.value = doctor.Bio || "";
      gender.value = doctor.Gender || "";
      fee.value = doctor.Fee || "";
      experience.value = doctor.YearsOfExperience || "";
      specialtySelect.value = doctor.SpecialtyID || "";

      if (doctor.Image_url) {
        preview.src = doctor.Image_url;
      }

      populateEducation(doctor.Education);
      populateAwards(doctor.doctorAwards || []);
      populateCertifications(doctor.doctorCertifications || []);
      populateWorkingHours(doctor.workingHours || []);

      btnAdd.textContent = "Update Doctor";
    } catch (err) {
      console.error(err);
      showMessage(`Failed to load doctor data: ${err.message}`, "error");
    }
  };

    const submitDoctor = async () => {  
    const payload = {
      FirstName: firstName.value.trim(),
      LastName: lastName.value.trim(),
      Email: email.value.trim(),
      Phone: phone.value.trim(),
      SpecialtyID: Number(specialtySelect.value) || null,
      Bio: bio.value.trim(),
      Gender: gender.value || null,
      Fee: fee.value ? Number(fee.value) : null,
      Education: buildEducation(),
      YearsOfExperience: experience.value ? Number(experience.value) : null,
      Awards: buildAwards(),
      Certifications: buildCertifications(),
    };

    // Only require password for create mode
    if (!isUpdateMode) {
      payload.Password = password.value;
    } else if (password.value.trim()) {
      payload.Password = password.value; // Only include if user wants to change it
    }

    const requiredFields = isUpdateMode 
      ? [payload.FirstName, payload.LastName, payload.Email, payload.Phone, payload.SpecialtyID]
      : [payload.FirstName, payload.LastName, payload.Email, payload.Password, payload.Phone, payload.SpecialtyID];
    
    if (requiredFields.some(f => !f)) {
      showMessage(isUpdateMode 
        ? "Please fill required fields: first name, last name, email, phone, specialty."
        : "Please fill required fields: first name, last name, email, phone, password, specialty.", "error");
      return;
    }

    try {
      btnAdd.disabled = true;
      btnAdd.textContent = isUpdateMode ? "Updating..." : "Adding...";

      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";

      let doctorId = doctorIdForUpdate;

      // For create mode, use FormData; for update, use JSON
      if (!isUpdateMode) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            if (key === 'Awards' || key === 'Certifications') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        if (uploadedImageFile) {
          formData.append('image', uploadedImageFile);
        }

        const res = await fetch(`${window.API_BASE || "http://127.0.0.1:3000/api"}/admin/doctors`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to create doctor");
        }
        doctorId = data?.data?.doctor?.DoctorID;
      } else {
        // Update mode - send JSON
        const res = await fetch(`${window.API_BASE || "http://127.0.0.1:3000/api"}/admin/doctors/${doctorIdForUpdate}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to update doctor");
        }
      }

      // Send working hours if provided
      const slots = Object.values(schedule).flat();
      
      // Remove duplicates - keep only one entry per day
      const seenDays = new Set();
      const uniqueSlots = slots.filter((slot) => {
        if (seenDays.has(slot.DayOfWeek)) {
          return false;
        }
        seenDays.add(slot.DayOfWeek);
        return true;
      });
      console.log(slots);
      
      console.log(uniqueSlots);
      
      if (doctorId && uniqueSlots.length) {
        try {
          const whRes = await fetch(`${window.API_BASE || "http://127.0.0.1:3000/api"}/admin/doctors/${doctorId}/working-hours`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ workingHours: uniqueSlots }),
          });
          const whData = await whRes.json();
          if (!whRes.ok) {
            console.error("Working hours error", whData);
            showMessage(isUpdateMode ? "Doctor updated, but working hours failed to save." : "Doctor created, but working hours failed to save.", "error");
          } else {
            showMessage(isUpdateMode ? "Doctor and working hours updated successfully." : "Doctor and working hours saved successfully.", "success");
    //         setTimeout(() => {
    //   window.location.href = "ExploreAllDoctors.html";
    // }, 1500);
          }
        } catch (err) {
          console.error("Working hours request failed", err);
          showMessage(isUpdateMode ? "Doctor updated, but working hours failed to save." : "Doctor created, but working hours failed to save.", "error");
        }
      } else {
        showMessage(isUpdateMode ? "Doctor updated successfully." : "Doctor created successfully.", "success");
        setTimeout(() => {
      window.location.href = "ExploreAllDoctors.html";
    }, 1500);
      }

    } catch (err) {
      console.error(err);
      showMessage(`Error ${isUpdateMode ? "updating" : "creating"} doctor: ${err.message}`, "error");
    } finally {
      btnAdd.disabled = false;
      btnAdd.textContent = isUpdateMode ? "Update Doctor" : "Add Doctor";
    }
    
  };

  btnAdd?.addEventListener("click", (e) => {
    e.preventDefault();
    submitDoctor();
  });

  btnCancel?.addEventListener("click", () => {
    window.location.href = "ExploreAllDoctors.html";
  });

  fetchSpecialties();
  renderSlots();

  // Load doctor data if in update mode
  if (isUpdateMode && doctorIdForUpdate) {
    fetchDoctorData(doctorIdForUpdate);
  }
});
