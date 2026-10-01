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
- `roles/` — one page per "Who we are" panel
- `assets/popcorn.svg` — the popcorn on its own (used in the "Who we are" headline)

## Sections

1. **Intro** — on a blush screen, the popcorn's three loops pop in one by one with a burst of crumbs, then "Pop Station" scribbles in (black, with red and yellow accents).
2. **Who we are** — six expanding panels on blush (Designers, Category Builders, Sourcing Specialists, Production Experts, Technology Builders, Brand Partners), each in its own colour with its own icon. Hover or tap opens one; they also cycle on their own. "Explore" opens the team's page in `roles/` (placeholders to fill in).
3. **How we build → By the numbers** — one screen that plays by itself: the coloured word boxes of "Built with your brand. From first sketch to shelf." grow into five number cards, each with a small toy: a shape-changing icon, bobbing bars (hover for the year), a Launch toggle with confetti, a gauge you can drag, and a popcorn button to the brands. Replays each time you come back.
4. **Marquees** — scrolling strips between the screens: categories we make (yellow), what we do (red), how we help brands (blue). Edit the words in `index.html`.
5. **Brandfolio** — tilted brand cards with floating chips that lean toward the cursor and flip on click: Bumzee, Majestey London, The Mom Store. Add a brand by copying one `<article class="bcard">` in `index.html`.

Brand colours: Black `#000000`, White `#FFFFFF`, Jonquil `#FFCB0E`, Rojo `#E01D1E`, Steel blue `#2D7DD2`.
