(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Intro: the popcorn pops, then Pop Station comes up ----------------
     On a blush screen (black type, red and yellow accents):
       1. zoomed in on the popcorn, its three loops pop in one after another,
          each with a springy bounce and a burst of crumbs
       2. the view pulls back while "Pop Station" scribbles in letter by letter
       3. the tagline rises in, the logo holds, then the page lifts in
     Runs in JS with a failsafe so it always ends. */

  const intro = document.getElementById("intro");
  const SVG_NS = "http://www.w3.org/2000/svg";

  // centre of each popcorn loop, in logo coordinates
  const LOOPS = [[511, 140], [597, 174], [523, 220]];
  const CRUMBS = ["#e01d1e", "#111111", "#ffcb0e"];

  let introFinished = false;
  const finishIntro = () => {
    if (!intro || introFinished) return;
    introFinished = true;
    intro.classList.add("is-done");
    document.body.classList.remove("is-loading");
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const svgEl = (name, attrs = {}) => {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };
  const easeOut = "cubic-bezier(0.16, 1, 0.3, 1)";

  // one loop of the popcorn pops: a springy bounce and a burst of crumbs
  const popLoop = (logo, i) => {
    const [cx, cy] = LOOPS[i];
    logo.querySelector(`.logo-loop[data-loop="${i}"]`).animate(
      [
        { transform: "scale(0) rotate(-30deg)", opacity: 0 },
        { transform: "scale(1.3) rotate(8deg)", opacity: 1, offset: 0.45 },
        { transform: "scale(0.92) rotate(-3deg)", opacity: 1, offset: 0.7 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 620, easing: "ease-out", fill: "both" }
    );
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + i * 0.6;
      const dist = 80 + (k % 3) * 22;
      const crumb = svgEl("circle", { cx, cy, r: 4 + (k % 3) * 1.5, fill: CRUMBS[k % 3] });
      logo.appendChild(crumb);
      crumb.animate(
        [{ transform: "translate(0, 0) scale(1)", opacity: 1 },
         { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(0.3)`, opacity: 0 }],
        { duration: 650, easing: easeOut, fill: "forwards" }
      ).finished.then(() => crumb.remove());
    }
  };

  // a letter scribbles in: its outline is drawn, then it fills
  const scribble = (path, delay) => {
    const len = path.getTotalLength();
    path.style.stroke = "currentColor";
    path.style.strokeWidth = "3";
    path.style.strokeDasharray = len;
    path.animate(
      [{ strokeDashoffset: len, fillOpacity: 0, opacity: 1 }, { strokeDashoffset: len * 0.2, fillOpacity: 0, opacity: 1, offset: 0.55 },
       { strokeDashoffset: 0, fillOpacity: 1, opacity: 1 }],
      { duration: 650, delay, easing: "ease-out", fill: "both" }
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
    logo.querySelectorAll(".logo-loop, .logo-word path, .logo-tag").forEach((el) => { el.style.opacity = "0"; });

    // start zoomed in on the popcorn, centred on screen (its centre sits
    // 21.5% right of and 13.5% above the logo's centre)
    const ZOOM = "scale(1.8) translate(-21.5%, 13.5%)";
    logo.style.transform = ZOOM;
    await wait(350);

    // 1. the loops pop, one after another
    for (let i = 0; i < 3; i++) {
      if (introFinished) return;
      popLoop(logo, i);
      await wait(330);
    }
    await wait(350);
    if (introFinished) return;

    // 2. pull back while Pop Station scribbles in
    logo.animate([{ transform: ZOOM }, { transform: "none" }], { duration: 900, easing: easeOut, fill: "forwards" });
    logo.querySelectorAll(".logo-word path").forEach((path, i) => scribble(path, 200 + i * 45));

    // 3. tagline rises in
    logo.querySelector(".logo-tag").animate(
      [{ transform: "translateY(40%)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 700, delay: 950, easing: easeOut, fill: "both" }
    );
    await wait(2600); // finish drawing, then a beat to take it in

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
    setTimeout(finishIntro, 9000); // failsafe: never leave the intro up
    runIntro().catch(finishIntro);
  }

  /* ---------------- Hero: expanding panels ----------------
     Panels slide up once the intro has gone. Hovering or tapping a panel
     opens it; while the section is on screen and nobody is pointing at it,
     the open panel moves on by itself. */

  const hero = document.getElementById("who");
  if (hero) {
    const showPanels = () => hero.classList.add("is-in");
    if (!intro || introFinished) showPanels();
    else {
      const watch = new MutationObserver(() => {
        if (intro.classList.contains("is-done")) { watch.disconnect(); showPanels(); }
      });
      watch.observe(intro, { attributes: true, attributeFilter: ["class"] });
    }

    const panels = [...hero.querySelectorAll(".acc__panel")];
    let open = -1;
    const openPanel = (i) => {
      open = (i + panels.length) % panels.length;
      panels.forEach((p, k) => {
        p.classList.toggle("is-open", k === open);
        p.querySelector(".acc__tab").setAttribute("aria-expanded", k === open);
        p.querySelector(".acc__body").inert = k !== open;
      });
    };

    let timer = null;
    let paused = false;
    let inView = false;
    const stopCycle = () => { clearInterval(timer); timer = null; };
    const startCycle = () => {
      stopCycle();
      if (inView && !paused && !reduceMotion) timer = setInterval(() => openPanel(open + 1), 3200);
    };

    panels.forEach((panel, i) => {
      const tab = panel.querySelector(".acc__tab");
      tab.addEventListener("click", () => { openPanel(i); paused = true; stopCycle(); });
      tab.addEventListener("focus", () => openPanel(i));
      panel.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") openPanel(i); });
    });
    const acc = hero.querySelector(".acc");
    acc.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { paused = true; stopCycle(); } });
    acc.addEventListener("pointerleave", () => { paused = false; startCycle(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; startCycle(); }, { threshold: 0.4 }).observe(hero);
    }
    openPanel(0);
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
    // absolute URL: a relative one inside a CSS variable would resolve
    // against the stylesheet's folder (css/) instead of the page
    img.onload = () => el.style.setProperty("--img", `url("${img.src}")`);
    img.src = src;
  });

  /* ---------------- Reveal on scroll ---------------- */

  const revealTargets = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------------- Count-up numbers ---------------- */

  const formatIN = new Intl.NumberFormat("en-IN");
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
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------------- How we build → By the numbers ----------------
     One screen that plays by itself when it comes into view:
       1. the headline rises in; the image shows through the key words,
          then fills the box behind each one
       2. each filled box grows and slides into its tile
       3. the numbers count up
     It resets once the screen is fully out of view, so it replays. */

  /* ---------------- Number cards: little toys ----------------
     start() when the cards land, stop() when the screen resets. */

  const widgets = (() => {
    const root = document.getElementById("build");
    if (!root) return { start() {}, stop() {}, still() {} };
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    // 35+ years: the big icon changes shape
    const glyphs = [...root.querySelectorAll(".tw-glyph")];
    let g = 0;
    const showGlyph = (i) => glyphs.forEach((el, k) => el.classList.toggle("is-on", k === i));

    // 40+ brands: Launch toggle with confetti
    const toggle = root.querySelector(".tw-toggle");
    const confetti = () => {
      const card = toggle.closest(".tile");
      const r = toggle.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const colours = ["#ffcb0e", "#e01d1e", "#ffffff", "#111111", "#f5a6aa"];
      for (let k = 0; k < 18; k++) {
        const bit = document.createElement("span");
        bit.className = "tw-confetti";
        bit.style.background = colours[k % colours.length];
        bit.style.left = `${r.left - c.left + r.width / 2}px`;
        bit.style.top = `${r.top - c.top + r.height / 2}px`;
        card.appendChild(bit);
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 90;
        bit.animate(
          [{ transform: "translate(0,0) rotate(0)", opacity: 1 },
           { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d - 40}px) rotate(${Math.random() * 540}deg)`, opacity: 0 }],
          { duration: 900 + Math.random() * 400, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
        ).finished.then(() => bit.remove());
      }
    };
    const setToggle = (on) => {
      toggle.setAttribute("aria-pressed", on);
      toggle.querySelector(".tw-toggle__label").textContent = on ? "Launched!" : "Launch";
      if (on && !reduceMotion) confetti();
    };
    toggle.addEventListener("click", () => setToggle(toggle.getAttribute("aria-pressed") !== "true"));

    // 300+ vendors: arc gauge; drag the knob, it springs back to full
    const gauge = root.querySelector(".tw-gauge");
    const fill = gauge.querySelector(".tw-gauge__fill");
    const knob = gauge.querySelector(".tw-gauge__knob");
    const val = root.querySelector(".tw-gauge-val");
    const MAX = 300;
    let level = 0;
    const setLevel = (f) => {
      level = Math.min(1, Math.max(0, f));
      // inline style, so it wins over the stylesheet's starting value
      fill.style.strokeDasharray = `${(level * 100).toFixed(2)} 100`;
      knob.setAttribute("cx", (150 - 130 * Math.cos(Math.PI * level)).toFixed(1));
      knob.setAttribute("cy", (140 - 130 * Math.sin(Math.PI * level)).toFixed(1));
      val.textContent = Math.round(level * MAX);
    };
    let raf = 0;
    const sweepTo = (to, ms) => {
      cancelAnimationFrame(raf);
      const from = level;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / ms);
        setLevel(from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    let dragging = false;
    const levelAt = (e) => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(gauge.getScreenCTM().inverse());
      return 1 - Math.atan2(Math.max(0, 140 - p.y), p.x - 150) / Math.PI;
    };
    gauge.addEventListener("pointerdown", (e) => {
      dragging = true;
      gauge.setPointerCapture(e.pointerId);
      cancelAnimationFrame(raf);
      setLevel(levelAt(e));
    });
    gauge.addEventListener("pointermove", (e) => { if (dragging) setLevel(levelAt(e)); });
    const release = () => { if (!dragging) return; dragging = false; sweepTo(1, 900); };
    gauge.addEventListener("pointerup", release);
    gauge.addEventListener("pointercancel", release);

    return {
      start() {
        showGlyph(0);
        timers.push(setInterval(() => { g = (g + 1) % glyphs.length; showGlyph(g); }, 1500));
        sweepTo(1, 1600);
        later(() => setToggle(true), 1100);
      },
      stop() {
        timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
        timers.length = 0;
        cancelAnimationFrame(raf);
        setLevel(0);
        setToggle(false);
        showGlyph(-1);
      },
      // reduced motion: everything in its final state
      still() {
        showGlyph(glyphs.length - 1);
        setLevel(1);
        toggle.setAttribute("aria-pressed", "true");
        toggle.querySelector(".tw-toggle__label").textContent = "Launched!";
      },
    };
  })();

  const morph = document.getElementById("build");
  if (morph) {
    const title = morph.querySelector(".build__title");
    const text = morph.querySelector(".morph__text");
    const grid = morph.querySelector(".morph__grid");
    const bento = morph.querySelector(".bento");
    const pairs = [...morph.querySelectorAll(".tile")].map((tile) => ({
      tile,
      src: morph.querySelector(`[data-morph="${tile.dataset.from}"]`),
    }));
    const counters = [...morph.querySelectorAll("[data-count]")];
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const HOLD = 2600;  // headline on screen before the morph
    const MORPH = 1200; // boxes growing into tiles

    // t = 0: headline only · t = 1: bento in place
    const render = (t) => {
      const e = easeInOut(t);
      text.style.opacity = String(1 - clamp(t * 1.8));
      text.style.transform = `scale(${1 - 0.08 * e})`;
      grid.style.setProperty("--c", clamp((t - 0.75) / 0.25).toFixed(3));
      morph.classList.toggle("is-grid", t >= 1);

      const g = bento.getBoundingClientRect();
      pairs.forEach(({ tile, src }) => {
        if (!src) return;
        if (t <= 0) {
          tile.style.opacity = "0";
          tile.style.transform = "";
          src.style.visibility = "";
          return;
        }
        // the tile sits at its grid spot; transform it back onto its word
        const s = src.getBoundingClientRect();
        const x = g.left + tile.offsetLeft;
        const y = g.top + tile.offsetTop;
        const w = tile.offsetWidth;
        const h = tile.offsetHeight;
        const k = 1 - e;
        const sx = s.width / w + (1 - s.width / w) * e;
        const sy = s.height / h + (1 - s.height / h) * e;
        tile.style.opacity = "1";
        tile.style.transform = t >= 1 ? "" : `translate(${(s.left - x) * k}px, ${(s.top - y) * k}px) scale(${sx}, ${sy})`;
        src.style.visibility = "hidden";
      });
    };

    let timers = [];
    let raf = 0;
    const reset = () => {
      timers.forEach(clearTimeout);
      timers = [];
      cancelAnimationFrame(raf);
      morph.classList.remove("is-playing");
      title.classList.remove("is-in");
      counters.forEach((el) => { el.textContent = "0"; });
      widgets.stop();
      render(0);
    };

    const play = () => {
      if (morph.classList.contains("is-playing")) return;
      morph.classList.add("is-playing");
      title.classList.add("is-in");
      timers.push(setTimeout(() => {
        const start = performance.now();
        const tick = (now) => {
          const t = clamp((now - start) / MORPH);
          render(t);
          if (t < 1) raf = requestAnimationFrame(tick);
          else { counters.forEach(runCounter); widgets.start(); }
        };
        raf = requestAnimationFrame(tick);
      }, HOLD));
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      title.classList.add("is-in");
      counters.forEach(runCounter);
      widgets.still();
    } else {
      render(0);
      new IntersectionObserver(([entry]) => { if (entry.isIntersecting) play(); }, { threshold: 0.55 }).observe(morph);
      new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) reset(); }, { threshold: 0 }).observe(morph);
      window.addEventListener("resize", () => {
        if (morph.classList.contains("is-grid")) render(1);
      });
    }
  }

  /* ---------------- Brandfolio deck ---------------- */

  const brandfolio = document.getElementById("brandfolio");
  if (brandfolio) {
    const cards = [...brandfolio.querySelectorAll(".bcard")];
    const dotsEl = document.getElementById("deckDots");
    const info = brandfolio.querySelector(".brand-info");
    const pad = (n) => String(n).padStart(2, "0");
    document.getElementById("brandTotal").textContent = pad(cards.length);

    // back of each card: what Popstation delivers for the brand
    const STAGES = [["design", "Design"], ["sourcing", "Sourcing"], ["production", "Production"], ["packaging", "Packaging"]];
    cards.forEach((card) => {
      const on = card.dataset.stages.split(" ");
      const back = card.querySelector(".bcard__back");
      const h = document.createElement("h4");
      h.textContent = card.dataset.name;
      const p = document.createElement("p");
      p.textContent = card.dataset.what;
      const ul = document.createElement("ul");
      STAGES.forEach(([key, label]) => {
        const li = document.createElement("li");
        li.textContent = label;
        li.classList.toggle("is-on", on.includes(key));
        ul.appendChild(li);
      });
      const a = document.createElement("a");
      a.href = card.dataset.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Visit site ↗";
      a.addEventListener("click", (e) => e.stopPropagation());
      back.append(h, p, ul, a);
    });

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
        card.classList.remove("is-flipped");
        card.classList.toggle("is-active", k === i);
        card.classList.toggle("is-prev", k === (i - 1 + n) % n);
        card.classList.toggle("is-next", k !== i && k !== (i - 1 + n) % n);
        card.setAttribute("aria-hidden", k !== i);
      });
      dots.forEach((d, k) => d.setAttribute("aria-selected", k === i));

      const card = cards[i];
      brandfolio.dataset.active = card.dataset.brand;
      document.getElementById("brandIndex").textContent = pad(i + 1);
      document.getElementById("brandName").textContent = card.dataset.name;
      document.getElementById("brandWhat").textContent = card.dataset.what;
      const link = document.getElementById("brandLink");
      link.href = card.dataset.url;
      link.setAttribute("aria-label", `Visit ${card.dataset.name}`);
      const on = card.dataset.stages.split(" ");
      brandfolio.querySelectorAll("#brandStages li").forEach((li) => {
        li.classList.toggle("is-on", on.includes(li.dataset.stage));
      });

      // replay the text entrance
      info.classList.remove("is-swapping");
      void info.offsetWidth;
      info.classList.add("is-swapping");
    };

    document.getElementById("deckPrev").addEventListener("click", () => { show(current - 1); restart(); });
    document.getElementById("deckNext").addEventListener("click", () => { show(current + 1); restart(); });
    brandfolio.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { show(current - 1); restart(); }
      if (e.key === "ArrowRight") { show(current + 1); restart(); }
    });

    // swipe or drag to change brand; a plain click flips the card
    const deck = document.getElementById("deck");
    let startX = null;
    let swiped = false;
    deck.addEventListener("pointerdown", (e) => { startX = e.clientX; swiped = false; });
    deck.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) { swiped = true; show(current + (dx < 0 ? 1 : -1)); restart(); }
    });
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (swiped || !card.classList.contains("is-active")) return;
        card.classList.toggle("is-flipped");
        stop(); // hold on this brand while someone reads the back
      });
    });

    // clicking the floating photo panel swaps it (and its caption) with the circle
    brandfolio.querySelectorAll(".fp-photo").forEach((panel) => {
      panel.addEventListener("click", (e) => {
        e.stopPropagation();
        const disc = panel.closest(".bcard").querySelector(".bcard__disc");
        const img = panel.querySelector(".fp-img");
        const cap = panel.querySelector("figcaption b");
        const a = disc.style.getPropertyValue("--img");
        const b = img.style.getPropertyValue("--img");
        if (!a || !b) return; // only once both photos exist
        disc.style.setProperty("--img", b);
        img.style.setProperty("--img", a);
        const discCap = disc.dataset.cap;
        disc.dataset.cap = cap.textContent;
        cap.textContent = discCap;
        const discLabel = disc.getAttribute("aria-label");
        disc.setAttribute("aria-label", img.getAttribute("aria-label"));
        img.setAttribute("aria-label", discLabel);
      });
    });

    // the active card leans toward the pointer
    if (!reduceMotion) {
      deck.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const card = cards[current];
        const r = deck.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
      });
      deck.addEventListener("pointerleave", () => {
        cards.forEach((card) => {
          card.classList.remove("is-tilting");
          card.style.removeProperty("--ry");
          card.style.removeProperty("--rx");
        });
      });
    }

    // autoplay only while the section is on screen and not hovered
    let timer = null;
    let inView = false;
    let hovered = false;
    const stop = () => { clearInterval(timer); timer = null; };
    const restart = () => {
      stop();
      if (inView && !hovered && !reduceMotion) timer = setInterval(() => show(current + 1), 4500);
    };
    brandfolio.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hovered = true; stop(); } });
    brandfolio.addEventListener("pointerleave", () => { hovered = false; restart(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        restart();
      }, { threshold: 0.35 }).observe(brandfolio);
    }

    show(0);
  }

  /* ---------------- Footer year ---------------- */

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
