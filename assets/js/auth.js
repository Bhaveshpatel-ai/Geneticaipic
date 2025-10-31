// ==========================================
// 🧠 AUTH CONTROL + DAILY LIMIT + REDIRECT
// ==========================================
import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const logoutBtn = document.getElementById("logoutBtn");
const communityBtn = document.getElementById("communityBtn");
const settingsBtn = document.getElementById("settingsBtn");

let currentUser = null;
let isPremium = false;
let dailyLimit = 3;

// -------------------------------------------
// 🔐 AUTH CHECK
// -------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  const docRef = doc(db, "users", user.email);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    isPremium = data.plan === "premium" || data.plan === "admin";
    dailyLimit = isPremium ? Infinity : 3;

    // 🛡️ Admin auto-upgrade
    if (data.adminAccess === "NSYHJTJBTS") {
      await updateDoc(docRef, { plan: "premium" });
      isPremium = true;
    }
  }
});

// -------------------------------------------
// 🚪 LOGOUT
// -------------------------------------------
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("Logged out successfully!");
  window.location.href = "index.html";
});

// -------------------------------------------
// 🔗 NAVIGATION
// -------------------------------------------
communityBtn.addEventListener("click", () => {
  window.location.href = "community.html";
});
settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html";
});

// -------------------------------------------
// 📆 DAILY LIMIT CHECK FUNCTION
// -------------------------------------------
export async function canGenerateImage() {
  if (isPremium) return true;

  const today = new Date().toISOString().split("T")[0];
  const usageKey = `usage_${today}`;
  let used = localStorage.getItem(usageKey) || 0;
  used = parseInt(used);

  if (used >= dailyLimit) {
    alert("Daily limit reached! Upgrade to Bunny Premium 💎 for unlimited access.");
    return false;
  }

  localStorage.setItem(usageKey, used + 1);
  return true;
}

export function isUserPremium() {
  return isPremium;
}
