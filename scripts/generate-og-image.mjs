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
const svg = readFileSync(resolve(root, "cm-logo.svg"), "utf8");

// Inline HTML so we don't need a running webserver.
// Background matches the hero's off-white so the social card feels on-brand.
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #FFFFFF 0%, #F7F7F5 100%);
    font-family: system-ui, -apple-system, sans-serif;
  }
  .card {
    display: flex; flex-direction: column; align-items: center;
    gap: 24px;
  }
  .logo { width: 640px; height: 512px; }
  .tag {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
    color: #1B365D; font-size: 22px;
  }
</style></head>
<body>
  <div class="card">
    <div class="logo">${svg}</div>
    <div class="tag">Pineville, MO &nbsp;·&nbsp; Serving NWA Since 2005</div>
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
