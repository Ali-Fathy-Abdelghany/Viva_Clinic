const API_BASE = window.API_BASE || "http://127.0.0.1:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const photoInput = document.getElementById("doctor-photo");
  const preview = document.getElementById("profile-preview");
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
  let uploadedImageDataUrl = "";

  uploadBtn?.addEventListener("click", () => photoInput.click());
  photoInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      preview.src = url;

      const reader = new FileReader();
      reader.onload = () => {
        uploadedImageDataUrl = reader.result;
      };
      reader.readAsDataURL(file);
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
      alert("Select both start and end time.");
      return;
    }
    if (start >= end) {
      alert("End time must be after start time.");
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
      const res = await fetch(`${API_BASE}/doctors/specialties`);
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

  const submitDoctor = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("Please log in as an admin first.");
      window.location.href = "login.html";
      return;
    }

    const payload = {
      FirstName: firstName.value.trim(),
      LastName: lastName.value.trim(),
      Email: email.value.trim(),
      Password: password.value,
      Phone: phone.value.trim(),
      SpecialtyID: Number(specialtySelect.value) || null,
      Bio: bio.value.trim(),
      Image_url:
        uploadedImageDataUrl ||
        (preview?.src && !preview.src.includes("doctor-placeholder") ? preview.src : ""),
      Gender: gender.value || null,
      Fee: fee.value ? Number(fee.value) : null,
      Education: buildEducation(),
      YearsOfExperience: experience.value ? Number(experience.value) : null,
      Awards: buildAwards(),
      Certifications: buildCertifications(),
    };

    if (!payload.FirstName || !payload.LastName || !payload.Email || !payload.Password || !payload.Phone || !payload.SpecialtyID) {
      alert("Please fill required fields: first name, last name, email, phone, password, specialty.");
      return;
    }

    try {
      btnAdd.disabled = true;
      btnAdd.textContent = "Adding...";

      const res = await fetch(`${API_BASE}/admin/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create doctor");
      }

      const doctorId = data?.data?.doctor?.DoctorID;

      // Send working hours if provided
      const slots = Object.values(schedule).flat();
      if (doctorId && slots.length) {
        try {
          const whRes = await fetch(`${API_BASE}/admin/doctors/${doctorId}/working-hours`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify({ workingHours: slots }),
          });
          const whData = await whRes.json();
          if (!whRes.ok) {
            console.error("Working hours error", whData);
            alert("Doctor created, but working hours failed to save.");
          } else {
            alert("Doctor and working hours saved successfully.");
          }
        } catch (err) {
          console.error("Working hours request failed", err);
          alert("Doctor created, but working hours failed to save.");
        }
      } else {
        alert("Doctor created successfully.");
      }

      window.location.href = "doctors-admin-view.html";
    } catch (err) {
      console.error(err);
      alert(`Error creating doctor: ${err.message}`);
    } finally {
      btnAdd.disabled = false;
      btnAdd.textContent = "Add Doctor";
    }
  };

  btnAdd?.addEventListener("click", (e) => {
    e.preventDefault();
    submitDoctor();
  });

  btnCancel?.addEventListener("click", () => {
    window.location.href = "doctors-admin-view.html";
  });

  fetchSpecialties();
  renderSlots();
});
