/* Pop: the Popstation chat assistant.
   A self-contained FAQ bot: no server, it answers from what the site says.
   Add or edit answers in TOPICS below. To route "get in touch" to a real
   inbox, set CONTACT_EMAIL. */
(() => {
  const CONTACT_EMAIL = ""; // e.g. "hello@yourdomain.com"
  const base = (document.currentScript && document.currentScript.src.replace(/js\/chat\.js.*$/, "")) || "";
  const link = (path, text) => `<a href="${base}${path}">${text}</a>`;

  const contactLine = () => CONTACT_EMAIL
    ? `Write to us at <a href="mailto:${CONTACT_EMAIL}?subject=Let%27s%20build%20my%20brand">${CONTACT_EMAIL}</a> with a line about your brand, and the team will get back to you.`
    : `Tell us a little about your brand: what you make, who it's for and when you want to launch. The team will pick it up from there.`;

  // each topic: words that trigger it, the answer, and follow-up chips
  const TOPICS = [
    { id: "hello", words: ["hi", "hello", "hey", "hii", "namaste", "yo"],
      answer: () => "Hi! I'm Pop 🍿. I can tell you what Popstation does, the brands we've built, or how to start a project.",
      chips: ["What do you do?", "Brands you've built", "Start a project"] },
    { id: "what", words: ["what do you do", "services", "service", "offer", "about", "popstation", "foundry", "help"],
      answer: () => "Popstation is The Fashion Foundry: we build fashion brands from first sketch to shelf. Design, sourcing, production and delivery, connected by Popstation OS, with one team that stays with you through the build.",
      chips: ["Who's on the team?", "Categories you make", "How does it work?"] },
    { id: "teams", words: ["team", "teams", "who", "people", "designers", "category", "sourcing", "production", "technology", "partners"],
      answer: () => `Six teams under one roof: Designers, Category Builders, Sourcing Specialists, Production Experts, Technology Builders and Brand Partners. Meet them in ${link("index.html#who", "Who we are")}.`,
      chips: ["Design", "Sourcing", "Production"] },
    { id: "design", words: ["design", "designer", "sketch", "print", "prints", "tech pack", "techpack", "moodboard", "colourway", "colorway"],
      answer: () => "Our designers take a range from trend and moodboards to collection design, prints and graphics, colourways, flats and full tech packs, ready for the factory.",
      chips: ["Sourcing", "Production", "See an example"] },
    { id: "sourcing", words: ["sourcing", "fabric", "fabrics", "trims", "vendor", "vendors", "material", "materials", "sample", "sampling"],
      answer: () => "We source fabrics, trims and accessories through a network of 300+ vendors, handle sampling and work out costing with you.",
      chips: ["Production", "Pricing", "Start a project"] },
    { id: "production", words: ["production", "manufacturing", "manufacture", "factory", "bulk", "quality", "qc", "packaging", "delivery"],
      answer: () => "Production runs on 35 years of manufacturing: pattern and grading, bulk manufacturing, quality control, labels and packaging, and delivery.",
      chips: ["Minimum order?", "Timelines", "Start a project"] },
    { id: "tech", words: ["os", "technology", "tech", "ai", "software", "platform", "tracking"],
      answer: () => "Popstation OS and our AI-powered workflows connect every step, so approvals, production updates and reporting live in one place.",
      chips: ["How does it work?", "Start a project"] },
    { id: "categories", words: ["categories", "category", "kidswear", "kids", "infant", "baby", "menswear", "womenswear", "maternity", "streetwear", "loungewear", "activewear", "what do you make"],
      answer: () => "We make kidswear, infantwear, menswear, womenswear, maternity, streetwear, loungewear and activewear.",
      chips: ["Brands you've built", "Start a project"] },
    { id: "brands", words: ["brands", "brand", "clients", "client", "portfolio", "work", "bumzee", "majestey", "majesty", "mom store", "momstore", "example", "case study"],
      answer: () => `A few we build with: Bumzee (kidswear, end to end), Majestey London (design and packaging) and The Mom Store (garment production). See the full Bumzee story in ${link("brands/bumzee.html", "our case study")}, or browse ${link("index.html#brandfolio", "Brandfolio")}.`,
      chips: ["See an example", "By the numbers", "Start a project"] },
    { id: "numbers", words: ["numbers", "experience", "years", "how many", "how long have", "scale", "big"],
      answer: () => "35+ years in manufacturing, 7+ years incubating brands, 40+ brands launched, 300+ vendors, and ₹2,000+ Cr in ARR impacted.",
      chips: ["Brands you've built", "Start a project"] },
    { id: "how", words: ["how does it work", "process", "how it works", "steps", "start to finish", "workflow", "incubation", "incubate", "launch"],
      answer: () => "Roughly: we plan the range with you, design it, source materials and sample, then run bulk production and delivery. You get one team from first sketch to shelf, and we can help with the launch too.",
      chips: ["Timelines", "Pricing", "Start a project"] },
    { id: "price", words: ["price", "pricing", "cost", "costs", "budget", "charge", "fee", "fees", "quote", "expensive", "cheap"],
      answer: () => "Pricing depends on the range: categories, fabrics, quantities and how much of the build you want us to run. Share a few details and the team will put together a quote.",
      chips: ["Minimum order?", "Start a project"] },
    { id: "moq", words: ["moq", "minimum", "minimum order", "quantity", "quantities", "small batch"],
      answer: () => "Minimums depend on the product and fabric. Tell us what you have in mind and we'll suggest what works for your launch.",
      chips: ["Pricing", "Start a project"] },
    { id: "time", words: ["timeline", "timelines", "how long", "time", "weeks", "months", "deadline", "when"],
      answer: () => "Timelines depend on the range and how far along your designs are. Tell us your launch date and we'll plan the build backwards from it.",
      chips: ["How does it work?", "Start a project"] },
    { id: "contact", words: ["start", "contact", "talk", "call", "email", "reach", "get in touch", "enquiry", "inquiry", "work with you", "hire", "project", "quote"],
      answer: () => contactLine(),
      chips: ["What do you do?", "Brands you've built"] },
    { id: "thanks", words: ["thanks", "thank you", "thx", "great", "cool", "ok", "okay"],
      answer: () => "Anytime! Anything else you'd like to know?",
      chips: ["Brands you've built", "Start a project"] },
  ];
  const CHIP_TOPIC = {
    "What do you do?": "what", "Brands you've built": "brands", "Start a project": "contact",
    "Who's on the team?": "teams", "Categories you make": "categories", "How does it work?": "how",
    "Design": "design", "Sourcing": "sourcing", "Production": "production", "See an example": "brands",
    "Pricing": "price", "Minimum order?": "moq", "Timelines": "time", "By the numbers": "numbers",
  };

  const find = (text) => {
    const t = ` ${text.toLowerCase().replace(/[^a-z0-9₹+ ]/g, " ")} `;
    let best = null;
    let score = 0;
    TOPICS.forEach((topic) => {
      topic.words.forEach((w) => {
        if (t.includes(` ${w} `) || (w.includes(" ") && t.includes(w))) {
          const s = w.length;
          if (s > score) { score = s; best = topic; }
        }
      });
    });
    return best;
  };

  /* ---- markup ---- */
  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <button class="chat__launch" type="button" aria-expanded="false" aria-controls="chatPanel">
      <img src="${base}assets/popcorn.svg" alt="">
      <span>Ask Pop</span>
    </button>
    <section class="chat__panel" id="chatPanel" role="dialog" aria-label="Chat with Pop, the Popstation assistant" hidden>
      <header class="chat__head">
        <img src="${base}assets/popcorn.svg" alt="">
        <div><b>Pop</b><small>Popstation assistant</small></div>
        <button class="chat__close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="chat__log" aria-live="polite"></div>
      <div class="chat__chips"></div>
      <form class="chat__form">
        <input type="text" placeholder="Ask about services, brands, pricing…" aria-label="Your message" autocomplete="off">
        <button type="submit" aria-label="Send">→</button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const launch = root.querySelector(".chat__launch");
  const panel = root.querySelector(".chat__panel");
  const log = root.querySelector(".chat__log");
  const chipsEl = root.querySelector(".chat__chips");
  const form = root.querySelector(".chat__form");
  const input = form.querySelector("input");

  const say = (who, html) => {
    const m = document.createElement("div");
    m.className = `chat__msg chat__msg--${who}`;
    if (who === "me") m.textContent = html; else m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  };
  const setChips = (list) => {
    chipsEl.replaceChildren(...list.map((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => ask(label, CHIP_TOPIC[label]));
      return b;
    }));
  };
  const reply = (topic) => {
    const typing = document.createElement("div");
    typing.className = "chat__msg chat__msg--bot chat__typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      typing.remove();
      if (topic) { say("bot", topic.answer()); setChips(topic.chips); }
      else {
        say("bot", "I'm not sure about that one yet. I can help with what we do, our teams, brands we've built, pricing or how to start a project.");
        setChips(["What do you do?", "Brands you've built", "Pricing", "Start a project"]);
      }
    }, 550);
  };
  const ask = (text, topicId) => {
    say("me", text);
    reply(topicId ? TOPICS.find((t) => t.id === topicId) : find(text));
  };

  let started = false;
  const open = (state) => {
    panel.hidden = !state;
    launch.setAttribute("aria-expanded", state);
    root.classList.toggle("is-open", state);
    if (state && !started) {
      started = true;
      say("bot", TOPICS[0].answer());
      setChips(TOPICS[0].chips);
    }
    if (state) setTimeout(() => input.focus(), 50);
  };
  launch.addEventListener("click", () => open(panel.hidden));
  // anything with data-chat opens Pop ("open"), or asks that chip's question
  document.querySelectorAll("[data-chat]").forEach((el) => {
    el.addEventListener("click", () => {
      open(true);
      const q = el.dataset.chat;
      if (q !== "open") setTimeout(() => ask(q, CHIP_TOPIC[q]), 300);
    });
  });
  root.querySelector(".chat__close").addEventListener("click", () => { open(false); launch.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { open(false); launch.focus(); } });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    ask(text);
  });
})();
