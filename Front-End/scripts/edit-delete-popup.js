document.addEventListener("DOMContentLoaded", () => {

    // ============================
    // ELEMENTS
    // ============================
    const modal = document.getElementById("actionModal");
    const cancelBtn = document.getElementById("cancelModal");
    const confirmBtn = document.getElementById("confirmModal");

    let selectedCard = null;  // the patient card that was clicked


    // ============================
    // OPEN MODAL FROM "⋮" BUTTON
    // ============================
    document.querySelectorAll(".more").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            selectedCard = btn.closest(".patient-card");
            modal.style.display = "flex";

            // Default option = Edit
            document.querySelectorAll('input[name="actionType"]').forEach(r => r.checked = false);
        });
    });


    // ============================
    // CLOSE MODAL ON OUTSIDE CLICK
    // ============================
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });


    // ============================
    // CANCEL BUTTON
    // ============================
    cancelBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });


    // ============================
    // CONFIRM BUTTON
    // ============================
    confirmBtn.addEventListener("click", () => {
        const choice = document.querySelector('input[name="actionType"]:checked');

        if (!choice) {
            alert("Please select Edit or Delete.");
            return;
        }

        const value = choice.value;

        if (value === "delete") {
            if (selectedCard) selectedCard.remove(); // =======> MAKE THIS DELETE FROM DATABASE
        }

        if (value === "edit") {
            const name = selectedCard.querySelector("h3").textContent.trim();

            // Redirect to patient.html with name parameter
            window.location.href = `patient.html?name=${encodeURIComponent(name)}`;
        }

        modal.style.display = "none";
    });

});
