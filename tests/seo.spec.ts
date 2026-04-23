import { test, expect } from "@playwright/test";

/**
 * SEO + social sharing + structural landmarks.
 *
 * These tests guard the "silently broken" category — things that render fine
 * in a browser but fail on social previews, screen readers, or search
 * crawlers.
 */

test.describe("SEO metadata", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("title and meta description are present and well-sized", async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70); // Google truncates past ~60

    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).not.toBeNull();
    expect(desc!.length).toBeGreaterThan(50);
    expect(desc!.length).toBeLessThan(200); // Google displays ~155-160
  });

  test("canonical URL is set and absolute", async ({ page }) => {
    const href = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(href).toMatch(/^https:\/\//);
  });

  test("OG image is PNG (not SVG) and dimensions match meta", async ({ page }) => {
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toMatch(/\.png$/); // Facebook/LinkedIn reject SVG
    const type = await page.locator('meta[property="og:image:type"]').getAttribute("content");
    expect(type).toBe("image/png");
    const w = await page.locator('meta[property="og:image:width"]').getAttribute("content");
    const h = await page.locator('meta[property="og:image:height"]').getAttribute("content");
    expect(w).toBe("1200");
    expect(h).toBe("630");
  });

  test("og-image.png file exists and is a valid PNG", async ({ request }) => {
    const res = await request.get("/og-image.png");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    expect(body[0]).toBe(0x89);
    expect(body[1]).toBe(0x50);
    expect(body[2]).toBe(0x4e);
    expect(body[3]).toBe(0x47);
  });

  test("JSON-LD schema validates as HairSalon with required fields", async ({ page }) => {
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(jsonLd!);
    expect(data["@graph"]).toBeDefined();
    const business = data["@graph"].find((n: any) => n["@type"] === "HairSalon");
    expect(business).toBeDefined();
    expect(business.name).toContain("C&M");
    expect(business.telephone).toMatch(/^\+1/);
    expect(business.address.streetAddress).toContain("116 College");
    expect(business.geo.latitude).toBeTruthy();
    expect(business.geo.longitude).toBeTruthy();
    // Image dimensions in schema must match the actual PNG
    expect(business.image.width).toBe(1200);
    expect(business.image.height).toBe(630);
  });

  test("theme-color matches the brand black signboard", async ({ page }) => {
    const theme = await page.locator('meta[name="theme-color"]').getAttribute("content");
    expect(theme).toBe("#0C0C0C");
  });

  test("sitemap.xml and robots.txt are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
  });
});

test.describe("Structural landmarks (screen-reader navigation)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page has exactly one <main> landmark", async ({ page }) => {
    const mains = page.locator("main");
    await expect(mains).toHaveCount(1);
    await expect(mains).toHaveAttribute("id", "main");
  });

  test("skip link targets the main landmark", async ({ page }) => {
    const skipLink = page.locator(".skip-link").first();
    await expect(skipLink).toHaveAttribute("href", "#main");
  });

  test("page has exactly one <header> banner and one <footer>", async ({ page }) => {
    await expect(page.locator("body > header")).toHaveCount(1);
    await expect(page.locator("body > footer")).toHaveCount(1);
  });

  test("nav has an accessible name", async ({ page }) => {
    const nav = page.locator("nav").first();
    const label = await nav.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("headings form a logical hierarchy (one h1, multiple h2)", async ({ page }) => {
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    const h2s = page.locator("h2");
    const h2count = await h2s.count();
    expect(h2count).toBeGreaterThanOrEqual(4);
  });
});

test.describe("Footer contact info is actionable", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("footer has a clickable phone link", async ({ page }) => {
    const phoneLink = page.locator('footer a[href^="tel:"]');
    await expect(phoneLink.first()).toBeVisible();
    const href = await phoneLink.first().getAttribute("href");
    expect(href!.replace(/^tel:/, "")).toMatch(/^\+1\d{10}$/);
  });

  test("footer has a clickable email link", async ({ page }) => {
    const emailLink = page.locator('footer a[href^="mailto:"]');
    await expect(emailLink.first()).toBeVisible();
    const href = await emailLink.first().getAttribute("href");
    expect(href).toMatch(/^mailto:[^@]+@[^@]+\.[a-z]+$/i);
  });

  test("footer has a clickable map link for the address", async ({ page }) => {
    const mapLink = page.locator('footer a[href*="google.com/maps"]');
    await expect(mapLink.first()).toBeVisible();
  });
});

test.describe("Logo + favicon asset integrity", () => {
  test("primary logo PNG is served with correct MIME type", async ({ request }) => {
    const res = await request.get("/assets/logo-primary.png");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("png");
  });

  test("favicon assets are served", async ({ request }) => {
    const png32 = await request.get("/favicon-32x32.png");
    expect(png32.status()).toBe(200);
    const apple = await request.get("/apple-touch-icon.png");
    expect(apple.status()).toBe(200);
    const ico = await request.get("/favicon.ico");
    expect(ico.status()).toBe(200);
  });

  test("homepage references the new PNG logo assets", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".nav__logo")).toHaveAttribute("src", /assets\/logo-mark\.png/);
    await expect(page.locator(".hero__logo")).toHaveAttribute("src", /assets\/logo-primary\.png/);
    await expect(page.locator(".foot__logo")).toHaveAttribute("src", /assets\/logo-primary\.png/);
  });

  test("primary logo renders without broken transparency (visual snapshot)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.body.innerHTML =
        '<div id="snap-wrap" style="width:900px;height:720px;background:#f5f0e4;display:flex;align-items:center;justify-content:center;margin:0;">' +
        '<img id="snap-logo" src="/assets/logo-primary.png" style="width:720px;height:auto;" alt="">' +
        "</div>";
      document.documentElement.style.margin = "0";
      document.body.style.margin = "0";
    });
    await page.waitForFunction(() => {
      const img = document.getElementById("snap-logo") as HTMLImageElement | null;
      return !!img && img.complete && img.naturalWidth > 0;
    });
    await expect(page.locator("#snap-wrap")).toHaveScreenshot("logo-primary.png", {
      maxDiffPixelRatio: 0.03,
    });
  });
});
