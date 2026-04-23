/**
 * Generate og-image.png (1200x630) from cm-logo.svg.
 *
 * Why: Facebook, LinkedIn, and iMessage reject or mis-render SVG og images.
 * Twitter/X accepts SVG but only grudgingly. A rasterized PNG is the
 * single-format solution.
 *
 * Run: node scripts/generate-og-image.mjs
 *
 * This is a BUILD step (not a runtime dep): regenerate whenever cm-logo.svg
 * changes. Committed alongside the SVG source of truth.
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const logoBase64 = readFileSync(resolve(root, "assets/logo-primary.png")).toString("base64");
const logoUrl = `data:image/png;base64,${logoBase64}`;

// Inline HTML so we don't need a running webserver.
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    display: flex; align-items: center; justify-content: center;
    background:
      radial-gradient(circle at 50% 20%, rgba(181, 42, 44, 0.12) 0%, transparent 35%),
      repeating-linear-gradient(180deg, #F5F0E4 0 10px, #EAE1CF 10px 12px, #F5F0E4 12px 22px);
    font-family: system-ui, -apple-system, sans-serif;
  }
  .frame {
    width: 1080px; height: 540px;
    display: grid; grid-template-columns: 1.05fr 0.95fr; align-items: center;
    gap: 12px; padding: 24px 36px;
    border: 6px solid #2B57A5; box-shadow: 12px 12px 0 #0C0C0C;
    background: rgba(255,255,255,0.35);
  }
  .logo { width: 100%; max-width: 540px; justify-self: center; filter: drop-shadow(0 18px 24px rgba(0,0,0,0.18)); }
  .copy { display: grid; gap: 14px; color: #141414; }
  .eyebrow {
    font-family: Impact, Oswald, sans-serif; font-size: 20px; letter-spacing: 0.22em;
    text-transform: uppercase; color: #B52A2C; font-weight: 700;
  }
  h1 {
    margin: 0; font-family: Impact, Oswald, sans-serif; font-size: 72px; line-height: 0.92;
    text-transform: uppercase; letter-spacing: 0.02em; color: #141414;
  }
  .accent { color: #B52A2C; font-style: italic; text-transform: none; }
  .sub {
    font-size: 27px; line-height: 1.3; color: #403A34; font-weight: 600;
  }
  .pill {
    justify-self: start; background: linear-gradient(180deg, #C83A3D 0%, #B52A2C 100%);
    color: white; border: 3px solid #2B57A5; box-shadow: 6px 6px 0 #0C0C0C;
    padding: 16px 24px; font-family: Impact, Oswald, sans-serif; font-size: 22px;
    letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;
  }
</style></head>
<body>
  <div class="frame">
    <img class="logo" src="${logoUrl}" alt="C&M Barber Shop logo">
    <div class="copy">
      <div class="eyebrow">Pineville, Missouri</div>
      <h1>Walk-Ins<br><span class="accent">Always Welcome.</span></h1>
      <div class="sub">Classic service for the modern family. Men, women, and kids welcome.</div>
      <div class="pill">Serving NWA Since 2005</div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } });
const page = await ctx.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({
  path: resolve(root, "og-image.png"),
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
console.log("✓ og-image.png generated (1200x630)");
