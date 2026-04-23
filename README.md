# C&M Barber Shop & Family Hair — Website

A conversion-first, mobile-first, zero-framework static site for
**C&M Barber Shop & Family Hair** (Pineville, MO) — the "Updated Classic"
rebuild replacing the previous default Google Sites template at
[www.candmbarbershop.net](https://www.candmbarbershop.net).

Built by Tyler, on a handshake.

---

## 👀 Live preview

Two separate URLs on the same GitHub Pages deployment:

| | URL | For |
|---|---|---|
| 🏪 **Site preview** | **https://t-granlund.github.io/c-and-m-barbershop-website/** | Charles &amp; Marie to see what their future website looks like |
| 📖 **Owner guide** | **https://t-granlund.github.io/c-and-m-barbershop-website/guide/** | The friendly step-by-step deployment walkthrough |

The GitHub Pages deployment is a **preview / demo** so Charles &amp; Marie can see
the site before approving the real launch. It is explicitly **not** the
intended production host.

### Why it's a preview, not the final site

- **GitHub Pages does not support custom HTTP headers**, so our `_headers`
  file (CSP, HSTS, Permissions-Policy, font cache-control, etc.) is
  silently ignored here. Mozilla Observatory grade on this preview
  is around a **C**; on the production Cloudflare Pages deployment
  it's **A+**.
- GitHub's ToS prohibits running a commercial business site on Pages
  long-term (`research/barbershop-architecture-2025/raw-findings/hosts-comparison.md`).
- The canonical URL in `index.html` still points at
  `https://www.candmbarbershop.net/` — deliberate, so Google never
  confuses the preview for the real site once it launches.
- The Cloudflare Analytics beacon is a harmless no-op here
  (`REPLACE_WITH_TOKEN` placeholder — see §Analytics below).

### The production plan

When Charles &amp; Marie approve, the owner-facing `guide/index.html`
walks them (or a $30–75 Fiverr pro) through deploying the exact same
repo to **Cloudflare Pages**, which:

- Supports `_headers` → restores the A+ security posture.
- Has unlimited free bandwidth and no commercial-use restriction.
- Can be connected directly to this GitHub repo for auto-deploys on every
  `git push` — no more drag-and-drop after the first setup.

In short: **this preview is read-only marketing; Cloudflare Pages is the
live storefront.**

---

## 📦 What's in here

| File                     | Purpose                                                 |
| ------------------------ | ------------------------------------------------------- |
| `index.html`             | Semantic markup + all copy + HairSalon JSON-LD schema   |
| `styles.css`             | Design tokens, reset, nav, hero, stats, live-status     |
| `components.css`         | Story, services, team, hours, visit, footer, mobile CTA |
| `script.js`              | Footer year + live "Open Now" status engine (TZ-aware)  |
| `cm-logo.svg`            | C&M brand mark (red oval + navy poles + mustache)       |
| `fonts/`                 | Self-hosted Oswald + Open Sans variable WOFF2 (~63 KB)  |
| `_headers`               | HTTP security headers (CSP, HSTS, etc.) — **do not delete** |
| `guide/index.html`       | Non-technical deployment guide for Charles & Marie (self-contained, served at `/guide/`) |
| `QUICK_START.txt`        | One-page printable checklist (≤55 lines)                |
| `C-and-M-Agent Directives.md` | Brand / vision / future-state directives           |
| `LICENSE`                | Copyright notice — site content is not freely reusable  |

```bash
# Preview locally
python3 -m http.server 8080    # then visit http://localhost:8080
# Or just double-click index.html (some features degrade on file://)
```

---

## 🎨 Design system — "Updated Classic"

Per `C-and-M-Agent Directives.md` §4:

| Token             | Hex        | Use                              |
| ----------------- | ---------- | -------------------------------- |
| Heritage Red      | `#BE2B2D`  | Primary CTAs, accents            |
| True Navy         | `#1B365D`  | Secondary / dark surfaces        |
| Crisp White       | `#FFFFFF`  | Backgrounds                      |
| Charcoal Black    | `#231F20`  | Body text                        |

**Typography:** Oswald (headings + condensed) + Open Sans (body).
**Self-hosted** as variable WOFF2s in `/fonts/` — latin subset only, single
file per family covering all weights 400–700. Total footprint ~63 KB.
Removes 3 third-party round-trips, eliminates the GDPR exposure flagged in
`research/barbershop-site-review/` §3, and lets `_headers` drop
`fonts.googleapis.com` / `fonts.gstatic.com` from the CSP entirely.
See `fonts/README.md` for regeneration instructions.

---

## 🏁 Conversion-first principles

Every decision on this site serves ONE KPI:
visitor → tap Call or Text on a stylist's card → booked.

- **Hero above the fold** (mobile): name, tagline, primary CTA (Pick Your
  Stylist), secondary CTA (Directions). No hero carousel, no autoplay video.
- **Sticky mobile CTA bar** pinned to the bottom — one tap to Team section
  from anywhere on the page.
- **Every stylist card = Call + Text buttons.** Double the conversion surface.
  `aria-label`s disambiguate for screen readers.
- **Live "Open Now" indicator** in the hero eyebrow + hours section. TZ-aware
  (`America/Chicago`) via `Intl.DateTimeFormat`.
- **Credibility stat bar** right under the hero: 2005 · 80+ years · 6 stylists
  · All welcome.
- **Inclusivity-forward hero copy**: *"Classic service for the modern family.
  Men, women, and kids welcome"* — overrides the default masculine read of
  the word "Barber".
- **HairSalon JSON-LD** in `<head>` — Google Rich Results eligibility for
  local map-pack queries.

---

## 🚀 Deployment

**Primary recommendation: Cloudflare Pages** (free, unlimited bandwidth,
unlimited requests, auto HTTPS, supports our `_headers` file).

See `guide/index.html` (served at `/guide/`) for the owner-facing walkthrough.

### Dev-facing quick deploy

```bash
# Option 1 — Cloudflare Pages Direct Upload (recommended)
# 1. Zip the 6 deployment files (exclude research/, this README, etc.)
# 2. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages → Upload
# 3. Drag the folder, name the project, done.
#
# Option 2 — Netlify Drop (fallback if Cloudflare is down)
# 1. https://app.netlify.com/drop
# 2. Drag folder. Free tier gives ~15 GB bandwidth/month (Sep 2025 pricing).
#
# Do NOT use GitHub Pages or Vercel free tier — both prohibit commercial
# use in their ToS. Evidence: research/barbershop-architecture-2025/
# raw-findings/hosts-comparison.md.
```

### Files to deploy (exclude from upload)

Deploy: `index.html`, `styles.css`, `components.css`, `script.js`,
`cm-logo.svg`, `_headers`, `fonts/` (the whole folder),
`robots.txt`, `sitemap.xml`.

**Exclude:** `research/`, `README.md`, `C-and-M-Agent Directives.md`,
`LICENSE`, `guide/` (owner-only — optional to deploy), `QUICK_START.txt` (owner-only),
`.gitignore`, `.git/`.

---

## 🔒 Security & privacy posture

- **`_headers` file** ships CSP, HSTS (2-year preload), X-Content-Type-Options,
  X-Frame-Options DENY, Referrer-Policy, Permissions-Policy (all sensors
  denied), COOP same-origin. Mozilla Observatory grade: A+.
- **No cookies set by this site.** No analytics (yet — see below).
- **Google Maps iframe** is lazy-loaded with `referrerpolicy="no-referrer"`.
  For strict privacy, can be swapped to a click-to-load static-image pattern —
  see `research/barbershop-site-review/a11y-privacy-handoff.md` §2.2.
- **Fonts are self-hosted** (see Typography above). No third-party font CDN
  in the critical path.

### Analytics — stub in place, activate post-deploy

The [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)
beacon script is already embedded at the bottom of `index.html` with a
`REPLACE_WITH_TOKEN` placeholder. To activate:

1. Deploy the site first, then go to Cloudflare dashboard →
   **Analytics & Logs** → **Web Analytics** → **Add a site**.
2. Paste the domain, copy the token Cloudflare gives you.
3. Open `index.html`, replace `REPLACE_WITH_TOKEN` with the token, re-upload.

Until step 3 is done, the beacon is a harmless no-op (Cloudflare ignores
unrecognised tokens). Cookieless, no banner required, free, unlimited.

---

## 🏛️ Business facts (single source of truth for copy)

- **Founded:** 2005 by Charles (Barber · Co-founder) and Marie (Cosmetologist).
- **Original location:** Bella Vista, AR (2005–2025).
- **Current location:** 116 College Road #107, Pineville, MO 64856 — just
  north of Jane Walmart, behind Taco Bell. **Relocated June 2025.**
- **Team:** 6 stylists/barbers, **80+ years of combined experience.**
- **Hours:** Mon–Fri 8:00–5:00 · Sat 8:00–12:00 · Sun closed.
- **Owner profile:** Charles is 55 — the shop's 20-year tenure plus his
  decades of craft are the legacy anchor. (Do *not* describe the shop itself
  as "55 years old" — that conflates owner age with business age.)
- **Positioning:** *Fully inclusive family shop — men, women, and kids welcome.*
- **Tagline:** *"Classic service for the modern family."* Pair with the
  original *"Walk-ins Always Welcome."*
- **Social:**
  [Facebook](https://facebook.com/c.and.m.cuts)
  · [Instagram](https://instagram.com/c.m.barbershop)

### Stylists

Six stylists. Names + roles live in `index.html` in the Team section.
Phone numbers are on the live site for conversion (call/text links) — see
the rendered page for current contact info. Roles verified via a 2019
Bella Vista Neighbors article for Charles & Jennifer; the other four are
listed as "Stylist" pending in-person confirmation.

> **Note on publishing phone numbers:** the six stylist numbers are already
> public on C&M's Facebook page, so the incremental risk from publishing
> on the website is minimal. Per the Solutions Architect P0-4
> recommendation, consider getting written acknowledgment from each
> stylist before launch. Document removal process: numbers can be
> deleted from `index.html` and redeployed, but git history is permanent
> on a public repo — be intentional.

---

## ♿ Accessibility (WCAG 2.2 AA target)

- Semantic landmarks: `<header>`, `<nav>`, `<main>`-like sections, `<footer>`.
- Skip-to-content link (2.4.1 Bypass Blocks).
- `:focus-visible` ring on every interactive element (2.4.7 Focus Visible).
- `prefers-reduced-motion` honored on hero bob, pulse dot, and smooth-scroll.
- `aria-label`s on per-stylist Call/Text buttons (disambiguates for SR users).
- Color contrast: Heritage Red (`#BE2B2D`) and True Navy (`#1B365D`) both
  pass AA on white; white text passes AA on both.
- `tel:` / `sms:` links with proper E.164 formatting.
- Known manual-audit gap: target-size (2.5.8) and focus-not-obscured (2.4.11)
  require human QA at iPhone SE viewport — see Experience Architect review
  checklist in `./research/barbershop-site-review/`.

### Automated audit

```bash
# Recommended 2026 tooling stack
npx pa11y@9 --standard WCAG2AA --runner axe --runner htmlcs http://localhost:8080
# or Lighthouse (built into Chrome DevTools, v13+)
```

---

## 🛣️ Roadmap

### Phase 2 candidates (post-launch, pragmatic)

- **Real shop photography** — hero shot featuring a woman or child in the
  chair (per directives §4); individual stylist headshots to replace
  initial-circle placeholders.
- **Embedded reviews / social proof** — 3–5 hand-curated quotes from
  Facebook reviews, in a `<section>` before "Visit." BrightLocal LCRS 2026:
  31% of consumers now filter to 4.5★+ only.
- **[Decap CMS](https://decapcms.org/)** layer so Charles & Marie can edit
  hours / staff via a `/admin` web UI without touching HTML.
- **Reserve with Google** booking widget (Square / Booksy / Vagaro deep-link).
- **Walk-ins Traffic Light** 🟢🟡🔴 — owner-toggled wait-time indicator.
- **Activate Cloudflare Web Analytics** — beacon stub already embedded; only
  needs a token paste post-deploy (see "Analytics" above).

### Phase 3 aspirational (revisit only if needed)

Firebase App Hosting / Next.js / Angular / Firestore / Gemini agentic CMS —
see `C-and-M-Agent Directives.md` §5. **Deferred** because the current static
architecture is the right tool for the job; these would be over-engineered for
a 6-chair barbershop with bi-annual content changes.

---

## 🧠 Engineering notes

- **No frameworks, no bundlers, no build step.** Deployment = upload files.
- **DRY:** colors / type / spacing live in CSS custom properties shared
  across both stylesheets. Legacy token names (`--forest-900`,
  `--cream`, etc.) are kept as aliases to the new heritage palette — one
  place to update.
- **YAGNI:** `script.js` does two things on purpose (footer year +
  open/closed). No jQuery, no dependencies, no build.
- **File-length budget:** styles.css + components.css split along the "site
  chrome vs. section components" boundary when combined > 600 lines.
  Cohesive, not arbitrary.
- **Timezone-honest status:** `Intl.DateTimeFormat` with `America/Chicago`
  so "Open Now" is correct even for visitors on a plane in another time zone.

---

## 🆘 Disaster recovery

> If you're reading this because the live site is broken and Tyler is
> unreachable, here is the minimum-viable restore path.

1. **Your files are safe** on GitHub (this repo) and/or Tyler's email /
   USB backup.
2. **If the Cloudflare Pages account got locked/deleted:**
   sign up for a new one, drag the project folder onto Cloudflare Pages
   Direct Upload, reconnect the custom domain. ~30 minutes.
3. **If the domain lapsed:**
   log into your registrar (Squarespace / GoDaddy / Namecheap / Cloudflare /
   Porkbun) and renew. If within 30 days of expiry, straight renewal. Past
   30 days, there's a redemption fee (~$80). **Set auto-renew** to avoid
   this permanently.
4. **If you need to hire a pro:** post on Fiverr with title
   *"Restore my Cloudflare Pages static site"* — budget $50-100, 24-hour turn.

### Credential escrow

Someone besides Tyler should have (written on paper, in the shop's filing
cabinet — not in a shared Google Doc):

- [ ] Domain registrar login (email + registrar name)
- [ ] Cloudflare account login
- [ ] Access to the GitHub repo (if the shop wants to update directly)

---

## 📚 Related docs

- **`C-and-M-Agent Directives.md`** — brand, vision, future-state directives
- **`guide/index.html`** — owner-facing deploy guide (served at `/guide/`)
- **`QUICK_START.txt`** — one-page printable checklist
- **`research/`** — architecture, conversion, a11y, privacy research packs
  (excluded from deployment via `.gitignore`)

Questions? Contact the site maintainer via the issue tracker on this repo.
