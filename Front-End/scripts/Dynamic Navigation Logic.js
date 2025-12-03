// Helper: get cookie value by name
async function checkAuth() {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/auth/profile", {
      credentials: "include" // SEND COOKIE AUTOMATICALLY
    });
    console.log(res);
    if (!res.ok) throw new Error("Not logged in");

    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const guestNav     = document.getElementById("guestNav");
  const userNav      = document.getElementById("userNav");
  const guestSidebar = document.getElementById("guestSidebar");
  const userSidebar  = document.getElementById("userSidebar");
  const sidebar      = document.getElementById("sidebar");
  const overlay      = document.getElementById("sidebarOverlay");
  const menuBtn      = document.getElementById("menuBtn");
  const logoutBtn    = document.getElementById("logoutBtn");

  // Check authentication → using JWT cookie (you can also use localStorage if you prefer)
  const data=await checkAuth();
  console.log(data);
  const isLoggedIn = !!data;   // true if user is logged in

  // Show / hide navbar & sidebar sections according to login status
  if (isLoggedIn) {
    guestNav?.classList.add("hidden");
    userNav?.classList.remove("hidden");

    guestSidebar?.classList.add("hidden");
    userSidebar?.classList.remove("hidden");
  } else {
    guestNav?.classList.remove("hidden");
    userNav?.classList.add("hidden");

    guestSidebar?.classList.remove("hidden");
    userSidebar?.classList.add("hidden");
  }


  // Close function (reusable)
  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  // Logout → delete JWT cookie and reload page
  logoutBtn?.addEventListener("click", () => {
    // Delete cookie by setting expired date in the past
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Optional: also clear any other auth data (localStorage, etc.)
    location.reload();
  });
});