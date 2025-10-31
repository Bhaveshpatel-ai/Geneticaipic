import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const logoutBtn = document.getElementById("logoutBtn");
const homeBtn = document.getElementById("homeBtn");
const communityBtn = document.getElementById("communityBtn");
const savedGalleryBtn = document.getElementById("savedGalleryBtn");
const upgradeBtn = document.getElementById("upgradeBtn");

const emailEl = document.getElementById("userEmail");
const nameEl = document.getElementById("userName");
const planEl = document.getElementById("userPlan");

let currentUser = null;
let userRole = localStorage.getItem("userRole") || "user";

// ---------------------------------------------
// 🧠 AUTH CHECK
// ---------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  await loadUserData();
});

// ---------------------------------------------
// 🚪 LOGOUT
// ---------------------------------------------
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("Logged out successfully!");
  window.location.href = "index.html";
});

// ---------------------------------------------
// 🌐 NAVIGATION
// ---------------------------------------------
homeBtn.addEventListener("click", () => window.location.href = "home.html");
communityBtn.addEventListener("click", () => window.location.href = "community.html");
savedGalleryBtn.addEventListener("click", () => window.location.href = "gallery.html"); // optional future gallery

// ---------------------------------------------
// 💳 UPGRADE PLAN
// ---------------------------------------------
upgradeBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  alert("Redirecting to payment gateway...");
  // Dummy for now — replace with real Stripe / Razorpay integration
  await updateDoc(doc(db, "users", currentUser.email), { plan: "premium" });
  planEl.textContent = "Bunny Premium 💎";
  alert("✅ Upgrade successful! Enjoy Bunny Premium 💎");
});

// ---------------------------------------------
// 🔍 LOAD USER DATA
// ---------------------------------------------
async function loadUserData() {
  const userRef = doc(db, "users", currentUser.email);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    emailEl.textContent = currentUser.email;
    nameEl.textContent = data.username || currentUser.displayName || "User";
    
    // Admin automatically treated as premium (your rule)
    if (userRole === "admin") {
      planEl.textContent = "Bunny Premium 💎 (Admin)";
    } else {
      planEl.textContent = data.plan === "premium" ? "Bunny Premium 💎" : "Free Plan";
    }
  } else {
    emailEl.textContent = currentUser.email;
    nameEl.textContent = "New User";
    planEl.textContent = "Free Plan";
  }
}
