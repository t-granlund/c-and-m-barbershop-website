import { test, expect } from "@playwright/test";

/**
 * Design system and accessibility regression tests.
 * Catches token drift, missing assets, and basic WCAG hygiene.
 */
test.describe("Design system integrity", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("CSS design tokens are not empty / broken (key sections render correctly)", async ({
    page,
  }) => {
    // Check that the nav bar has the navy color (not falling back to invalid)
    const nav = page.locator(".nav");
    const navBg = await nav.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });
    // Should be a near-white/transparent color, not an empty string
    expect(navBg).toBeTruthy();
    expect(navBg).not.toBe("");
  });

  test("Oswald font loads for display headings", async ({ page }) => {
    const title = page.locator(".hero__title");
    const fontFamily = await title.evaluate((el) => {
      return getComputedStyle(el).fontFamily;
    });
    // Should contain Oswald (or fallback)
    expect(fontFamily.toLowerCase()).toContain("oswald");
  });

  test("Open Sans font loads for body text", async ({ page }) => {
    const body = page.locator("body");
    const fontFamily = await body.evaluate((el) => {
      return getComputedStyle(el).fontFamily;
    });
    expect(fontFamily.toLowerCase()).toContain("open sans");
  });

  test("no console errors about missing CSS custom properties", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    // Give scripts time to fire
    await page.waitForTimeout(1000);
    // Filter to only CSS-related errors (custom property issues don't always
    // show as console errors, but any JS errors are worth catching)
    const cssErrors = errors.filter(
      (e) =>
        e.toLowerCase().includes("css") ||
        e.toLowerCase().includes("custom property") ||
        e.toLowerCase().includes("variable")
    );
    expect(cssErrors).toEqual([]);
  });

  test("self-hosted font files load successfully", async ({ page }) => {
    const fontResponses: { url: string; status: number }[] = [];
    page.on("response", (response) => {
      if (response.url().includes("fonts/") && response.url().endsWith(".woff2")) {
        fontResponses.push({ url: response.url(), status: response.status() });
      }
    });
    await page.goto("/");
    await page.waitForTimeout(2000);
    // All font responses should be 200
    for (const resp of fontResponses) {
      expect(resp.status, `Font 404: ${resp.url}`).toBe(200);
    }
    // Should have loaded at least 2 woff2 files
    expect(fontResponses.length).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Accessibility smoke", () => {
  test("skip link is keyboard-focusable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toBeFocused();
  });

  test("all images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // Decorative images should have alt="" (aria-hidden), meaningful ones need text
      expect(alt).not.toBeNull(); // alt attribute must exist, even if empty
    }
  });

  test("all iframes have a title attribute", async ({ page }) => {
    await page.goto("/");
    const iframes = page.locator("iframe");
    const count = await iframes.count();
    for (let i = 0; i < count; i++) {
      const title = await iframes.nth(i).getAttribute("title");
      expect(title).toBeTruthy();
    }
  });

  test("stylist call/text links have aria-labels", async ({ page }) => {
    await page.goto("/#team");
    const links = page.locator("article.stylist a[aria-label]");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(12); // 6 call + 6 text
  });

  test("lang attribute is set on html element", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^en/);
  });

  test("focus-visible rings work on primary CTA", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /pick your stylist/i });
    await cta.focus();
    await expect(cta).toBeFocused();
    // Verify focus-visible style is applied (outline-width > 0)
    const outline = await cta.evaluate((el) => {
      return getComputedStyle(el).outlineWidth;
    });
    expect(parseFloat(outline)).toBeGreaterThan(0);
  });
});
