import { test, expect } from "@playwright/test";

/**
 * Team section — validates every stylist card has valid call/text links.
 * This is the #1 conversion path; we protect it fiercely.
 */
test.describe("Team contact flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#team");
  });

  test("six stylist cards render", async ({ page }) => {
    const cards = page.locator("article.stylist");
    await expect(cards).toHaveCount(6);
  });

  test("each card has a name, role, and phone number", async ({ page }) => {
    const cards = page.locator("article.stylist");
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator(".stylist__name")).not.toBeEmpty();
      await expect(card.locator(".stylist__role")).not.toBeEmpty();
      await expect(card.locator(".stylist__number")).not.toBeEmpty();
    }
  });

  test("each card has a valid tel: and sms: link", async ({ page }) => {
    const cards = page.locator("article.stylist");
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const callLink = card.locator('a[href^="tel:"]');
      const textLink = card.locator('a[href^="sms:"]');
      await expect(callLink).toHaveCount(1);
      await expect(textLink).toHaveCount(1);

      // E.164 format: +1 followed by 10 digits (strip tel:/sms: prefix)
      const callHref = await callLink.getAttribute("href");
      const textHref = await textLink.getAttribute("href");
      const e164 = /^\+1\d{10}$/;
      expect(callHref!.replace(/^tel:/, "")).toMatch(e164);
      expect(textHref!.replace(/^sms:/, "")).toMatch(e164);
    }
  });

  test("call and text buttons have unique aria-labels per stylist", async ({
    page,
  }) => {
    const cards = page.locator("article.stylist");
    const count = await cards.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const callLabel = await card
        .locator('a[href^="tel:"]')
        .getAttribute("aria-label");
      const textLabel = await card
        .locator('a[href^="sms:"]')
        .getAttribute("aria-label");
      expect(callLabel).toBeTruthy();
      expect(textLabel).toBeTruthy();
      labels.push(callLabel!, textLabel!);
    }
    // All 12 labels should be unique
    expect(new Set(labels).size).toBe(labels.length);
  });
});
