import { test, expect } from "@playwright/test";

/**
 * Live open/closed status — the only real JS logic on the site.
 * Mocks the clock to validate every branch of computeStatus().
 *
 * Hours (America/Chicago):
 *   Mon-Fri  08:00-17:00
 *   Sat      08:00-12:00
 *   Sun      closed
 */
test.describe("Live open/closed status", () => {
  /**
   * Inject a Date override so script.js's Intl.DateTimeFormat
   * returns a controlled weekday + hour. We mock at the
   * Intl.DateTimeFormat level because that's what the production
   * code uses — honest, no cheating.
   */
  async function mockTime(
    page: any,
    weekday: string, // "Mon"|"Tue"|...|"Sat"|"Sun"
    hour: number,
    minute = 0
  ) {
    await page.addInitScript(
      ({ weekday, hour, minute }) => {
        // Patch Intl.DateTimeFormat so nowInChicago() returns controlled values
        const OrigDateTimeFormat = Intl.DateTimeFormat;
        const origFormatToParts = OrigDateTimeFormat.prototype.formatToParts;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Intl as any).DateTimeFormat = function (
          locale?: string | string[],
          options?: Intl.DateTimeFormatOptions
        ) {
          if (
            options &&
            "timeZone" in options &&
            (options as any).timeZone === "America/Chicago"
          ) {
            return {
              formatToParts: () => [
                { type: "weekday", value: weekday },
                {
                  type: "hour",
                  value: String(hour).padStart(2, "0"),
                },
                {
                  type: "minute",
                  value: String(minute).padStart(2, "0"),
                },
              ],
            };
          }
          const formatter = new OrigDateTimeFormat(locale, options);
          return { formatToParts: () => origFormatToParts.call(formatter, new Date()) };
        };
        (Intl as any).DateTimeFormat.supportedLocalesOf =
          OrigDateTimeFormat.supportedLocalesOf;
      },
      { weekday, hour, minute }
    );
  }

  test("weekday 10 AM → open, closes 5 PM", async ({ page }) => {
    await mockTime(page, "Wed", 10);
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).toHaveClass(/is-open/);
      const text = statuses.nth(i).locator("[data-status-text]");
      await expect(text).toContainText("Open now");
      await expect(text).toContainText("5");
    }
  });

  test("weekday 7:59 AM → closed, opens today at 8 AM", async ({ page }) => {
    await mockTime(page, "Wed", 7, 59);
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).toHaveClass(/is-closed/);
      const text = statuses.nth(i).locator("[data-status-text]");
      await expect(text).toContainText("Closed");
      await expect(text).toContainText("today");
      await expect(text).toContainText("8");
    }
  });

  test("weekday 5:00 PM → closed, opens tomorrow", async ({ page }) => {
    await mockTime(page, "Wed", 17);
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).toHaveClass(/is-closed/);
      const text = statuses.nth(i).locator("[data-status-text]");
      await expect(text).toContainText("Closed");
      await expect(text).toContainText("tomorrow");
    }
  });

  test("Saturday 11:59 AM → open", async ({ page }) => {
    await mockTime(page, "Sat", 11, 59);
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).toHaveClass(/is-open/);
    }
  });

  test("Saturday 12:00 PM → closed, opens Monday", async ({ page }) => {
    await mockTime(page, "Sat", 12);
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).toHaveClass(/is-closed/);
      const text = statuses.nth(i).locator("[data-status-text]");
      await expect(text).toContainText("Closed");
      await expect(text).toContainText("Monday");
    }
  });

  test("Sunday → closed, opens tomorrow (Monday)", async ({ page }) => {
    await mockTime(page, "Sun", 10);
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).toHaveClass(/is-closed/);
      const text = statuses.nth(i).locator("[data-status-text]");
      await expect(text).toContainText("Closed");
      // Sunday → Monday is 1 day away, so script.js says "tomorrow", not "Monday"
      await expect(text).toContainText("tomorrow");
    }
  });

  test("Friday 4:59 PM → open (boundary)", async ({ page }) => {
    await mockTime(page, "Fri", 16, 59);
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      await expect(statuses.nth(i)).toHaveClass(/is-open/);
    }
  });

  test("status text is not placeholder after load", async ({ page }) => {
    await page.goto("/");
    const statuses = page.locator("[data-live-status]");
    const count = await statuses.count();
    for (let i = 0; i < count; i++) {
      const text = statuses.nth(i).locator("[data-status-text]");
      await expect(text).not.toHaveText("Checking hours…");
      await expect(text).not.toBeEmpty();
    }
  });
});
