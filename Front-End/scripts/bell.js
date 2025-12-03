
document.addEventListener("DOMContentLoaded", function () {
  const bell = document.getElementById("bellIcon");
  const menu = document.getElementById("notificationsMenu"); // نفس الـ ID اللي في الـ HTML
  if (!bell || !menu) return;

  let badge = document.querySelector(".notification-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "notification-badge";
    badge.textContent = "0";
    badge.style.cssText = `
      position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white;
      font-size: 10px; width: 18px; height: 18px; border-radius: 50%; display: none;
      align-items: center; justify-content: center; font-weight: bold;
    `;
    bell.parentElement.style.position = "relative";
    bell.parentElement.appendChild(badge);
  }

  let notifications = [];

  async function load() {
    try {
      // Dummy data for testing
      notifications = [
        { id: 1, title: "Dr. Sara Ali sent you your prescription.", is_read: false, type: "prescription", created_at: new Date() },
        { id: 2, title: "You have a new message from Dr. Ahmed.", is_read: true, type: "message", created_at: "2025-11-30T10:00:00" }
      ];
      
      render();
      updateBadge();
    } catch (e) { console.log(e); }
  }

  function render() {
    if (notifications.length === 0) {
      menu.innerHTML = `
        <div style="padding:15px 20px; border-bottom:1px solid #eee; font-weight:bold; background:#f8f9fa;">
          Notifications <span style="float:right;cursor:pointer;font-size:20px;">×</span>
        </div>
        <div style="text-align:center;padding:50px 20px;color:#888;">No notifications yet</div>
      `;
    } else {
      menu.innerHTML = `
        <div style="padding:15px 20px; border-bottom:1px solid #eee; font-weight:bold; background:#f8f9fa; border-radius:12px 12px 0 0;">
          Notifications <span class="close-notif" style="float:right;cursor:pointer;font-size:20px;">×</span>
        </div>
        ${notifications.map(n => `
          <div class="notif-item ${!n.is_read ? 'unread' : ''}" data-id="${n.id}" data-type="${n.type}">
            ${!n.is_read ? '<div class="unread-dot"></div>' : '<div style="width:10px;"></div>'}
            <div style="flex:1;">
              <div style="font-size:14px;">${n.title}</div>
              <small style="color:#888;">${timeAgo(n.created_at)}</small>
            </div>
          </div>
        `).join("")}
      `;
    }

    menu.querySelectorAll(".notif-item").forEach(item => {
      item.onclick = function () {
        const type = this.dataset.type;
        if (type === "prescription") location.href = "PatientMedicalRecord.html";
        if (type === "message") location.href = "chats.html";
        menu.classList.remove("show");
      };
    });

    menu.querySelector(".close-notif")?.addEventListener("click", () => menu.classList.remove("show"));
  }

  function updateBadge() {
    const unread = notifications.filter(n => !n.is_read).length;
    badge.textContent = unread;
    badge.style.display = unread > 0 ? "flex" : "none";
  }

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    return Math.floor(seconds / 86400) + "d ago";
  }

  bell.onclick = function (e) {
    e.stopPropagation();
    menu.classList.toggle("show");
    if (menu.classList.contains("show")) load();
  };

  document.addEventListener("click", function (e) {
    if (!bell.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("show");
    }
  });

  load();
});