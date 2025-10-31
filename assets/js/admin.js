import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
  getFirestore, collection, getDocs, query, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const logoutBtn = document.getElementById("logoutBtn");
const alertContainer = document.getElementById("alertContainer");
const totalUsersEl = document.getElementById("totalUsers");
const dailyPromptsEl = document.getElementById("dailyPrompts");
const premiumCountEl = document.getElementById("premiumCount");
const userTableBody = document.getElementById("userTableBody");

// -------------------------------
// 🧠 AUTH VALIDATION (Admin Only)
// -------------------------------
onAuthStateChanged(auth, (user) => {
  const role = localStorage.getItem("userRole");
  if (!user || role !== "admin") {
    alert("❌ Unauthorized Access! Admins only.");
    window.location.href = "index.html";
    return;
  }
  initDashboard();
});

// -------------------------------
// 🚪 LOGOUT
// -------------------------------
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
});

// -------------------------------
// 🧩 INITIALIZE DASHBOARD DATA
// -------------------------------
async function initDashboard() {
  loadUserStats();
  listenForAlerts();
  loadUserAudit();
}

// -------------------------------
// 📊 ANALYTICS OVERVIEW
// -------------------------------
async function loadUserStats() {
  const usersSnap = await getDocs(collection(db, "users"));
  const promptSnap = await getDocs(collection(db, "prompts"));

  const totalUsers = usersSnap.size;
  const premiumUsers = usersSnap.docs.filter(d => d.data().plan === "premium").length;
  const today = new Date().toISOString().split("T")[0];
  const dailyPrompts = promptSnap.docs.filter(d => d.data().date?.includes(today)).length;

  totalUsersEl.textContent = totalUsers;
  dailyPromptsEl.textContent = dailyPrompts;
  premiumCountEl.textContent = premiumUsers;
}

// -------------------------------
// 🚨 REAL-TIME UNSAFE PROMPT ALERTS
// -------------------------------
function listenForAlerts() {
  const alertsRef = query(collection(db, "alerts"), orderBy("time", "desc"));
  onSnapshot(alertsRef, (snapshot) => {
    alertContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const alertBox = document.createElement("div");
      alertBox.classList.add("alert-box");
      alertBox.innerHTML = `
        <p><strong>🚨 User:</strong> ${data.email}</p>
        <p><strong>Prompt:</strong> ${data.prompt}</p>
        <p><strong>Time:</strong> ${new Date(data.time).toLocaleString()}</p>
      `;
      alertContainer.appendChild(alertBox);
    });
  });
}

// -------------------------------
// 🧾 USER AUDIT TABLE
// -------------------------------
async function loadUserAudit() {
  const usersSnap = await getDocs(collection(db, "users"));
  userTableBody.innerHTML = "";

  usersSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.email}</td>
      <td>${data.plan === "premium" ? "💎 Premium" : "Free"}</td>
      <td>${data.totalPrompts || 0}</td>
      <td>${data.lastActive ? new Date(data.lastActive).toLocaleString() : "N/A"}</td>
    `;
    userTableBody.appendChild(row);
  });
}
