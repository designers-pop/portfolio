(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* reveal tiles as they scroll in; count numbers up */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          e.target.querySelectorAll("[data-count]").forEach(countUp);
          io.unobserve(e.target);
        });
      }, { threshold: 0.15 })
    : null;
  document.querySelectorAll(".reveal").forEach((el) => {
    if (io) io.observe(el);
    else { el.classList.add("is-in"); el.querySelectorAll("[data-count]").forEach(countUp); }
  });

  /* gallery filters */
  const items = [...document.querySelectorAll(".g-item")];
  const tabs = [...document.querySelectorAll(".filters button")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", t === tab));
      const f = tab.dataset.f;
      items.forEach((it) => { it.hidden = f !== "all" && it.dataset.cat !== f; });
    });
  });

  /* lightbox: click an item to enlarge; arrows step through what's showing */
  const box = document.getElementById("lightbox");
  if (box && box.showModal) {
    const img = box.querySelector("img");
    const cap = box.querySelector("figcaption");
    let current = 0;
    const visible = () => items.filter((it) => !it.hidden);
    const show = (it) => {
      const src = it.querySelector("img");
      img.src = src.src;
      img.alt = src.alt;
      const fc = it.querySelector("figcaption");
      cap.textContent = `${fc.querySelector("b").textContent} — ${fc.querySelector("span").textContent}`;
      current = visible().indexOf(it);
    };
    const step = (d) => { const v = visible(); show(v[(current + d + v.length) % v.length]); };
    items.forEach((it) => {
      const open = () => { show(it); box.showModal(); };
      it.addEventListener("click", open);
      it.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
    box.querySelector(".lightbox__prev").addEventListener("click", () => step(-1));
    box.querySelector(".lightbox__next").addEventListener("click", () => step(1));
    box.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
