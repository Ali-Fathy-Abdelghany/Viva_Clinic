const API_BASE = window.API_BASE || "http://127.0.0.1:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const phone = document.getElementById("phone");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const btnAdd = document.querySelector(".btn-add");
  const btnCancel = document.querySelector(".btn-cancel");

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const validatePayload = (payload) => {
    const missing = [];
    if (!payload.FirstName) missing.push("first name");
    if (!payload.LastName) missing.push("last name");
    if (!payload.Email) missing.push("email");
    if (!payload.Password) missing.push("password");
    if (!payload.Phone) missing.push("phone number");
    return missing;
  };

  const submitAdmin = async () => {
    const token = getToken();
    if (!token) {
      alert("Please log in as an admin first.");
      window.location.href = "login.html";
      return;
    }

    const payload = {
      FirstName: firstName?.value.trim(),
      LastName: lastName?.value.trim(),
      Email: email?.value.trim(),
      Password: password?.value,
      Phone: phone?.value.trim(),
    };

    const missing = validatePayload(payload);
    if (missing.length) {
      alert(`Please provide: ${missing.join(", ")}.`);
      return;
    }

    try {
      btnAdd.disabled = true;
      btnAdd.textContent = "Adding...";

      const res = await fetch(`${API_BASE}/admin/admins`, {
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
        throw new Error(data?.message || "Failed to create admin");
      }

      alert("Admin created successfully.");
      window.location.href = "admin-dashboard.html";
    } catch (err) {
      console.error("Error creating admin", err);
      alert(err.message || "Unable to create admin. Please try again.");
    } finally {
      btnAdd.disabled = false;
      btnAdd.textContent = "Add Admin";
    }
  };

  btnAdd?.addEventListener("click", (e) => {
    e.preventDefault();
    submitAdmin();
  });

  btnCancel?.addEventListener("click", () => {
    window.location.href = "admin-dashboard.html";
  });
});
