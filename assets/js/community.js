import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, getDocs } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

const logoutBtn = document.getElementById("logoutBtn");
const homeBtn = document.getElementById("homeBtn");
const settingsBtn = document.getElementById("settingsBtn");
const uploadForm = document.getElementById("uploadForm");
const galleryContainer = document.getElementById("galleryContainer");

let currentUser = null;

// ---------------------------------------------
// 🧠 AUTH CHECK
// ---------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  loadUserGallery();
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
settingsBtn.addEventListener("click", () => window.location.href = "settings.html");

// ---------------------------------------------
// ⬆️ IMAGE UPLOAD
// ---------------------------------------------
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("uploadImage").files[0];
  const prompt = document.getElementById("uploadPrompt").value.trim();
  if (!file || !prompt) return alert("Please provide both image and prompt!");

  const storageRef = ref(storage, `community/${currentUser.uid}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "community_uploads"), {
    uid: currentUser.uid,
    email: currentUser.email,
    prompt: prompt,
    imageUrl: imageUrl,
    uploadedAt: new Date().toISOString()
  });

  alert("✅ Image uploaded to your private gallery!");
  uploadForm.reset();
  loadUserGallery();
});

// ---------------------------------------------
// 📂 LOAD USER GALLERY
// ---------------------------------------------
async function loadUserGallery() {
  galleryContainer.innerHTML = `<p>Loading your images...</p>`;

  const q = query(collection(db, "community_uploads"), where("uid", "==", currentUser.uid));
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    galleryContainer.innerHTML = `<p>No uploads yet. Start by uploading your first AI image!</p>`;
    return;
  }

  galleryContainer.innerHTML = "";
  querySnap.forEach((docSnap) => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${data.imageUrl}" alt="AI image">
      <p><strong>Prompt:</strong> ${data.prompt}</p>
      <p><small>Uploaded: ${new Date(data.uploadedAt).toLocaleString()}</small></p>
    `;
    galleryContainer.appendChild(card);
  });
}
