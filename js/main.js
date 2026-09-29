(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Intro: logo reveal ----------------
     Slide 1: one loop of the popcorn draws itself in.
     Slide 2: the next loop joins it.
     Slide 3: on black, the last loop completes as "Pop Station" and the
     tagline pop in together. Runs in JS with a failsafe so it always ends. */

  const intro = document.getElementById("intro");
  const SVG_NS = "http://www.w3.org/2000/svg";

  // the popcorn's three loops (logo coordinates): each is drawn by a pen
  // sweeping round its circle, starting from the loop's tail
  const ICON_BOX = "426 52 286 262";
  const LOOPS = [
    { cx: 511, cy: 140, r: 68, start: 70 },  // top-left loop
    { cx: 597, cy: 174, r: 69, start: 190 }, // right loop
    { cx: 523, cy: 220, r: 71, start: 325 }, // bottom loop
  ];
  const SLIDES = [
    { bg: "var(--steel)", draw: 0, show: [] },
    { bg: "var(--rojo)", draw: 1, show: [0] },
  ];
  const SLIDE_MS = 850;

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

  // adds a sweep mask per loop to an svg; returns the sweep circles
  let uid = 0;
  const addLoopMasks = (svg) => {
    const defs = svgEl("defs");
    const masks = LOOPS.map((loop) => {
      const id = `loop${uid++}`;
      // a thick circle whose dash grows reveals the loop like a pen going round
      const reach = loop.r + 30;
      const mask = svgEl("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 776, height: 507 });
      const circle = svgEl("circle", {
        cx: loop.cx, cy: loop.cy, r: reach / 2, fill: "none", stroke: "#fff", "stroke-width": reach,
        pathLength: 100, "stroke-dasharray": "0 100", transform: `rotate(${loop.start} ${loop.cx} ${loop.cy})`,
      });
      mask.appendChild(circle);
      defs.appendChild(mask);
      return { id, circle };
    });
    svg.prepend(defs);
    return masks;
  };

  // pen sweep, driven frame by frame so it works in every browser
  const sweep = (circle, ms) =>
    new Promise((done) => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / ms);
        const e = 1 - Math.pow(1 - t, 3);
        circle.setAttribute("stroke-dasharray", `${(e * 100).toFixed(2)} 100`);
        if (t < 1) requestAnimationFrame(tick);
        else done();
      };
      requestAnimationFrame(tick);
    });

  const runIntro = async () => {
    const res = await fetch("assets/popstation-logo.svg");
    if (!res.ok) throw new Error("logo not found");
    const stage = document.getElementById("introStage");
    stage.innerHTML = await res.text();
    const logo = stage.querySelector("svg");
    logo.classList.add("intro-logo");
    logo.removeAttribute("role");
    const icon = logo.querySelector(".logo-icon");

    // slides 1 and 2: the popcorn fills the screen, one side at a time
    const panel = document.getElementById("introPanel");
    const glyph = document.getElementById("introGlyph");
    glyph.setAttribute("viewBox", ICON_BOX);
    for (const slide of SLIDES) {
      if (introFinished) return;
      panel.style.setProperty("--panel-bg", slide.bg);
      glyph.replaceChildren();
      const masks = addLoopMasks(glyph);
      slide.show.forEach((i) => glyph.appendChild(icon.children[i].cloneNode(true)));
      const drawing = icon.children[slide.draw].cloneNode(true);
      drawing.setAttribute("mask", `url(#${masks[slide.draw].id})`);
      glyph.appendChild(drawing);
      glyph.animate([{ transform: "scale(1.08)" }, { transform: "none" }], { duration: SLIDE_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      sweep(masks[slide.draw].circle, SLIDE_MS * 0.75);
      await wait(SLIDE_MS);
    }
    if (introFinished) return;

    // slide 3: the whole logo pops up while the last side completes
    panel.hidden = true;
    const masks = addLoopMasks(logo);
    icon.children[2].setAttribute("mask", `url(#${masks[2].id})`);

    const spring = "cubic-bezier(0.34, 1.56, 0.64, 1)";
    logo.animate(
      [{ transform: "scale(0.6)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 800, easing: spring, fill: "both" }
    );
    logo.querySelector(".logo-word").animate(
      [{ transform: "translateY(12%)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 700, delay: 120, easing: spring, fill: "both" }
    );
    logo.querySelector(".logo-tag").animate(
      [{ transform: "translateY(40%)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 700, delay: 450, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" }
    );
    await sweep(masks[2].circle, 650);
    await wait(1500); // let the finished logo sit for a beat

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
     The section is tall and its screen is pinned. Scroll progress p:
       0–0.18  the headline, with its image-filled words
       0.18–0.6  each image word grows and slides into its tile
       0.6–1   the numbers bento, counting up */

  const morph = document.getElementById("build");
  if (morph) {
    const text = morph.querySelector(".morph__text");
    const grid = morph.querySelector(".morph__grid");
    const bento = morph.querySelector(".bento");
    const progress = morph.querySelector(".progress");
    const pairs = [...morph.querySelectorAll(".tile")].map((tile) => ({
      tile,
      src: morph.querySelector(`[data-morph="${tile.dataset.from}"]`),
    }));
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let counted = false;

    const update = () => {
      const r = morph.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - window.innerHeight));
      progress.style.setProperty("--p", p.toFixed(4));

      const t = clamp((p - 0.18) / 0.42);
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
          src.style.visibility = "";
          return;
        }
        // tile sits at its grid spot; transform it back onto its headline word
        const s = src.getBoundingClientRect();
        const x = g.left + tile.offsetLeft;
        const y = g.top + tile.offsetTop;
        const w = tile.offsetWidth;
        const h = tile.offsetHeight;
        const k = 1 - e;
        const sx = s.width / w + (1 - s.width / w) * e;
        const sy = s.height / h + (1 - s.height / h) * e;
        tile.style.opacity = "1";
        tile.style.transform = `translate(${(s.left - x) * k}px, ${(s.top - y) * k}px) scale(${sx}, ${sy})`;
        src.style.visibility = "hidden";
      });

      if (!counted && t >= 0.9) {
        counted = true;
        morph.querySelectorAll("[data-count]").forEach(runCounter);
      }
    };

    if (reduceMotion) {
      morph.querySelectorAll("[data-count]").forEach(runCounter);
    } else {
      let queued = false;
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; update(); });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    }
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

    // clicking a floating photo swaps it into the card's main circle
    brandpolio.querySelectorAll(".tile-float").forEach((tile) => {
      tile.addEventListener("click", (e) => {
        e.stopPropagation();
        const disc = tile.closest(".bcard").querySelector(".bcard__disc");
        const a = disc.style.getPropertyValue("--img");
        const b = tile.style.getPropertyValue("--img");
        if (!a || !b) return; // only once both photos exist
        disc.style.setProperty("--img", b);
        tile.style.setProperty("--img", a);
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
        card.style.setProperty("--ry", `${(x * 22).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(-y * 16).toFixed(2)}deg`);
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
