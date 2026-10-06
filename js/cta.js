/* "Work with us": a floating button, shown from the first screen on,
   and opens a sheet with a short enquiry form (name, phone, email,
   message) that ends on a thank-you.

   Anything with data-wwu also opens the form (e.g. "Start a project").

   Where enquiries go: set FORM_ENDPOINT to a form service that accepts a
   JSON POST (for example a Formspree form URL). Until it is set, the form
   still validates and thanks the visitor, but nothing is sent anywhere. */
(function () {
  "use strict";

  const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"

  const base = (document.currentScript && document.currentScript.src.replace(/js\/cta\.js.*$/, "")) || "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- the floating button ---------- */
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "wwu-fab";
  fab.setAttribute("data-wwu", "");
  fab.innerHTML = `<span class="wwu-fab__icon"><img src="${base}assets/popcorn.svg" alt=""></span><span class="wwu-fab__label">Work with us</span>`;
  document.body.appendChild(fab);

  // it rises in on the first screen: on the home page once the intro has
  // finished and the headline has landed, elsewhere shortly after load
  const showFab = () => setTimeout(() => fab.classList.add("is-shown"), reduceMotion ? 0 : 1400);
  const intro = document.getElementById("intro");
  if (intro && !intro.classList.contains("is-done")) {
    const watch = new MutationObserver(() => {
      if (intro.classList.contains("is-done")) { watch.disconnect(); showFab(); }
    });
    watch.observe(intro, { attributes: true, attributeFilter: ["class"] });
  } else {
    showFab();
  }

  /* ---------- the sheet ---------- */
  const sheet = document.createElement("dialog");
  sheet.className = "wwu";
  sheet.setAttribute("aria-labelledby", "wwuTitle");
  sheet.innerHTML = `
    <div class="wwu__card">
      <div class="wwu__glow" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <span class="wwu__grab" aria-hidden="true"></span>
      <button class="wwu__close" type="button" aria-label="Close">×</button>
      <span class="wwu__app" aria-hidden="true"><img src="${base}assets/popcorn.svg" alt=""></span>

      <form class="wwu__form" novalidate>
        <h2 class="wwu__title" id="wwuTitle">Work with <em>Popstation</em></h2>
        <p class="wwu__sub">Tell us about your brand and we&rsquo;ll take it from first sketch to shelf.</p>

        <label class="wwu__field">
          <span class="sr-only">Full name</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>
          <input name="name" type="text" autocomplete="name" placeholder="Full name" required>
        </label>
        <label class="wwu__field">
          <span class="sr-only">Phone number</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>
          <input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="Phone number" required>
        </label>
        <label class="wwu__field">
          <span class="sr-only">Email</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>
          <input name="email" type="email" autocomplete="email" placeholder="Email" required>
        </label>
        <label class="wwu__field wwu__field--msg">
          <span class="sr-only">Message</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>
          <textarea name="message" rows="3" placeholder="What are you building? Category, launch date, quantities…" required></textarea>
        </label>
        <p class="wwu__error" role="alert" hidden></p>

        <div class="wwu__actions">
          <button class="wwu__btn" type="button" data-close>Maybe later</button>
          <button class="wwu__btn wwu__btn--go" type="submit">Send <span aria-hidden="true">→</span></button>
        </div>
      </form>

      <div class="wwu__done" hidden>
        <h2 class="wwu__title" tabindex="-1">Thank you, <em class="wwu__who">friend</em>!</h2>
        <p class="wwu__sub">We&rsquo;ve got your details. Someone from the Popstation team will be in touch soon.</p>
        <div class="wwu__actions wwu__actions--one">
          <button class="wwu__btn wwu__btn--go" type="button" data-close>← Back to the site</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(sheet);

  const form = sheet.querySelector(".wwu__form");
  const done = sheet.querySelector(".wwu__done");
  const error = sheet.querySelector(".wwu__error");
  const send = form.querySelector('[type="submit"]');

  const reset = () => {
    form.hidden = false;
    done.hidden = true;
    error.hidden = true;
    send.disabled = false;
    form.querySelectorAll(".is-bad").forEach((f) => f.classList.remove("is-bad"));
  };

  const open = () => {
    if (sheet.open) return;
    if (!done.hidden) { form.reset(); reset(); }
    sheet.showModal();
    document.documentElement.classList.add("wwu-open");
    if (!reduceMotion) requestAnimationFrame(() => sheet.classList.add("is-in"));
    else sheet.classList.add("is-in");
    setTimeout(() => form.querySelector("input").focus({ preventScroll: true }), reduceMotion ? 0 : 250);
  };
  const close = () => {
    sheet.classList.remove("is-in");
    document.documentElement.classList.remove("wwu-open");
    setTimeout(() => sheet.close(), reduceMotion ? 0 : 300);
  };

  // anything with data-wwu opens the form, including links added later
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-wwu]");
    if (!trigger) return;
    e.preventDefault();
    open();
  });
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.closest("[data-close], .wwu__close")) close();
  });
  sheet.addEventListener("cancel", (e) => { e.preventDefault(); close(); });

  // a phone number needs at least 7 digits; only digits, spaces, + - ( )
  const phone = form.elements.phone;
  const checkPhone = () => {
    const v = phone.value.trim();
    const ok = /^[0-9+()\s-]+$/.test(v) && (v.match(/[0-9]/g) || []).length >= 7;
    phone.setCustomValidity(v && !ok ? "Please enter a valid phone number." : "");
  };
  phone.addEventListener("input", checkPhone);

  // light validation: mark the fields that need attention
  form.addEventListener("input", (e) => {
    const field = e.target.closest(".wwu__field");
    if (field && e.target.checkValidity()) field.classList.remove("is-bad");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    checkPhone();
    const bad = [...form.elements].filter((el) => el.name && !el.checkValidity());
    form.querySelectorAll(".wwu__field").forEach((f) => f.classList.remove("is-bad"));
    if (bad.length) {
      bad.forEach((el) => el.closest(".wwu__field").classList.add("is-bad"));
      error.textContent = "Please fill in your name, a phone number, a valid email and a short message.";
      error.hidden = false;
      bad[0].focus();
      return;
    }
    error.hidden = true;
    const data = Object.fromEntries(new FormData(form));
    data.page = location.href;

    if (FORM_ENDPOINT) {
      send.disabled = true;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch (err) {
        send.disabled = false;
        error.textContent = "That didn't go through. Please check your connection and try again.";
        error.hidden = false;
        return;
      }
    }

    const first = data.name.trim().split(/\s+/)[0];
    sheet.querySelector(".wwu__who").textContent = first || "friend";
    form.hidden = true;
    done.hidden = false;
    done.querySelector(".wwu__title").focus();
  });
})();
