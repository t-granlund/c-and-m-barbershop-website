# Self-hosted webfonts

Two variable-font files, latin-subset only, serving the C&M site's full
typographic range (400–700) with a single request per family.

| File                        | Family     | Weights served | Size    |
| --------------------------- | ---------- | -------------- | ------- |
| `open-sans-variable.woff2`  | Open Sans  | 400, 500, 600, 700 | ~43 KB |
| `oswald-variable.woff2`     | Oswald     | 400, 500, 600, 700 | ~21 KB |
| `fonts.css`                 | `@font-face` declarations | — | 1.5 KB |

## Why self-hosted?

Per `C-and-M-Agent Directives.md` §4 and `research/barbershop-site-review/` §3:

- **Core Web Vitals** — removes 3 third-party round-trips (preconnect ×2 +
  the CSS file from `fonts.googleapis.com`). Fewer DNS lookups, fewer TLS
  handshakes, faster first paint.
- **Privacy** — no visitor IP leaks to Google. Relevant precedent:
  Munich LG judgment **3 O 17493/20** (2022-01-20), which still stands.
- **CSP tightening** — lets us drop `fonts.googleapis.com` from `style-src`
  and `fonts.gstatic.com` from `font-src` in `_headers`.

Both families ship under the **SIL Open Font License 1.1** — redistribution
is explicitly permitted.

## Regenerating (when Google bumps font versions)

If Oswald or Open Sans gets a new release and you want the latest glyph
tweaks, you can regenerate these files in ~30 seconds:

```bash
# 1. Fetch Google's CSS with a modern-browser UA (gets WOFF2 URLs only)
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) \
AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap" \
  -o fonts/_google-fonts.css

# 2. Run the extractor script committed in this folder (TODO if needed).
# For now: regeneration is a one-time concern. When it matters, re-run
# the inline script from the git history of commit that introduced this
# folder, or use https://gwfh.mranftl.com/fonts as a zero-code alternative.
```

## How it's loaded

`index.html` links `fonts/fonts.css` as a stylesheet **before** `styles.css`
and emits `<link rel="preload" as="font" ... crossorigin>` hints for both
WOFF2s so the browser starts fetching them in parallel with the HTML parse.
