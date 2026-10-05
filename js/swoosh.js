/* Draws a heading's underline swoosh once the heading scrolls into view. */
(function () {
  "use strict";
  const headings = Array.from(document.querySelectorAll(".swoosh"), (s) => s.closest("h1, h2, h3") || s.parentNode);
  if (!("IntersectionObserver" in window)) {
    headings.forEach((h) => h.classList.add("is-drawn"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-drawn");
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  headings.forEach((h) => io.observe(h));
})();
