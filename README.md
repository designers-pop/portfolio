# Popstation — The Fashion Foundry

Portfolio website for Popstation. Plain HTML, CSS and JavaScript — no build step.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
npx http-server .
```

## Structure

- `index.html` — page content
- `css/style.css` — brand colours, layout and all animations
- `js/main.js` — intro timing, rolling hero list, scroll reveals, number count-ups
- `assets/popstation-logo.svg` — vector logo (traced from `popstation-logo.webp`; the popcorn's three loops and each letter are separate paths, which the intro animates)
- `assets/img/` — photography (see the README in that folder)
- `brands/bumzee.html` — Bumzee case study (opens from its Brandfolio card); styles in `css/case.css`, script in `js/case.js`, images in `assets/img/bumzee/`
- `roles/` — one page per "Who we are" panel
- `assets/popcorn.svg` — the popcorn on its own (used in the "Who we are" headline)

## Sections

1. **Intro** — on a blush screen the popcorn's loops pop in, then "Pop Station" scribbles in.
2. **How we build → By the numbers** (first screen) — plays by itself once the intro ends: the coloured word boxes of "Built with your brand. From first sketch to shelf." grow into five number cards, each with a small toy (shape-changing icon, bobbing bars, Launch toggle with confetti, draggable gauge, popcorn button to the brands).
3. **Marquee** — a thin scrolling strip of the categories we make. Edit the words in `index.html`.
4. **Who we are** — "who *we are:*" over a fanned hand of six team cards, each in a palette colour with a sticker icon and a ✦ list of what the team does. The hand fans out on scroll; hover lifts a card; each card opens the team's page in `roles/` (placeholders to fill in).
5. **Brandfolio** — tilted brand cards with floating panels that lean toward the cursor and flip on click: Bumzee, Majestey London, The Mom Store. Add a brand by copying one `<article class="bcard">` in `index.html`.

Brand colours (after the iz card): amber `#FFB21F`, marker orange `#F07F1E`, navy `#24398A`, deep navy `#1C2A66` for type, paper `#F6EFE3` and beige `#E8DCC8`, with hand-drawn orange marker doodles. Client brand colours (Bumzee, Majestey, The Mom Store) stay their own.
