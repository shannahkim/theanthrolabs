// Anthrolabs — small interactions

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Waitlist form -> Formspree (AJAX so the user stays on the page)
const form = document.getElementById("waitlist-form");
const msg = document.getElementById("waitlist-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "waitlist__msg";
  msg.textContent = "";

  const action = form.getAttribute("action");
  const notConfigured = action.includes("YOUR_FORM_ID");

  if (notConfigured) {
    // Formspree endpoint not set yet — fail gracefully with a clear hint.
    msg.classList.add("error");
    msg.textContent =
      "Waitlist isn't connected yet. Add your Formspree form ID in index.html.";
    return;
  }

  const data = new FormData(form);
  const btn = form.querySelector("button");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Adding you…";

  try {
    const res = await fetch(action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      form.reset();
      msg.textContent = "You're on the list! We'll email you at launch. 🎉";
    } else {
      msg.classList.add("error");
      msg.textContent = "Something went wrong. Please try again.";
    }
  } catch (err) {
    msg.classList.add("error");
    msg.textContent = "Network error. Please try again.";
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
});
