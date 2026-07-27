/* ═══════════════════════════════════════════════════════════
   Anthrolabs — Seapals landing
   Page switching, waitlist state, referral sharing, FAQ.
   ═══════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const SITE      = "https://theanthrolabs.com";
  const LAUNCH    = new Date(2026, 10, 1); // 1 Nov 2026
  const BASE_LIST = 1240;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = { page: "home", name: "", email: "", submitted: false };

  /* ── announcement countdown + footer year ─────────────── */

  const days = Math.max(0, Math.ceil((LAUNCH - new Date()) / 86400000));
  $("#days-left").textContent = days.toLocaleString("en-US");
  $("#year").textContent = new Date().getFullYear();

  /* ── page switching ───────────────────────────────────── */

  const pages = $$(".page");
  const navs  = $$("[data-page-link]");

  function setPage(name, { scroll = true } = {}) {
    state.page = name;
    pages.forEach((p) => { p.hidden = p.dataset.page !== name; });
    navs.forEach((n) => {
      if (n.tagName === "BUTTON") {
        n.toggleAttribute("aria-current", n.dataset.pageLink === name);
        if (n.dataset.pageLink === name) n.setAttribute("aria-current", "page");
      }
    });
    if (location.hash.slice(1) !== name) {
      history.replaceState(null, "", name === "home" ? location.pathname : `#${name}`);
    }
    if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
  }

  navs.forEach((n) =>
    n.addEventListener("click", (e) => {
      e.preventDefault();
      setPage(n.dataset.pageLink);
    })
  );

  const initial = location.hash.slice(1);
  setPage(["home", "gim", "story"].includes(initial) ? initial : "home", { scroll: false });

  /* ── sticky email bar ─────────────────────────────────── */

  const stickybar = $("#stickybar");

  function syncSticky() {
    const y = window.scrollY || document.documentElement.scrollTop;
    stickybar.hidden = !(y > 520 && !state.submitted);
  }
  window.addEventListener("scroll", syncSticky, { passive: true });

  /* ── shared field values across all the forms ─────────── */

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

  /* ── submitted / not-submitted view swapping ──────────── */

  const greeting = () => (state.name.trim() ? `, ${state.name.trim()}` : "");

  const slug = () =>
    state.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "you";

  const referralUrl = () => `${SITE}/?ref=${slug()}`;

  function renderSubmitted() {
    $$("[data-when='idle']").forEach((el) => { el.hidden = true; });
    $$("[data-when='done']").forEach((el) => { el.hidden = false; });
    $$("[data-greet]").forEach((el) => { el.textContent = greeting(); });

    $("#list-count").textContent = (BASE_LIST + 1).toLocaleString("en-US");
    $("#queue-pos").textContent  = (BASE_LIST + 1).toLocaleString("en-US");

    const link = referralUrl();
    $("[data-referral-text]").textContent = link.replace(/^https:\/\//, "");

    const pitch = "Real Korean gim lands in the US in November — join the waitlist for 10% off:";
    $("[data-share='x']").href =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(pitch)}&url=${encodeURIComponent(link)}`;
    $("[data-share='whatsapp']").href =
      `https://wa.me/?text=${encodeURIComponent(`${pitch} ${link}`)}`;
    $("[data-share='sms']").href =
      `sms:?&body=${encodeURIComponent(`${pitch} ${link}`)}`;

    syncSticky();
  }

  /* ── waitlist submission → Netlify Forms ──────────────── */

  const errorSlot = $("[data-form-error]");

  async function postToNetlify() {
    const body = new URLSearchParams({
      "form-name": "waitlist",
      name: state.name.trim(),
      email: state.email.trim(),
      page: state.page,
    }).toString();

    const res = await fetch("/", {
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
    if (btn) { btn.disabled = true; btn.textContent = "Adding you…"; }
    errorSlot.textContent = "";

    try {
      await postToNetlify();
      state.submitted = true;
      renderSubmitted();
    } catch (err) {
      // Netlify Forms only exists on the deployed site — locally this always
      // fails, so fall through to the success state and surface a dev hint.
      if (location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
        state.submitted = true;
        renderSubmitted();
        console.info("[waitlist] local preview — submission not sent to Netlify.");
      } else {
        errorSlot.textContent = "Something went wrong. Please try again.";
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

  /* ── copy referral link ───────────────────────────────── */

  const copyBtn = $("[data-copy-link]");
  copyBtn.addEventListener("click", async () => {
    const link = referralUrl();
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = link;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1800);
  });

  /* ── FAQ accordion ────────────────────────────────────── */

  const faqItems = $$(".faq__item");
  faqItems.forEach((item) =>
    item.addEventListener("click", () => {
      const open = item.getAttribute("aria-expanded") === "true";
      faqItems.forEach((other) => {
        other.setAttribute("aria-expanded", "false");
        $(".faq__sign", other).textContent = "+";
      });
      if (!open) {
        item.setAttribute("aria-expanded", "true");
        $(".faq__sign", item).textContent = "−";
      }
    })
  );

  syncSticky();
})();
