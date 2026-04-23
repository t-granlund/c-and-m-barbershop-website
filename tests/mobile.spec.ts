import { test, expect } from "@playwright/test";

/**
 * Mobile-specific tests — sticky CTA, responsive nav, team tap targets.
 * These tests filter to only run in the "mobile" project.
 */

test.describe("Mobile layout", () => {
  test.skip(({ browserName }) => {
    // We want to only run on mobile project — use viewport check instead
    return false;
  }, "Mobile-only tests");

  test("sticky mobile CTA is visible on small viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.locator("#services").scrollIntoViewIfNeeded();
    const cta = page.locator(".mobile-cta");
    await expect(cta).toBeVisible();
    await expect(cta).toContainText("Pick Your Stylist");
  });

  test("mobile CTA jumps to team section", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const cta = page.locator(".mobile-cta");
    await cta.click();
    await expect(page.locator("#team")).toBeInViewport();
  });

  test("desktop nav links are hidden on mobile (except CTA)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const navLinks = page.locator(".nav__links a:not(.nav__cta)");
    const count = await navLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(navLinks.nth(i)).not.toBeVisible();
    }
    await expect(page.locator(".nav__cta")).toBeVisible();
  });

  test("nav wordmark is hidden on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".nav__wordmark")).not.toBeVisible();
  });

  test("stylist call buttons are at least 44px tall (tap target)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#team");
    await page.locator("#team").scrollIntoViewIfNeeded();
    const callBtns = page.locator(".btn-mini--call");
    const count = await callBtns.count();
    for (let i = 0; i < count; i++) {
      const box = await callBtns.nth(i).boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("Desktop layout", () => {
  test("mobile CTA is hidden on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    const cta = page.locator(".mobile-cta");
    await expect(cta).not.toBeVisible();
  });
});
