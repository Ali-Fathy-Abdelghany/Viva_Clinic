

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // true/false   
 const userName = localStorage.getItem("userName") || "";
const userEmail = localStorage.getItem("userEmail") || "";
const userPhoto = localStorage.getItem("userPhoto") || "default-avatar.png";

/* localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("userName", "Hossam Elsokary");
localStorage.setItem("userEmail", "Hossam@example.com");
localStorage.setItem("userPhoto", "default-avatar.png"); */



const navRight = document.getElementById('navRight');
const sidebarContent = document.getElementById('sidebarContent');

if (isLoggedIn) {
  navRight.innerHTML = `
    <i class="fas fa-bell"></i>
    <img src="${userPhoto}" class="profile-pic" id="profilePic">
  `;

  sidebarContent.innerHTML = `
    <div class="user-info">
      <img src="${userPhoto}" alt="${userName}">
      <h3>${userName}</h3>
      <p>${userEmail}</p>
    </div>
    <ul>
    <li><i class="fas fa-calendar-check"></i> My Appointments</li>
    <li><i class="fas fa-file-medical"></i> Medical Record</li>
    <li><i class="fas fa-comments"></i> Chats</li>
    <li><i class="fas fa-cog"></i> Settings</li>
    <li id="logoutBtn" class="logout-item"><i class="fas fa-sign-out-alt"></i> Log Out</li>
    </ul> 
`;

} else {
  navRight.innerHTML = `
    <i class="fas fa-bell"></i>
    <a href="login.html" class="login-btn">Login</a>
    <a href="medical.html" class="signup-btn">Sign Up</a>
  `;

  sidebarContent.innerHTML = `
    <div style="text-align:center;padding:20px 20px;">
      <i class="fas fa-user-circle" style="font-size:80px;color:#007977;"></i><br><br>
      <a href="login.html" style="color:#007977;font-weight:bold;font-size:18px;">Log in to your account</a>
    </div>
  `;
}

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('active');
});

document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar.contains(e.target) && e.target.id !== 'menuBtn' && e.target.id !== 'profilePic') {
    sidebar.classList.remove('active');
  }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhoto");
    location.reload();
    });

