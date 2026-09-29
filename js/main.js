(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Intro: logo reveal ----------------
     Mirrors the reference: each glyph of the logo appears on its own
     colour panel and draws itself in (outline, then fill), then the whole
     logo assembles on black. The timeline runs in JS so it always
     finishes, and a failsafe removes the intro whatever happens. */

  const intro = document.getElementById("intro");
  const SVG_NS = "http://www.w3.org/2000/svg";
  const STEP = 340; // ms each glyph panel is on screen

  // glyph order with panel colour, glyph colour and entrance
  const GLYPHS = [
    { id: "P",  bg: "var(--jonquil)", fg: "#000000", enter: "draw" },
    { id: "o1", bg: "var(--rojo)",    fg: "#ffcb0e", enter: "spin" },
    { id: "p",  bg: "var(--steel)",   fg: "#ffffff", enter: "draw" },
    { id: "S",  bg: "var(--black)",   fg: "#ffcb0e", enter: "draw" },
    { id: "t1", bg: "var(--white)",   fg: "#e01d1e", enter: "draw" },
    { id: "a",  bg: "var(--jonquil)", fg: "#2d7dd2", enter: "spin" },
    { id: "t2", bg: "var(--rojo)",    fg: "#ffffff", enter: "draw" },
    { id: "i",  bg: "var(--steel)",   fg: "#ffcb0e", enter: "drop" },
    { id: "o2", bg: "var(--white)",   fg: "#000000", enter: "spin" },
    { id: "n",  bg: "var(--black)",   fg: "#e01d1e", enter: "draw" },
    { id: "icon", bg: "var(--steel)", enter: "spin" },
  ];

  let introFinished = false;
  const finishIntro = () => {
    if (!intro || introFinished) return;
    introFinished = true;
    intro.classList.add("is-done");
    document.body.classList.remove("is-loading");
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // show one glyph on its panel and animate it in
  const showGlyph = (logo, g) => {
    const panel = document.getElementById("introPanel");
    const svg = document.getElementById("introGlyph");
    panel.style.setProperty("--panel-bg", g.bg);
    svg.replaceChildren();

    let node;
    if (g.id === "icon") {
      node = logo.querySelector(".logo-icon").cloneNode(true);
    } else {
      node = logo.querySelector(`[data-glyph="${g.id}"]`).cloneNode(true);
      node.setAttribute("fill", g.fg);
      node.setAttribute("fill-rule", "evenodd");
    }
    svg.appendChild(node);

    // frame the glyph exactly, with a little breathing room
    const b = node.getBBox();
    const pad = Math.max(b.width, b.height) * 0.08;
    svg.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
    node.style.transformBox = "fill-box";
    node.style.transformOrigin = "center";

    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    if (g.enter === "draw" && node.getTotalLength) {
      // the outline is drawn, then the letter floods with colour
      const len = node.getTotalLength();
      node.setAttribute("stroke", g.fg);
      node.setAttribute("stroke-width", Math.max(b.width, b.height) * 0.025);
      node.style.strokeDasharray = len;
      node.animate(
        [{ strokeDashoffset: len, fillOpacity: 0 }, { strokeDashoffset: len * 0.35, fillOpacity: 0, offset: 0.5 }, { strokeDashoffset: 0, fillOpacity: 1 }],
        { duration: STEP * 0.85, easing: "ease-out", fill: "both" }
      );
      node.animate(
        [{ transform: "scale(1.12) rotate(-6deg)" }, { transform: "none" }],
        { duration: STEP * 0.9, easing: ease, fill: "both" }
      );
    } else if (g.enter === "drop") {
      node.animate(
        [{ transform: "translateY(-160%)" }, { transform: "translateY(6%)", offset: 0.7 }, { transform: "none" }],
        { duration: STEP * 0.85, easing: "ease-out", fill: "both" }
      );
    } else {
      node.animate(
        [{ transform: "rotate(-170deg) scale(0.35)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: STEP * 0.85, easing: ease, fill: "both" }
      );
    }
  };

  // the full logo assembles: letters rise in, popcorn spins in, tagline follows
  const assembleLogo = (logo) => {
    const spring = "cubic-bezier(0.34, 1.56, 0.64, 1)";
    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    logo.animate([{ transform: "scale(1.2)" }, { transform: "none" }], { duration: 1500, easing: ease, fill: "both" });
    logo.querySelectorAll(".logo-word path").forEach((path, i) => {
      path.animate(
        [{ transform: "translateY(45%) scale(0.7)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 600, delay: i * 45, easing: spring, fill: "both" }
      );
    });
    logo.querySelector(".logo-icon").animate(
      [{ transform: "rotate(-220deg) scale(0)", opacity: 0 }, { opacity: 1, offset: 0.4 }, { transform: "none", opacity: 1 }],
      { duration: 900, delay: 350, easing: spring, fill: "both" }
    );
    logo.querySelector(".logo-tag").animate(
      [{ transform: "translateY(40%)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 700, delay: 750, easing: ease, fill: "both" }
    );
  };

  const runIntro = async () => {
    const res = await fetch("assets/popstation-logo.svg");
    if (!res.ok) throw new Error("logo not found");
    const stage = document.getElementById("introStage");
    stage.innerHTML = await res.text();
    const logo = stage.querySelector("svg");
    logo.classList.add("intro-logo");
    logo.removeAttribute("role");

    for (const g of GLYPHS) {
      if (introFinished) return;
      showGlyph(logo, g);
      await wait(STEP);
    }
    if (introFinished) return;

    document.getElementById("introPanel").hidden = true;
    assembleLogo(logo);
    await wait(1450 + 700); // assembly, then a beat to take it in

    const lift = intro.animate(
      [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }],
      { duration: 750, easing: "cubic-bezier(0.7, 0, 0.3, 1)", fill: "forwards" }
    );
    await lift.finished;
    finishIntro();
  };

  if (!intro || reduceMotion || !("animate" in Element.prototype)) {
    finishIntro();
  } else {
    intro.querySelector(".intro__skip").addEventListener("click", finishIntro);
    setTimeout(finishIntro, 11000); // failsafe: never leave the intro up
    runIntro().catch(finishIntro);
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

  /* ---------------- Brandpolio deck ---------------- */

  const brandpolio = document.getElementById("brandpolio");
  if (brandpolio) {
    const cards = [...brandpolio.querySelectorAll(".bcard")];
    const dotsEl = document.getElementById("deckDots");
    const info = brandpolio.querySelector(".brand-info");
    const pad = (n) => String(n).padStart(2, "0");
    document.getElementById("brandTotal").textContent = pad(cards.length);

    const dots = cards.map((card, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", card.dataset.name);
      b.addEventListener("click", () => { show(i); restart(); });
      dotsEl.appendChild(b);
      return b;
    });

    let current = -1;
    const show = (i) => {
      const n = cards.length;
      i = (i + n) % n;
      if (i === current) return;
      current = i;
      cards.forEach((card, k) => {
        card.classList.toggle("is-active", k === i);
        card.classList.toggle("is-prev", k === (i - 1 + n) % n);
        card.classList.toggle("is-next", k !== i && k !== (i - 1 + n) % n);
        card.setAttribute("aria-hidden", k !== i);
      });
      dots.forEach((d, k) => d.setAttribute("aria-selected", k === i));

      const card = cards[i];
      brandpolio.dataset.active = card.dataset.brand;
      document.getElementById("brandIndex").textContent = pad(i + 1);
      document.getElementById("brandName").textContent = card.dataset.name;
      document.getElementById("brandWhat").textContent = card.dataset.what;
      const link = document.getElementById("brandLink");
      link.href = card.dataset.url;
      link.setAttribute("aria-label", `Visit ${card.dataset.name}`);
      const on = card.dataset.stages.split(" ");
      brandpolio.querySelectorAll("#brandStages li").forEach((li) => {
        li.classList.toggle("is-on", on.includes(li.dataset.stage));
      });

      // replay the text entrance
      info.classList.remove("is-swapping");
      void info.offsetWidth;
      info.classList.add("is-swapping");
    };

    document.getElementById("deckPrev").addEventListener("click", () => { show(current - 1); restart(); });
    document.getElementById("deckNext").addEventListener("click", () => { show(current + 1); restart(); });
    brandpolio.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { show(current - 1); restart(); }
      if (e.key === "ArrowRight") { show(current + 1); restart(); }
    });

    // swipe on touch screens
    const deck = document.getElementById("deck");
    let startX = null;
    deck.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    deck.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); restart(); }
    });

    // autoplay only while the section is on screen and not hovered
    let timer = null;
    let inView = false;
    let hovered = false;
    const stop = () => { clearInterval(timer); timer = null; };
    const restart = () => {
      stop();
      if (inView && !hovered && !reduceMotion) timer = setInterval(() => show(current + 1), 4500);
    };
    brandpolio.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovered = true; stop(); } });
    brandpolio.addEventListener("pointerleave", () => { hovered = false; restart(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        restart();
      }, { threshold: 0.35 }).observe(brandpolio);
    }

    show(0);
  }

  /* ---------------- Footer year ---------------- */

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
