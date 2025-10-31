// 🔮 AI Engine - Handles Prompt → Image, Reverse Prompt, and Prompt Enhancer
// All keys come from Vercel or local .env (prefix VITE_)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// 🔹 Generate Image from Prompt
export async function generateImage(prompt, imageBase64 = null) {
  try {
    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            ...(imageBase64 ? [{ inline_data: { mime_type: "image/png", data: imageBase64 } }] : [])
          ]
        }
      ]
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || "Failed to generate image");

    // Gemini returns base64 or text URLs depending on model setup
    const imageBase64Out = data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;
    return imageBase64Out
      ? `data:image/png;base64,${imageBase64Out}`
      : null;
  } catch (err) {
    console.error("AI Image Generation Error:", err);
    return null;
  }
}

// 🔹 Reverse Prompt: Generates prompt from uploaded image
export async function reversePrompt(imageBase64) {
  try {
    const body = {
      contents: [
        {
          parts: [
            { text: "Analyze this image and generate a creative AI prompt that could produce a similar artistic image. Do not describe personal faces or identity." },
            { inline_data: { mime_type: "image/png", data: imageBase64 } }
          ]
        }
      ]
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No prompt generated.";
  } catch (err) {
    console.error("Reverse Prompt Error:", err);
    return "Error generating reverse prompt.";
  }
}

// 🔹 AI Prompt Enhancer (Premium)
export async function enhancePrompt(prompt) {
  try {
    const body = {
      contents: [
        {
          parts: [
            { text: `Enhance the following AI image prompt for realism and detail: "${prompt}". Keep it concise and safe.` }
          ]
        }
      ]
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
  } catch (err) {
    console.error("Prompt Enhancer Error:", err);
    return prompt;
  }
}
