document.addEventListener("DOMContentLoaded", () => {

    // نقرأ الـ role اللي جاية من تسجيل الدخول
    const role = localStorage.getItem("role");  

    // نجيب زرار Edit Profile
    const editButtonContainer = document.querySelector(".edit-btn");

    // لو الدكتور هو اللي داخل → نخفي الزرار
    if (role === "doctor" && editButtonContainer) {
        editButtonContainer.style.display = "none";
    }

    // لو المريض داخل → الزرار يظهر عادي
});
