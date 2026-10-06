/* Coming back to the home page.
   - The popcorn intro plays once per visit (per browser tab); after that
     the home page opens straight onto the site.
   - The home page remembers where you were. The logo and the "←" back
     links on the other pages return you to that spot instead of the top
     (or the section in the link), and so does the browser's back button. */
(function () {
  "use strict";

  const KEY_Y = "ps-home-y";
  const KEY_RETURN = "ps-home-return";
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: (k) => { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  const isHome = !!document.getElementById("intro");

  // the floating buttons (Work with us, Ask Pop) step aside for the footer
  const footer = document.querySelector(".footer");
  if (footer && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      document.documentElement.classList.toggle("at-footer", e.isIntersecting);
    }).observe(footer);
  }


  if (isHome) {
    // remember the spot whenever the visitor leaves the home page
    const save = () => store.set(KEY_Y, String(Math.round(window.scrollY)));
    window.addEventListener("pagehide", save);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (a && a.origin === location.origin && a.pathname !== location.pathname) save();
    });

    // came back through a back link or the browser's back button: go to
    // the remembered spot, instantly
    const y = store.get(KEY_Y);
    const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    const backButton = nav && nav.type === "back_forward";
    if ((store.get(KEY_RETURN) || backButton) && y !== null) {
      store.del(KEY_RETURN);
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      const go = () => window.scrollTo({ top: Number(y), behavior: "instant" });
      go();
      requestAnimationFrame(go);
      window.addEventListener("load", go, { once: true });
    }
    return;
  }

  // other pages: the header logo gets its soft backing once scrolled
  // (the home page does this in main.js)
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // other pages: the logo and "←" links back to the home page return to
  // the remembered spot when there is one
  document.querySelectorAll('a[href*="index.html"]').forEach((a) => {
    const back = a.classList.contains("nav__logo") || a.textContent.trim().startsWith("←");
    if (!back || a.hasAttribute("data-wwu")) return;
    a.addEventListener("click", (e) => {
      if (store.get(KEY_Y) === null || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      store.set(KEY_RETURN, "1");
      location.href = a.href.split("#")[0];
    });
  });
})();
