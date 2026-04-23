# C&M Barber Shop: Digital Transformation & Agentic Execution Plan

> **How to use this document alongside the rest of the project:**
> This doc captures the **vision, brand, and aspirational direction** for the C&M rebuild.
> It should be read alongside — not in place of — two other authoritative inputs:
>
> - **`./research/`** — evidence-based findings on 2026 conversion, WCAG 2.2 AA, privacy,
>   local SEO schema, static hosting options, and non-technical handoff patterns.
> - **The current implementation** (`index.html`, `styles.css`, `components.css`, `script.js`,
>   `guide/index.html`, `QUICK_START.txt`, `README.md`) — the working, shipped reality
>   these directives should evolve, not erase.
>
> Where this doc disagrees with the research or the current site on a **matter of fact**
> (business history, location, technical reality), the research and current build win.
> Where it disagrees on a **matter of brand or vision** (palette, typography, inclusivity
> positioning, future features), this doc leads.

---

## 1. Project Overview & Directives for AI Agents

**Target Business:** C&M Barber Shop
**Current Location:** 116 College Road #107, Pineville, MO 64856 *(relocated June 2025)*
**Historical Location:** Bella Vista, Arkansas *(2005–2025 — honored in the site's story/timeline)*
**Founded:** 2005 by Charles (Barber) and Marie (Cosmetologist)
**Owner Profile:** Charles is 55 years old — a seasoned barber whose craft (and his team's 80+ combined years of experience) is the shop's legacy anchor. This is **not** a 55-year-old business; it is a **20-year-old business run by a 55-year-old master of the trade.**
**Service Area:** Northwest Arkansas corridor (Bella Vista, Bentonville, Jane, Pineville MO) — cross-state commuter customers.

**Objective:** Modernize the digital presence of a long-tenured, community-rooted local business. Build a state-of-the-art, low-maintenance website that honors the traditional roots of the shop while explicitly welcoming **men, women, and children**.

**Agent Directives:** Use this document as the authoritative source for **branding, design, tone, and future-state feature direction**. Use `./research/` as the authoritative source for **technical architecture, conversion patterns, accessibility, privacy, and hosting decisions**. The owners are moderately IT-proficient but require a genuine "set it and forget it" experience — optimize accordingly, and when this doc and the research disagree on a technical recommendation, the research wins.

---

## 2. Brand Identity & Scalable Logo Asset

**Directive:** Save the SVG below as `cm-logo.svg` in the project root to serve as the primary branding asset across the digital platform. This logo removes the "Walk-Ins Welcome" text to serve as a clean, scalable brand mark while preserving the core legacy elements (red oval, classic typography, mustache, and barber poles).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <!-- Red Oval Background -->
  <ellipse cx="200" cy="150" rx="140" ry="85" fill="#BE2B2D"/>

  <!-- Top Black Circle with C&M -->
  <circle cx="200" cy="65" r="35" fill="#231F20"/>
  <text x="200" y="75" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" text-anchor="middle">C&amp;M</text>

  <!-- Barber Shop Text -->
  <text x="200" y="145" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" text-anchor="middle">BARBER</text>
  <text x="200" y="195" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" text-anchor="middle">SHOP</text>

  <!-- Mustache Base -->
  <path d="M 110 215 Q 150 245 200 225 Q 250 245 290 215 Q 250 255 200 240 Q 150 255 110 215 Z" fill="#231F20"/>

  <!-- Left Barber Pole -->
  <g transform="translate(30, 90)">
    <path d="M 12 0 C 6 0, 0 6, 0 12 L 24 12 C 24 6, 18 0, 12 0 Z" fill="#231F20"/>
    <rect x="2" y="12" width="20" height="96" fill="#FFFFFF" stroke="#231F20" stroke-width="2"/>
    <path d="M 0 108 L 24 108 C 24 114, 18 120, 12 120 C 6 120, 0 114, 0 108 Z" fill="#231F20"/>
    <polygon points="2,20 22,40 22,50 2,30" fill="#1B365D"/>
    <polygon points="2,45 22,65 22,75 2,55" fill="#BE2B2D"/>
    <polygon points="2,70 22,90 22,100 2,80" fill="#1B365D"/>
  </g>

  <!-- Right Barber Pole -->
  <g transform="translate(346, 90)">
    <path d="M 12 0 C 6 0, 0 6, 0 12 L 24 12 C 24 6, 18 0, 12 0 Z" fill="#231F20"/>
    <rect x="2" y="12" width="20" height="96" fill="#FFFFFF" stroke="#231F20" stroke-width="2"/>
    <path d="M 0 108 L 24 108 C 24 114, 18 120, 12 120 C 6 120, 0 114, 0 108 Z" fill="#231F20"/>
    <polygon points="2,20 22,40 22,50 2,30" fill="#1B365D"/>
    <polygon points="2,45 22,65 22,75 2,55" fill="#BE2B2D"/>
    <polygon points="2,70 22,90 22,100 2,80" fill="#1B365D"/>
  </g>
</svg>
```

---

## 3. Business & Competitive Analysis

- **The Business:** C&M Barber Shop — originally opened in **Bella Vista, AR in 2005** by Charles and Marie, relocated to **Pineville, MO in June 2025** (116 College Road #107, just north of Jane Walmart, behind Taco Bell). While its branding leans on a classic, masculine aesthetic, C&M is a **fully inclusive family shop** catering to men, women, and kids. The team brings 80+ combined years of experience across 6 stylists.
- **The Market:** Northwest Arkansas (Bella Vista / Bentonville / Rogers) plus the MO cross-border commuter corridor is growing rapidly with transplants and corporate workers. Competition ranges from ultra-modern hipster salons to sterile corporate chains.
- **Value Proposition:** Authenticity, community trust, multigenerational continuity, and genuine family-friendly service. C&M provides a reliable, high-quality, and reasonably priced experience without pretense.

---

## 4. "Updated Classic" Design System

Agents generating UI/UX components must adhere strictly to these constraints to ensure the owners feel respected and the brand doesn't lose its soul. **This represents a rebrand from the current forest-green/cream palette in `styles.css` and requires coordinated updates across CSS tokens, fonts, and component styling.**

### Color Palette

| Token | Hex | Role |
|---|---|---|
| Heritage Red | `#BE2B2D` | Primary — warm, inviting, traditional |
| True Navy | `#1B365D` | Secondary — professional, trustworthy |
| Crisp White | `#FFFFFF` | Backgrounds — clean, state-of-the-art |
| Charcoal Black | `#231F20` | Text — softer than pure black, easy to read |

### Typography

- **Headings:** **Oswald** or **Montserrat** (Bold, slightly condensed — a nod to vintage sign-painting but sharp on mobile).
- **Body Text:** **Open Sans** (highly readable, accessible for older demographics).
- **Implementation note:** Per `research/barbershop-site-review/` §3, **self-host the WOFF2 files** rather than hot-linking Google Fonts — both for Core Web Vitals and for the CSP-tightening benefit documented in the solutions-architect review.

### Imagery Guidelines

- **NO GENERIC STOCK PHOTOS.** Placeholders must specify: *warm, brightly-lit photos of the actual shop.*
- **Crucial — override the "men only" assumption of the word *Barber*:** the hero section or homepage must prominently feature imagery of **a woman and/or a child in the barber chair** to visually communicate "all are welcome."
- Include at least one group/team shot and individual stylist headshots (these replace the current initial-circle placeholders).

### Voice and Tone

Respectful, straightforward, and welcoming. Avoid tech-jargon. Example phrasing:
- *"Bella Vista's trusted family barbershop — now in Pineville."*
- *"Classic service for the modern family."*
- *"Twenty years of good haircuts, and we're just getting started."* *(already in use — keep)*

---

## 5. Technology Stack & Agentic Infrastructure

> ⚠️ **Alignment note:** This section was authored as an aspirational long-term target. For the **initial v1 ship**, defer to the architecture guidance in `research/barbershop-architecture-2025/` and the solutions-architect review:
>
> - The **current 4-file static build on Cloudflare Pages** is the correct v1 choice (unlimited bandwidth free tier, zero TCO beyond domain, perfect "set it and forget it" fit for owners).
> - Firebase / Next.js / Angular / Firestore / Gemini integration are **Phase 3 candidates**, not v1 requirements — revisit only if concrete owner needs emerge that the static approach can't serve.
> - Small-business evidence suggests the owner's content-update pain is best solved first with a lightweight JSON data file + (optionally) **Decap CMS** before introducing a serverless framework.

### Phase 1 — Ship (static, what's built now)
- **Hosting:** Cloudflare Pages (free tier — unlimited bandwidth, unlimited requests, auto HTTPS).
- **Content:** Hand-edited HTML + a centralized `site-data.json` for hours, stylists, phone numbers.
- **Analytics:** Cloudflare Web Analytics (cookieless, free, no banner required).
- **Security:** `_headers` file with CSP, HSTS, Permissions-Policy.

### Phase 2 — Light CMS layer (if/when owner asks)
- **Content Management:** [Decap CMS](https://decapcms.org/) on top of the static site, backed by GitHub. Provides an `/admin` web UI for the owners to edit hours, stylists, and copy without touching HTML. Free, open source.
- **Booking:** "Reserve with Google" via Square / Booksy / Vagaro deep-link embed.

### Phase 3 — Agentic & advanced (aspirational — evaluate only if owners want it)
- **Agentic Updates:** Gemini-for-Google-Workspace integration where plain-language instructions ("Update holiday hours to closed on Thursday") in a shared Google Doc or Chat flow through a small Cloud Function → PR → auto-deploy. Only revisit if manual CMS editing proves to be a genuine ongoing burden.
- **Platform Pivot:** Re-evaluate Firebase App Hosting / Next.js / Firestore **only** if the site outgrows a static model (e.g., authenticated customer portal, real-time inventory, loyalty database that must live server-side).

### SEO & Visibility (all phases)
- Direct, robust integration with **Google Business Profile** (primary source of review volume in 2026).
- `schema.org/HairSalon` JSON-LD (not `BarberShop` — that type doesn't exist; verified in `research/barbershop-site-review/` §4).
- NAP consistency (Name / Address / Phone) across site, GBP, and Facebook.
- Prioritize "haircut near me" and "family barbershop Bella Vista / Bentonville / Pineville" map-pack queries.

---

## 6. Future State Business Enhancements

Agents should architect the website so these features can be added without a rewrite.

1. **"Reserve with Google" Booking Integration** — embed a Square/Booksy/Vagaro booking widget that syncs directly with Google Search. Reduces phone calls and automates scheduling.
2. **Automated Loyalty Tracking** — transition from paper punch cards to a lightweight digital check-in (SMS-based integration, Text-In-Club style).
3. **"Walk-ins Welcome" Digital Board** — a simple, owner-toggled *Traffic Light* component on the homepage:
   - 🟢 **Green** — Walk in right now, no wait.
   - 🟡 **Yellow** — Moderate wait (~15–20 min).
   - 🔴 **Red** — Busy, please join the digital waitlist.

   *Implementation note:* v1 can be a single toggle in `site-data.json` (green/yellow/red) that Charles or Marie flip via the Decap CMS admin panel. No Firestore required.
4. **Digital Waitlist** (follow-on to the Traffic Light) — SMS-based queue join, text-when-ready.
5. **Stylist-Level Booking Links** — each stylist card gets a direct "Book with [Name]" deep link in addition to the existing Call/Text actions.

---

## 7. Document Provenance & Version Notes

- **Original authorship:** Project vision doc (aspirational target for digital transformation).
- **Corrections applied** (current revision):
  - Location corrected from "Bella Vista, Arkansas" (historical, 2005–2025) to "Pineville, MO" (current, post-June 2025 relocation). Bella Vista retained in history / service-area context.
  - "55-year-old local business" corrected to reflect that 55 is **Charles's age as owner**, not the business's tenure. The business is 20 years old (founded 2005); the legacy signal is the team's 80+ combined years of craft experience.
  - Markdown escape corruption cleaned (SVG, inline code, URLs, ampersands).
  - Tech-stack section reframed from "v1 mandate" to "phased aspiration" in alignment with the architecture research in `./research/` and the solutions-architect review.
  - Added cross-references to `./research/` and the current implementation so this doc plays nicely with the other sources of truth.
