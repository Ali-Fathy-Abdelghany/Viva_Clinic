const API_BASE = window.API_BASE || "http://127.0.0.1:3000/api";
const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";

const q = (sel) => document.querySelector(sel);
const setText = (sel, value) => {
  const el = q(sel);
  if (el) el.textContent = value;
};

const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

async function safeJson(res) {
  try {
    return await res.json();
  } catch (_) {
    return {};
  }
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", headers: authHeaders });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

function clearStaticNumbers() {
  [".doctors-card .stat-number",
   ".patients-card .stat-number",
   ".appointments-card .stat-number",
   ".report-card.total .report-number",
   ".report-card.completed .report-number",
   ".report-card.cancelled .report-number",
   ".report-card.rescheduled .report-number",
   ".report-card.total-patients .report-number"
  ].forEach((sel) => setText(sel, "—"));
}

function initSimpleCharts() {
  const baseOptions = { responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } };
  const sparklines = [
    { el: "doctorsChart", data: [5, 10, 8, 12, 15, 18], color: "#14a2a0" },
    { el: "patientsChart", data: [40, 38, 45, 42, 50, 55], color: "#e74c3c", type: "line" },
    { el: "appointmentsChart", data: [60, 70, 65, 80, 85, 95], color: "#4cae4c" },
    { el: "totalAppChart", data: [100, 120, 140, 130, 150, 160], color: "#4a90e2" },
    { el: "completedChart", data: [80, 90, 100, 110, 120, 130], color: "#2ecc71" },
    { el: "cancelledChart", data: [10, 12, 14, 13, 15, 16], color: "#f1c40f" },
    { el: "rescheduledChart", data: [8, 7, 9, 8, 10, 9], color: "#e74c3c" },
  ];
  sparklines.forEach((cfg) => {
    const canvas = document.getElementById(cfg.el);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: cfg.type || "bar",
      data: { labels: cfg.data.map(() => ""), datasets: [{ data: cfg.data, backgroundColor: cfg.color, borderColor: cfg.color, fill: cfg.type === "line", borderRadius: cfg.type ? 0 : 4, barThickness: cfg.type ? undefined : 8, tension: 0.4, pointRadius: 0 }] },
      options: baseOptions,
    });
  });

  const barCtx = document.getElementById("barChart")?.getContext("2d");
  if (barCtx) {
    new Chart(barCtx, {
      type: "bar",
      data: { labels: ["Completed", "Booked", "Cancelled"], datasets: [{ data: [0, 0, 0], backgroundColor: ["#59a14f", "#f28e2c", "#e15759"] }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
    });
  }

  const doughnutCtx = document.getElementById("doughnutChart")?.getContext("2d");
  if (doughnutCtx) {
    new Chart(doughnutCtx, {
      type: "doughnut",
      data: { labels: ["Dept A", "Dept B", "Dept C"], datasets: [{ data: [1, 1, 1], backgroundColor: ["#4e79a7", "#c84e89", "#6b7280"], borderWidth: 0, cutout: "70%" }] },
      options: { responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: true } } },
    });
  }
}

