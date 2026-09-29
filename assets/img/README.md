# Photography

Drop photos here with these exact names and they appear on the site automatically.
Until a file exists, that spot shows a brand-colour fill instead.

| File | Where it shows |
| --- | --- |
| `sketch.jpg` | "Built with" headline, first chip |
| `fabric.jpg` | "Built with" headline, second chip |
| `store.jpg` | "your brand." headline chip |
| `manufacturing.jpg` | 35+ years tile |
| `incubation.jpg` | 7+ years tile |
| `brands.jpg` | 40+ brands tile |
| `vendors.jpg` | 300+ vendors tile |
| `retail.jpg` | ₹2,000+ Cr tile |

### Brandpolio (`assets/img/brands/`)

| File | Where it shows |
| --- | --- |
| `bumzee-1.webp` | Bumzee card, main portrait (added) |
| `bumzee-2.webp` | Bumzee card, floating photo beside it; click it to swap (added) |
| `majestey-1.webp` | Majestey card, main portrait (added) |
| `majestey-2.webp` | Majestey card, floating photo beside it; click it to swap (added) |
| `momstore.jpg` | main portrait on The Mom Store card (shows the brand letter until added) |

To give The Mom Store a floating photo like Bumzee, copy Bumzee's
`<span class="tile-float tf-1 tf-photo" ...>` line into that card in `index.html`
and point `data-img` at the new file.

JPG or WebP both work; portrait crops (3:4) suit the brand cards.
