/* ═══════════════════════════════════════════════════════════
   바른명란김 — 국내용 랜딩 (t1)
   웨이트리스트 제출 → Netlify Forms
   ═══════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = { name: "", email: "", submitted: false };

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const emailFields = $$("[data-email-sync]");
  const nameFields  = $$("[data-name-sync]");

  emailFields.forEach((f) =>
    f.addEventListener("input", () => {
      state.email = f.value;
      emailFields.forEach((o) => { if (o !== f) o.value = f.value; });
    })
  );
  nameFields.forEach((f) =>
    f.addEventListener("input", () => {
      state.name = f.value;
      nameFields.forEach((o) => { if (o !== f) o.value = f.value; });
    })
  );

  const greeting = () => (state.name.trim() ? `, ${state.name.trim()}` : "");

  function renderSubmitted() {
    $$("[data-when='idle']").forEach((el) => { el.hidden = true; });
    $$("[data-when='done']").forEach((el) => { el.hidden = false; });
    $$("[data-greet]").forEach((el) => { el.textContent = greeting(); });
  }

  const errorSlot = $("[data-form-error]");

  async function postToNetlify() {
    const body = new URLSearchParams({
      "form-name": "myeongran-waitlist",
      name: state.name.trim(),
      email: state.email.trim(),
    }).toString();

    const res = await fetch("/t1/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  async function submit(form) {
    if (state.submitted) return;

    const email = (form.querySelector("[data-email-sync]")?.value || state.email).trim();
    if (!email) return;
    state.email = email;

    const nameInput = form.querySelector("[data-name-sync]");
    if (nameInput) state.name = nameInput.value;

    const btn = form.querySelector("button[type='submit'], button:not([type])");
    const label = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.textContent = "등록 중…"; }
    if (errorSlot) errorSlot.textContent = "";

    try {
      await postToNetlify();
      state.submitted = true;
      renderSubmitted();
    } catch (err) {
      if (location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
        state.submitted = true;
        renderSubmitted();
        console.info("[waitlist] local preview — submission not sent to Netlify.");
      } else if (errorSlot) {
        errorSlot.textContent = "문제가 발생했어요. 다시 시도해주세요.";
        console.error(err);
      }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    }
  }

  $$("[data-waitlist-inline], .fullform").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submit(form);
    })
  );
})();
