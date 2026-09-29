(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Intro: logo reveal ---------------- */

  const intro = document.getElementById("intro");

  const finishIntro = () => {
    if (!intro || intro.classList.contains("is-done")) return;
    intro.classList.add("is-done");
    document.body.classList.remove("is-loading");
  };

  // Each glyph: its box in the 776 x 507 logo image [x0, y0, x1, y1],
  // panel colour, glyph colour and entrance.
  const LOGO_W = 776;
  const LOGO_H = 507;
  const GLYPHS = [
    { box: [1, 123, 126, 258],   bg: "var(--jonquil)", fg: "var(--black)",   anim: "g-wipe-right" },
    { box: [140, 152, 267, 261], bg: "var(--rojo)",    fg: "var(--jonquil)", anim: "g-spin" },
    { box: [285, 152, 425, 292], bg: "var(--steel)",   fg: "var(--white)",   anim: "g-wipe-down" },
    { box: [1, 287, 120, 427],   bg: "var(--black)",   fg: "var(--jonquil)", anim: "g-wipe-up" },
    { box: [132, 298, 222, 427], bg: "var(--white)",   fg: "var(--rojo)",    anim: "g-wipe-down" },
    { box: [234, 319, 349, 427], bg: "var(--jonquil)", fg: "var(--steel)",   anim: "g-spin" },
    { box: [360, 298, 450, 427], bg: "var(--rojo)",    fg: "var(--white)",   anim: "g-wipe-up" },
    { box: [462, 322, 510, 427], bg: "var(--steel)",   fg: "var(--jonquil)", anim: "g-drop" },
    { box: [518, 318, 646, 427], bg: "var(--white)",   fg: "var(--black)",   anim: "g-spin" },
    { box: [658, 322, 775, 427], bg: "var(--black)",   fg: "var(--rojo)",    anim: "g-wipe-right" },
    { box: [434, 60, 705, 305],  bg: "var(--steel)",   icon: true,           anim: "g-spin" },
  ];

  const buildGlyphs = () => {
    const holder = document.getElementById("glyphs");
    if (!holder) return;
    const pad = 3;
    GLYPHS.forEach((g, i) => {
      const x = Math.max(0, g.box[0] - pad);
      const y = Math.max(0, g.box[1] - pad);
      const w = Math.min(LOGO_W, g.box[2] + pad + 1) - x;
      const h = Math.min(LOGO_H, g.box[3] + pad + 1) - y;

      const panel = document.createElement("div");
      panel.className = "glyph-panel";
      panel.style.setProperty("--i", i);
      panel.style.setProperty("--bg", g.bg);

      const glyph = document.createElement("div");
      glyph.className = g.icon ? "glyph glyph--icon" : "glyph";
      glyph.style.setProperty("--ar", (w / h).toFixed(4));
      // scale the whole logo so this box fills the element, then shift it into view
      glyph.style.setProperty("--ms", `${(LOGO_W / w) * 100}% ${(LOGO_H / h) * 100}%`);
      glyph.style.setProperty("--mp", `${(x / (LOGO_W - w)) * 100}% ${(y / (LOGO_H - h)) * 100}%`);
      glyph.style.setProperty("--anim", g.anim);
      if (g.fg) glyph.style.setProperty("--fg", g.fg);

      panel.appendChild(glyph);
      holder.appendChild(panel);
    });
  };

  if (!intro || reduceMotion) {
    finishIntro();
  } else {
    buildGlyphs();

    // the curtain animation (intro-out) ends the intro
    intro.addEventListener("animationend", (e) => {
      if (e.target === intro) finishIntro();
    });
    intro.querySelector(".intro__skip").addEventListener("click", finishIntro);

    // start only once the logo has loaded, so no piece lands blank
    let started = false;
    const play = () => {
      if (started) return;
      started = true;
      intro.classList.add("is-playing");
      setTimeout(finishIntro, 7500); // safety net
    };
    const logo = new Image();
    logo.onload = logo.onerror = play;
    logo.src = "assets/popstation-logo.webp";
    setTimeout(play, 2500); // don't wait forever on a slow connection
  }

  /* ---------------- Hero: rolling wheel ---------------- */

  const wheel = document.getElementById("wheel");
  if (wheel) {
    const arrow =
      '<span class="wheel__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span>';

    const items = [...wheel.querySelectorAll("li")];
    items.forEach((li) => {
      li.classList.add("wheel__item");
      li.innerHTML = `${arrow}<span>${li.textContent}</span>`;
    });

    const n = items.length;
    let active = 0;

    const layout = () => {
      items.forEach((li, i) => {
        // signed offset in the range [-n/2, n/2)
        let o = (i - active + n) % n;
        if (o >= n / 2) o -= n;

        const prev = Number(li.style.getPropertyValue("--o") || 0);
        // an item jumping from one end to the other is invisible — move it without a transition
        li.classList.toggle("is-wrapping", Math.abs(o - prev) > 1);

        li.style.setProperty("--o", o);
        li.dataset.dist = Math.min(Math.abs(o), 3);
        li.classList.toggle("is-active", o === 0);
      });
    };

    layout();
    if (!reduceMotion) {
      setInterval(() => {
        active = (active + 1) % n;
        layout();
      }, 1400);
    }
  }

  /* ---------------- Nav background on scroll ---------------- */

  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Optional photography ----------------
     Elements with data-img use a brand-colour fill until the photo
     exists; drop files into assets/img/ and they appear automatically. */

  document.querySelectorAll("[data-img]").forEach((el) => {
    const src = el.dataset.img;
    const img = new Image();
    img.onload = () => el.style.setProperty("--img", `url("${src}")`);
    img.src = src;
  });

  /* ---------------- Reveal on scroll ---------------- */

  // tiles start fully clipped, which the browser counts as off-screen,
  // so the bento grid is observed and reveals its tiles together
  const revealIn = (el) => {
    el.classList.add("is-in");
    el.querySelectorAll(".tile").forEach((t) => t.classList.add("is-in"));
  };
  const revealTargets = document.querySelectorAll("[data-reveal], .bento");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealIn(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach(revealIn);
  }

  /* ---------------- Progress slider tracks the build section ---------------- */

  const build = document.getElementById("build");
  const progress = build && build.querySelector(".progress");
  if (progress) {
    const update = () => {
      const r = build.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      progress.style.setProperty("--p", p.toFixed(4));
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------------- Count-up numbers ---------------- */

  const formatIN = new Intl.NumberFormat("en-IN");
  const counters = document.querySelectorAll("[data-count]");

  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const fmt = (v) => (el.dataset.format === "in" ? formatIN.format(v) : String(v));
    if (reduceMotion) {
      el.textContent = fmt(target);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          co.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------------- Bento tiles trade faces on a loop ---------------- */

  const tiles = [...document.querySelectorAll(".tile")];
  if (tiles.length && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      const tile = tiles[i % tiles.length];
      tile.classList.toggle("is-alt");
      i += 2; // skip one each step so neighbouring tiles don't flip together
    }, 1300);
  }

  /* ---------------- Footer year ---------------- */

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
