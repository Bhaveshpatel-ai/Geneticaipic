import { getFirestore, doc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const auth = getAuth();
const db = getFirestore();

const buyButtons = document.querySelectorAll(".buy-btn");

buyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = btn.dataset.plan;
    startPayment(plan);
  });
});

async function startPayment(planType) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to upgrade!");
    window.location.href = "index.html";
    return;
  }

  // Plan pricing
  const planDetails = {
    monthly: { amount: 99 * 100, duration: "1 Month" },
    yearly: { amount: 799 * 100, duration: "12 Months" },
  };

  const options = {
    key: "RAZORPAY_KEY_ID", // Replace with your real key or env var
    amount: planDetails[planType].amount,
    currency: "INR",
    name: "Real Pic AI",
    description: `Upgrade to ${planDetails[planType].duration} Premium`,
    theme: { color: "#ffcc33" },
    handler: async function (response) {
      alert(`✅ Payment Successful! ID: ${response.razorpay_payment_id}`);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        plan: "premium",
        paymentId: response.razorpay_payment_id,
        planType,
        upgradedAt: new Date().toISOString(),
      });

      localStorage.setItem("plan", "premium");
      window.location.href = "home.html";
    },
    prefill: {
      name: user.displayName || "User",
      email: user.email,
    },
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
