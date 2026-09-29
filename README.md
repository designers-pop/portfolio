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
- `roles/` — one page per "Who we are" folder

## Sections

1. **Intro** — on soft pastel paper with scalloped badges, three kernels pop into the popcorn, a big badge grows behind it and "Pop Station" bounces up.
2. **Who we are** — a stack of red folders (Designers, Category Builders, Sourcing Specialists, Production Experts, Technology Builders, Brand Partners). Each folder opens its page in `roles/`; those pages are placeholders to fill in.
3. **How we build → By the numbers** — one screen that plays by itself: the filled word boxes of "Built with your brand. From first sketch to shelf." grow into the number tiles, which then count up. It replays each time you come back to it.
4. **Brandpolio** — tilted brand cards with floating chips that lean toward the cursor and flip on click: Bumzee, Majestey London, The Mom Store. Add a brand by copying one `<article class="bcard">` in `index.html`.

Brand colours: Black `#000000`, White `#FFFFFF`, Jonquil `#FFCB0E`, Rojo `#E01D1E`, Steel blue `#2D7DD2`.
