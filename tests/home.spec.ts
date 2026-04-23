import { test, expect } from "@playwright/test";

/**
 * Homepage smoke — proves the page loads, core content renders,
 * nav anchors work, CTAs fire, footer year populates.
 */
test.describe("Homepage smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero logo and heading visible", async ({ page }) => {
    const logo = page.locator(".hero__logo");
    await expect(logo).toBeVisible();
    // Hero title should contain the brand promise
    await expect(
      page.locator(".hero__title")
    ).toContainText("Walk-ins");
  });

  test("all nav anchor links resolve to sections", async ({ page }) => {
    const navAnchors = page.locator(".nav__links a:not(.nav__cta)");
    const count = await navAnchors.count();
    for (let i = 0; i < count; i++) {
      const href = await navAnchors.nth(i).getAttribute("href");
      expect(href).toMatch(/^#\w/);
      const target = page.locator(href!);
      await expect(target).toBeAttached();
    }
  });

  test("primary CTA jumps to team section", async ({ page }) => {
    const cta = page.getByRole("link", { name: /pick your stylist/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page.locator("#team")).toBeInViewport();
  });

  test("directions CTAs have valid Google Maps URLs", async ({ page }) => {
    // Two direction links: hero ghost button + visit section primary button
    const dirLinks = page.locator('a[href*="google.com/maps/dir"]');
    const count = await dirLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < count; i++) {
      const href = await dirLinks.nth(i).getAttribute("href");
      expect(href).toContain("google.com/maps/dir");
      expect(href).toContain("116+College+Road");
    }
  });

  test("footer year is populated by script.js", async ({ page }) => {
    const yearSpan = page.locator("#year");
    await expect(yearSpan).toHaveText(new RegExp(/^\d{4}$/));
  });

  test("skip link appears on Tab and jumps to #main", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toBeFocused();
    const href = await skipLink.getAttribute("href");
    expect(href).toBe("#main");
    await page.keyboard.press("Enter");
    // Skip link now targets <main id="main"> which wraps the hero.
    // Verify the main landmark is both present and focused/reachable.
    await expect(page.locator("#main")).toBeVisible();
    await expect(page).toHaveURL(/#main$/);
  });

  test("Google Maps iframe exists with accessible title", async ({ page }) => {
    const iframe = page.locator("iframe.visit__map");
    await expect(iframe).toBeAttached();
    const title = await iframe.getAttribute("title");
    expect(title).toBeTruthy();
    expect(title!.toLowerCase()).toContain("map");
  });

  test("logo SVG loads in hero, nav, and footer", async ({ page }) => {
    const logos = page.locator('img[src="cm-logo.svg"]');
    const count = await logos.count();
    expect(count).toBeGreaterThanOrEqual(3); // nav, hero, footer
  });
});
