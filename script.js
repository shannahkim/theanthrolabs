// Anthrolabs — small interactions

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Waitlist form -> Netlify Forms (submits to the site root, no third party)
const form = document.getElementById("waitlist-form");
const msg = document.getElementById("waitlist-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "waitlist__msg";
  msg.textContent = "";

  const btn = form.querySelector("button");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Adding you…";

  // Netlify collects form posts sent to any path on the site as urlencoded data.
  const body = new URLSearchParams(new FormData(form)).toString();

  try {
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
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
