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
- `js/main.js` — intro, hero, card hand, doodles, Brandfolio deck
- `assets/popstation-logo.svg` — vector logo (traced from `popstation-logo.webp`; the popcorn's three loops and each letter are separate paths, which the intro animates)
- `assets/img/` — photography (see the README in that folder)
- `brands/bumzee.html` — Bumzee case study (opens from its Brandfolio card); styles in `css/case.css`, script in `js/case.js`, images in `assets/img/bumzee/`
- `roles/` — one page per "Who we are" panel
- `assets/popcorn.svg` — the popcorn on its own (used in the "Who we are" headline)

## Sections

1. **Intro** — the popcorn's loops pop in, then "Pop Station" scribbles in.
2. **Hero** — "Built with your brand. From first sketch to shelf." with the key words in soft colour boxes, and the numbers (35+ years, 7+ years, 40+ brands, 300+ vendors, ₹2,000+ Cr) as small pills underneath.
3. **Marquee** — a thin scrolling strip of the categories we make.
4. **Who we are** — "who *we are:*" over a fanned hand of six team cards; each opens the team's page in `roles/`.
5. **Brandfolio** — brand cards; Bumzee opens its case study (`brands/bumzee.html`).
6. **Thank you + CTA** — "Thank you, *let's build!*" ringed by round icon stickers, with Start a project, Chat with Pop and See our work buttons (`#contact`).
7. **Pop, the chat assistant** — the popcorn button bottom-right on every page (`js/chat.js`, `css/chat.css`). It answers from the site's content; edit answers in `TOPICS`, and set `CONTACT_EMAIL` to route enquiries to an inbox.

Brand colours: the Popstation brand colours, softened into accents — Butter `#F4D77A` (yellow), Poppy `#DC6B3F` (red), Sky `#94B2ED` (blue) — with black `#1A1A1A` type on warm paper `#FAF5E6`. No pink. Client brand colours (Bumzee, Majestey, The Mom Store) stay their own.
