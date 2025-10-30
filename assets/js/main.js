// 🌐 Main Logic for Real Pic AI - Handles generation, upload, and UI
import { generateImage, reversePrompt, enhancePrompt } from "./ai-engine.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const auth = getAuth();

// DOM Elements
const promptInput = document.getElementById("promptInput");
const uploadInput = document.getElementById("uploadImage");
const generateBtn = document.getElementById("generateBtn");
const modeToggle = document.getElementById("modeToggle");
const outputContainer = document.getElementById("outputContainer");
const enhancerToggle = document.getElementById("enhancerToggle");

let generationMode = "prompt"; // 'prompt', 'reverse', 'both'
let imageBase64 = null;
let currentUser = null;
let userPlan = localStorage.getItem("userPlan") || "free";
let userRole = localStorage.getItem("userRole") || "user";

// 🧠 Auth Check
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  currentUser = user;
});

// 📸 Convert uploaded image to base64
uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => (imageBase64 = reader.result.split(",")[1]);
  reader.readAsDataURL(file);
});

// 🔄 Toggle Mode
modeToggle.addEventListener("change", (e) => {
  generationMode = e.target.value;
});

// 🎨 Generate Button
generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt && !imageBase64) {
    alert("Please enter a prompt or upload an image.");
    return;
  }

  outputContainer.innerHTML = `<p class="loading">⏳ Generating...</p>`;

  try {
    // Prompt Enhancer (Premium)
    let finalPrompt = prompt;
    if (enhancerToggle.checked && userPlan === "premium") {
      finalPrompt = await enhancePrompt(prompt);
    }

    let generatedImage = null;
    if (generationMode === "prompt") {
      generatedImage = await generateImage(finalPrompt);
    } else if (generationMode === "reverse") {
      const revPrompt = await reversePrompt(imageBase64);
      outputContainer.innerHTML = `<p class="reverse-prompt">${revPrompt}</p>`;
      return;
    } else if (generationMode === "both") {
      generatedImage = await generateImage(finalPrompt, imageBase64);
    }

    if (generatedImage) {
      outputContainer.innerHTML = `
        <div class="gold-frame">
          <img src="${generatedImage}" alt="AI Generated Image"/>
        </div>
      `;
    } else {
      outputContainer.innerHTML = `<p class="error">❌ Failed to generate image.</p>`;
    }
  } catch (err) {
    console.error(err);
    outputContainer.innerHTML = `<p class="error">⚠️ Error: ${err.message}</p>`;
  }
});