function buildPopularDoctors(doctors, appts) {
  const container = q(".popular-doctors");
  if (!container) return;
  const counts = {};
  appts.forEach((a) => {
    const id = a.DoctorID || a.doctorId || a.doctor?.DoctorID;
    if (!id) return;
    counts[id] = (counts[id] || 0) + 1;
  });
  const withCounts = doctors.map((d) => ({
    id: d.DoctorID,
    name: `Dr. ${d.user?.FirstName || ""} ${d.user?.LastName || ""}`.trim(),
    specialty: d.specialty?.Name || "General",
    bookings: counts[d.DoctorID] || 0,
    photo: d.Image_url || d.ImageUrl || d.image_url || d.imageUrl || d.user?.Image_url || "images/default-avatar.png",
  }));
  withCounts.sort((a, b) => b.bookings - a.bookings);
  const top = withCounts.slice(0, 3);
  container.innerHTML = "<h2>Popular Doctors</h2>";
  if (!top.length) {
    container.innerHTML += "<p style=\"color:#666\">No doctor data available.</p>";
    return;
  }
  top.forEach((d) => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.innerHTML = `
      <img src="${d.photo}" alt="${d.name}" onerror="this.src='images/default-avatar.png'">
      <div>
        <strong>${d.name}</strong>
        <div>${d.specialty}</div>
        <span class="bookings">${d.bookings} Bookings</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function buildTopDepartments(doctors) {
  const container = q(".top-departments");
  if (!container) return;
  const counts = {};
  doctors.forEach((d) => {
    const name = d.specialty?.Name || "Other";
    counts[name] = (counts[name] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  container.innerHTML = `
    <div class="section-header">
      <h2>Top Departments</h2>
    </div>
  `;
  if (!entries.length) {
    container.innerHTML += "<p style=\"color:#666\">No department data.</p>";
    return;
  }
  const list = document.createElement("div");
  list.className = "doughnut-legend";
  entries.forEach(([name, count]) => {
    const item = document.createElement("span");
    item.textContent = `${name} - ${count}`;
    list.appendChild(item);
  });
  container.appendChild(list);
}

function buildUpcomingAppointments(appts) {
  const container = q(".upcoming-appointments");
  if (!container) return;
  const now = new Date();
  const parsed = appts
    .map((a) => {
      const dt = new Date(`${a.AppointmentDate}T${(a.StartTime || "00:00").slice(0,5)}`);
      return { ...a, dt };
    })
    .filter((a) => a.dt && !isNaN(a.dt))
    .filter((a) => a.dt >= now)
    .sort((a, b) => a.dt - b.dt)
    .slice(0, 3);
  container.innerHTML = "";
  if (!parsed.length) {
    container.innerHTML = "<div class=\"upcoming-item\">No upcoming appointments.</div>";
    return;
  }
  parsed.forEach((a) => {
    const item = document.createElement("div");
    item.className = "upcoming-item";
    const patientName = a.patient?.user ? `${a.patient.user.FirstName || ""} ${a.patient.user.LastName || ""}`.trim() : "Patient";
    const doctorName = a.doctor?.user ? `${a.doctor.user.FirstName || ""} ${a.doctor.user.LastName || ""}`.trim() : "";
    item.innerHTML = `
      <strong>${patientName}</strong>
      <div>${a.dt.toLocaleString()}</div>
      <div style="color:#64748b">${doctorName}</div>
    `;
    container.appendChild(item);
  });
}

function buildReportTable(appts) {
  const tbody = q(".report-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!appts.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#64748b;padding:12px">No appointments found.</td></tr>`;
    return;
  }
  const fmtTime = (a) => {
    const dt = new Date(`${a.AppointmentDate}T${(a.StartTime || "00:00").slice(0,5)}`);
    return dt.toLocaleString();
  };
  appts.slice(0, 10).forEach((a) => {
    const tr = document.createElement("tr");
    const patientName = a.patient?.user ? `${a.patient.user.FirstName || ""} ${a.patient.user.LastName || ""}`.trim() : "Patient";
    const doctorName = a.doctor?.user ? `${a.doctor.user.FirstName || ""} ${a.doctor.user.LastName || ""}`.trim() : "";
    tr.innerHTML = `
      <td>${fmtTime(a)}</td>
      <td>${patientName}</td>
      <td>${doctorName}</td>
      <td><span class="status ${a.Status?.toLowerCase() || ""}">${a.Status || "—"}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadDashboardData() {
  try {
    const [doctorsRes, patientsRes, appointmentsRes] = await Promise.allSettled([
      fetchJson("/doctors"),
      fetchJson("/admin/patients"),
      fetchJson("/appointments"),
    ]);

    const doctors = doctorsRes.status === "fulfilled" ? doctorsRes.value?.data?.doctors || [] : [];
    const patients = patientsRes.status === "fulfilled" ? patientsRes.value?.data?.patients || [] : [];
    const appts = appointmentsRes.status === "fulfilled" ? appointmentsRes.value?.data?.appointments || [] : [];

    setText(".doctors-card .stat-number", doctors.length);
    setText(".patients-card .stat-number", patients.length);
    setText(".appointments-card .stat-number", appts.length);

    setText(".report-card.total .report-number", appts.length);
    const completed = appts.filter((a) => a.Status === "Completed").length;
    const cancelled = appts.filter((a) => a.Status === "Cancelled").length;
    const booked = appts.filter((a) => a.Status === "Booked").length;
    setText(".report-card.completed .report-number", completed);
    setText(".report-card.cancelled .report-number", cancelled);
    setText(".report-card.booked .report-number", booked);

    setText(".report-card.total-patients .report-number", patients.length);

    buildPopularDoctors(doctors, appts);
    buildTopDepartments(doctors);
    buildUpcomingAppointments(appts);
    buildReportTable(appts);

    const barChart = Chart.getChart("barChart");
    if (barChart) {
      barChart.data.datasets[0].data = [completed, booked, cancelled];
      barChart.update();
    }
  } catch (err) {
    console.error("Failed to load dashboard data", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  clearStaticNumbers();
  initSimpleCharts();
  loadDashboardData();

  flatpickr("#appointmentsStartDate", { dateFormat: "m/d/Y", altInput: true, altFormat: "m/d/Y", allowInput: true });
  flatpickr("#appointmentsEndDate", { dateFormat: "m/d/Y", altInput: true, altFormat: "m/d/Y", allowInput: true });
  flatpickr("#patientsStartDate", { dateFormat: "m/d/Y", altInput: true, altFormat: "m/d/Y", allowInput: true });
  flatpickr("#patientsEndDate", { dateFormat: "m/d/Y", altInput: true, altFormat: "m/d/Y", allowInput: true });
});
