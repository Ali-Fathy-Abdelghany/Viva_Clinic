async function loadMostPopularDoctors() {
    const apiBase = window.API_BASE || "http://127.0.0.1:3000/api";
    try {
        const res = await fetch(`${apiBase}/doctors`, {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to load doctors");

        const container = document.querySelector(".doctors-container");
        if (!container) return;

        container.innerHTML = "";
        const doctors = data.data.doctors || [];

        if (doctors.length === 0) {
            container.innerHTML =
                '<p style="text-align: center; color: #666; grid-column: 1/-1;">No doctors available</p>';
            return;
        }
        console.log(doctors);
        
        // Display first 6 doctors or less
        const displayDoctors = doctors.slice(0, 6);
        
        displayDoctors.forEach((doctor) => {
            const card = document.createElement("div");
            card.className = "doctor-card";
            card.onclick = () =>
                (window.location.href = `doctor-profile.html?id=${doctor.DoctorID}`);

            const doctorName = `${doctor.user.FirstName} ${doctor.user.LastName}`;
            const specialty = doctor.specialty?.Name || "General Practice";
            const fee = doctor.Fee || "TBD";
            // Use avatar API or placeholder
            const doctorImage = `${
                doctor.Image_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    doctorName
                )}&background=random&size=128`
            }`;
            console.log(doctorImage);
            
            card.innerHTML = `
                <img src="${doctorImage}" alt="${doctorName}">
                <div class="doctor-details">
                    <h3>${doctorName}</h3>
                    <p class="specialty">${specialty}</p>
                    <p class="price">Starts from: <strong>${fee} EGP</strong></p>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading doctors:", err);
        const container = document.querySelector(".doctors-container");
        if (container) {
            container.innerHTML =
                '<p style="text-align: center; color: #d9534f; grid-column: 1/-1;">Failed to load doctors</p>';
        }
    }
}

document.addEventListener("DOMContentLoaded", loadMostPopularDoctors);
