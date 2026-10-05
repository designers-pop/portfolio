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
  const CRUMBS = ["#e01d1e", "#1a1a1a", "#ffcb0e"];

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

  // run fn once the intro has gone (straight away if there is none)
  const afterIntro = (fn) => {
    if (!intro || introFinished) return fn();
    const watch = new MutationObserver(() => {
      if (intro.classList.contains("is-done")) { watch.disconnect(); fn(); }
    });
    watch.observe(intro, { attributes: true, attributeFilter: ["class"] });
  };

  /* ---------------- Who we are: the hand of cards ----------------
     The cards fan out (CSS) when the screen comes into view. */

  const hero = document.getElementById("who");
  if (hero) {
    const showPosters = () => hero.classList.add("is-in");
    if (reduceMotion || !("IntersectionObserver" in window)) showPosters();
    else {
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { showPosters(); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(hero);
    }
  }

  /* ---------------- Thank you: stickers pop in on scroll ---------------- */

  const thanks = document.getElementById("contact");
  if (thanks) {
    if (reduceMotion || !("IntersectionObserver" in window)) thanks.classList.add("is-in");
    else {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { thanks.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.3 });
      io.observe(thanks);
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

  /* ---------------- Hero: Built with your brand ----------------
     The first screen: once the intro has gone, the headline's words drop
     in, then the stat pills appear and count up. */

  const home = document.getElementById("build");
  if (home) {
    const playHome = () => {
      home.classList.add("is-playing");
      home.querySelector(".build__title").classList.add("is-in");
      setTimeout(() => home.querySelectorAll("[data-count]").forEach(runCounter), reduceMotion ? 0 : 1300);
    };
    afterIntro(playHome);
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
      const caseLink = document.getElementById("brandCase");
      caseLink.hidden = !card.dataset.case;
      if (card.dataset.case) {
        caseLink.href = card.dataset.case;
        caseLink.setAttribute("aria-label", `See our work for ${card.dataset.name}`);
      }
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
        // brands with a case study open it; the rest flip to show the back
        if (card.dataset.case) { window.location.href = card.dataset.case; return; }
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
