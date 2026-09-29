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
- `assets/popstation-logo.svg` — vector logo (traced from `popstation-logo.webp`; each letter is its own path, which the intro animates)
- `assets/img/` — optional photography (see the README in that folder)

## Sections

1. **Intro** — each letter of the logo draws itself in on its own brand-colour panel, then the full logo assembles on black.
2. **Who we are** — rolling list of Designers, Category Builders, Sourcing Specialists, Production Experts, Technology Builders, Brand Partners.
3. **Built with your brand** — headline words filled with imagery, the Popstation OS line and a scroll progress bar.
4. **By the numbers** — bento tiles with counting numbers.
5. **Brandpolio** — tilted brand cards with floating chips: Bumzee, Majestey London, The Mom Store. Add a brand by copying one `<article class="bcard">` in `index.html`.

Brand colours: Black `#000000`, White `#FFFFFF`, Jonquil `#FFCB0E`, Rojo `#E01D1E`, Steel blue `#2D7DD2`.
