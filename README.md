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
- `js/main.js` — intro, hero, card hand, Brandfolio slider
- `js/cta.js` + `css/cta.css` — the floating "Work with us" button on every page and its enquiry form (name, phone, email, message → thank-you). Set `FORM_ENDPOINT` in `js/cta.js` to a form service (e.g. Formspree) so enquiries are delivered; until then nothing is sent.
- `assets/popstation-logo.svg` — vector logo (traced from `popstation-logo.webp`; the popcorn's three loops and each letter are separate paths, which the intro animates)
- `assets/img/` — photography (see the README in that folder)
- `brands/majestey.html` — Majestey London case study (identity, monogram, packaging, product); images in `assets/img/majestey/`
- `brands/bumzee.html` — Bumzee case study (opens from "More about the brand" in the Brandfolio); styles in `css/case.css`, script in `js/case.js`, images in `assets/img/bumzee/`
- `roles/` — one page per "Who we are" panel
- `assets/popcorn.svg` — the popcorn on its own (used in the "Who we are" headline)

## Sections

1. **Intro** — the popcorn's loops pop in, then "Pop Station" scribbles in.
2. **Hero** — "Built with your brand. From first sketch to shelf." with the key words in red, black and yellow boxes, and the numbers (35+ years, 7+ years, 40+ brands, 300+ vendors, ₹2,000+ Cr) as small pills underneath.
3. **Marquee** — a thin scrolling strip of the categories we make.
4. **Who we are** — "who *we are:*" over a fanned hand of six team cards; each opens the team's page in `roles/`.
5. **Brandfolio** — one brand per slide: the brand's interactive card on the left (tilts with the pointer, tap the photo panel to swap it into the disc, click to open the case study), its details on the right in its own colours with "More about the brand" (`brands/`).
6. **Thank you + CTA** — "Thank you, *let's build!*" ringed by round icon stickers, with Start a project, Chat with Pop and See our work buttons (`#contact`).
7. **Pop, the chat assistant** — the popcorn button bottom-right on every page (`js/chat.js`, `css/chat.css`). It answers from the site's content; edit answers in `TOPICS`, and set `CONTACT_EMAIL` to route enquiries to an inbox.

Brand colours: the original Popstation logo colours. Red `#E01D1E` and black `#1A1A1A` lead, red is the highlight, and yellow `#FFCB0E` is a small accent, all on warm paper `#FAF5E6`. No blue, no pink. Client brand colours (Bumzee, Majestey, The Mom Store) stay their own.
