(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Intro: popcorn pops, then Pop Station comes up ----------------
     Soft pastel take on the brand colours, like scalloped paper badges:
       1. three kernels wobble, then pop one by one into the popcorn's loops
       2. a big scalloped badge grows behind them, its wavy line drawing in
       3. "Pop Station" bounces up letter by letter, then the tagline
     Runs in JS with a failsafe so it always ends. */

  const intro = document.getElementById("intro");
  const SVG_NS = "http://www.w3.org/2000/svg";

  // centre of each popcorn loop in logo coordinates (where its kernel sits)
  const KERNELS = [[511, 140], [597, 174], [523, 220]];
  const PASTELS = [
    { fill: "#fbe9a6", line: "#2d7dd2" }, // soft jonquil, steel line
    { fill: "#f8d3d1", line: "#e01d1e" }, // soft rojo, rojo line
    { fill: "#cfe0f5", line: "#e01d1e" }, // soft steel, rojo line
  ];

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
  const spring = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  const easeOut = "cubic-bezier(0.16, 1, 0.3, 1)";

  // scalloped circle: radius wobbles `waves` times around
  const scallop = (cx, cy, r, waves, depth) => {
    let d = "";
    for (let i = 0; i <= 360; i += 2) {
      const a = (i * Math.PI) / 180;
      const rr = r + depth * Math.sin(a * waves);
      d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }
    return d + "Z";
  };

  // a paper badge: scalloped disc with a wavy line just inside the edge
  const badgeSvg = ({ fill, line }, size) => {
    const svg = svgEl("svg", { viewBox: "0 0 200 200", width: size, height: size });
    svg.append(
      svgEl("path", { d: scallop(100, 100, 94, 14, 4), fill }),
      svgEl("path", { d: scallop(100, 100, 80, 14, 3), fill: "none", stroke: line, "stroke-width": 2.6, class: "badge-line" })
    );
    return svg;
  };

  // small badges scattered round the edges, drifting slowly
  const scatterBadges = () => {
    const holder = document.getElementById("introBadges");
    const spots = [[-4, 8], [86, -6], [92, 58], [-8, 70], [30, 92], [64, 96], [12, 38], [78, 26]];
    spots.forEach(([x, y], i) => {
      const b = badgeSvg(PASTELS[i % 3], 100);
      b.classList.add("intro-badge");
      b.style.left = `${x}%`;
      b.style.top = `${y}%`;
      b.style.setProperty("--s", (0.9 + (i % 3) * 0.35).toFixed(2));
      holder.appendChild(b);
      b.animate(
        [{ transform: "scale(0) rotate(-40deg)", opacity: 0 }, { transform: "scale(var(--s)) rotate(0)", opacity: 1 }],
        { duration: 900, delay: 80 * i, easing: spring, fill: "both" }
      );
      b.animate(
        [{ translate: "0 0", rotate: "0deg" }, { translate: `${i % 2 ? 10 : -10}px ${i % 3 ? -14 : 12}px`, rotate: `${i % 2 ? 8 : -8}deg` }],
        { duration: 3200, delay: 900, easing: "ease-in-out", direction: "alternate", iterations: Infinity }
      );
    });
  };

  // one kernel wobbles, then pops into its loop with a spray of crumbs
  const popKernel = async (logo, i) => {
    const [cx, cy] = KERNELS[i];
    const loop = logo.querySelector(`.logo-loop[data-loop="${i}"]`);
    const kernel = svgEl("ellipse", { cx, cy, rx: 11, ry: 14, fill: "#e0a100", class: "kernel" });
    logo.appendChild(kernel);
    kernel.animate(
      [{ transform: "scale(0)" }, { transform: "scale(1.15)", offset: 0.35 }, { transform: "scale(1) rotate(-14deg)", offset: 0.55 },
       { transform: "scale(1) rotate(12deg)", offset: 0.75 }, { transform: "scale(1.25) rotate(0)" }],
      { duration: 420, easing: "ease-in-out", fill: "both" }
    );
    await wait(420);
    kernel.remove();

    loop.animate(
      [{ transform: "scale(0.15) rotate(-60deg)", opacity: 0 }, { transform: "scale(1.12) rotate(6deg)", opacity: 1, offset: 0.6 }, { transform: "none", opacity: 1 }],
      { duration: 650, easing: spring, fill: "both" }
    );
    // crumbs fly out and fade
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + i;
      const crumb = svgEl("circle", { cx, cy, r: 4 + (k % 3), fill: ["#e01d1e", "#2d7dd2", "#e0a100"][k % 3] });
      logo.appendChild(crumb);
      const dist = 70 + (k % 3) * 18;
      crumb.animate(
        [{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(0.2)`, opacity: 0 }],
        { duration: 700, easing: easeOut, fill: "forwards" }
      ).finished.then(() => crumb.remove());
    }
  };

  const runIntro = async () => {
    const res = await fetch("assets/popstation-logo.svg");
    if (!res.ok) throw new Error("logo not found");
    const stage = document.getElementById("introStage");

    // the big badge sits behind the logo
    const big = badgeSvg(PASTELS[1], "100%");
    big.classList.add("intro-bigbadge");
    stage.appendChild(big);
    const holder = document.createElement("div");
    holder.className = "intro-logo-holder";
    holder.innerHTML = await res.text();
    stage.appendChild(holder);
    const logo = holder.querySelector("svg");
    logo.classList.add("intro-logo");
    logo.removeAttribute("role");
    logo.querySelectorAll(".logo-loop, .logo-word path, .logo-tag").forEach((el) => { el.style.opacity = "0"; });

    // start zoomed in on the popcorn, centred on screen (its centre sits
    // 21.5% right of and 13.5% above the logo's centre)
    const ZOOM = "scale(1.8) translate(-21.5%, 13.5%)";
    holder.style.transform = ZOOM;

    scatterBadges();
    await wait(450);

    // 1. kernels pop, one after another
    for (let i = 0; i < 3; i++) {
      if (introFinished) return;
      popKernel(logo, i);
      await wait(300);
    }
    await wait(350);
    if (introFinished) return;

    // 2. pull back to the whole logo while the badge grows behind, its wavy line drawing round
    holder.animate([{ transform: ZOOM }, { transform: "none" }], { duration: 900, easing: easeOut, fill: "forwards" });
    big.animate(
      [{ transform: "scale(0) rotate(-90deg)" }, { transform: "none" }],
      { duration: 900, easing: spring, fill: "both" }
    );
    const line = big.querySelector(".badge-line");
    const len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1100, delay: 250, easing: easeOut, fill: "both" });

    // 3. Pop Station bounces up letter by letter, then the tagline
    logo.querySelectorAll(".logo-word path").forEach((path, i) => {
      path.animate(
        [{ transform: "translateY(60%) scale(0.4)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 650, delay: 250 + i * 55, easing: spring, fill: "both" }
      );
    });
    logo.querySelector(".logo-tag").animate(
      [{ transform: "translateY(40%)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 700, delay: 950, easing: easeOut, fill: "both" }
    );
    await wait(2400); // assembly, then a beat to take it in

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

  /* ---------------- Hero: folder stack ----------------
     Folders slide up once the intro has gone. Clicking one pulls it out
     of the stack, then opens its page. */

  const hero = document.getElementById("who");
  if (hero) {
    const showFolders = () => hero.classList.add("is-in");
    if (!intro || introFinished) showFolders();
    else {
      const watch = new MutationObserver(() => {
        if (intro.classList.contains("is-done")) { watch.disconnect(); showFolders(); }
      });
      watch.observe(intro, { attributes: true, attributeFilter: ["class"] });
    }

    hero.querySelectorAll(".folder").forEach((folder) => {
      folder.addEventListener("click", (e) => {
        // let new-tab clicks behave normally
        if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        folder.classList.add("is-opening");
        setTimeout(() => { window.location.href = folder.href; }, 480);
      });
    });
    // coming back with the browser's back button: put the folder back
    window.addEventListener("pageshow", () => {
      hero.querySelectorAll(".is-opening").forEach((f) => f.classList.remove("is-opening"));
    });
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
          else counters.forEach(runCounter);
        };
        raf = requestAnimationFrame(tick);
      }, HOLD));
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      title.classList.add("is-in");
      counters.forEach(runCounter);
    } else {
      render(0);
      new IntersectionObserver(([entry]) => { if (entry.isIntersecting) play(); }, { threshold: 0.55 }).observe(morph);
      new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) reset(); }, { threshold: 0 }).observe(morph);
      window.addEventListener("resize", () => {
        if (morph.classList.contains("is-grid")) render(1);
      });
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
