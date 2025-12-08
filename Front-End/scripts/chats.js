// =========================
// SIMPLE FRONTEND CHAT SYSTEM
// LocalStorage Based
// =========================

// Fake list of doctors to show in sidebar
const doctors = [
  {
    id: 1,
    name: "Dr. Sara Ali",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastSeen: "07:15 PM"
  },
  {
    id: 2,
    name: "Dr. Omar Khaled",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastSeen: "Yesterday"
  },
  {
    id: 3,
    name: "Dr. Layla Hassan",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    lastSeen: "10:45 AM"
  }
];

let activeDoctorId = null;

// DOM Elements
const doctorsListElement = document.getElementById("doctorsList");
const messagesContainer = document.getElementById("messagesContainer");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.querySelector(".send-message-btn");

// =========================
// 1️⃣ LOAD DOCTOR LIST
// =========================
function loadDoctorList() {
  doctorsListElement.innerHTML = "";

  doctors.forEach(doc => {
    const item = document.createElement("div");
    item.classList.add("doctor-item");
    item.dataset.id = doc.id;

    item.innerHTML = `
      <img src="${doc.avatar}">
      <div class="doctor-info">
        <h4>${doc.name}</h4>
        <p>${doc.lastSeen}</p>
      </div>
      <div class="doctor-time">Online</div>
    `;

    item.addEventListener("click", () => {
      selectDoctor(doc.id);
    });

    doctorsListElement.appendChild(item);
  });
}

// =========================
// 2️⃣ SWITCH CHAT
// =========================
function selectDoctor(doctorId) {
  activeDoctorId = doctorId;

  document
    .querySelectorAll(".doctor-item")
    .forEach(d => d.classList.remove("active"));

  document
    .querySelector(`.doctor-item[data-id="${doctorId}"]`)
    .classList.add("active");

  const doc = doctors.find(d => d.id === doctorId);

  // Update header
  document.querySelector(".chat-conversation-header img").src = doc.avatar;
  document.querySelector(".chat-conversation-header h3").textContent = doc.name;
  document.querySelector(".chat-conversation-header p").textContent =
    "Last Seen at " + doc.lastSeen;

  loadMessages();
}

// =========================
// 3️⃣ SAVE MESSAGE
// =========================
function saveMessage(text) {
  if (!activeDoctorId) return;

  const allChats = JSON.parse(localStorage.getItem("chat_messages") || "{}");

  if (!allChats[activeDoctorId]) allChats[activeDoctorId] = [];

  allChats[activeDoctorId].push({
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    sender: "me"
  });

  localStorage.setItem("chat_messages", JSON.stringify(allChats));
}

// =========================
// 4️⃣ LOAD MESSAGES
// =========================
function loadMessages() {
  messagesContainer.innerHTML = "";

  const allChats = JSON.parse(localStorage.getItem("chat_messages") || "{}");
  const msgs = allChats[activeDoctorId] || [];

  msgs.forEach(msg => {
    addMessageBubble(msg.text, msg.time, msg.sender);
  });

  scrollToBottom();
}

// =========================
// 5️⃣ DISPLAY MESSAGE
// =========================
function addMessageBubble(text, time, sender = "me") {
  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.classList.add(sender === "me" ? "my-message" : "other-message");

  bubble.innerHTML = `
    ${text}
    <div class="message-time">${time}</div>
  `;
    
  messagesContainer.appendChild(bubble);
  scrollToBottom();
}

// Scroll to bottom
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// =========================
// 6️⃣ SEND MESSAGE EVENT
// =========================
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  
  
  if (text === "" ) return;

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  addMessageBubble(text, time, "me");
  saveMessage(text);

  messageInput.value = "";
}

// Initialize
loadDoctorList();
