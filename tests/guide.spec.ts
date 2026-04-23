import { test, expect } from "@playwright/test";

/**
 * Guide page — path cards, details/summary, checklist persistence, reset.
 */
test.describe("Guide page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide/");
  });

  test("banner renders with logo and heading", async ({ page }) => {
    await expect(page.locator(".banner h1")).toContainText("Step by Step");
    const logo = page.locator(".banner .logo img");
    await expect(logo).toBeVisible();
  });

  test("path cards render and link to correct anchors", async ({ page }) => {
    const proCard = page.locator(".path-card.easy");
    const diyCard = page.locator(".path-card.diy");
    await expect(proCard).toBeVisible();
    await expect(diyCard).toBeVisible();
    await expect(proCard).toHaveAttribute("href", "#path-pro");
    await expect(diyCard).toHaveAttribute("href", "#path-diy");
  });

  test("clicking a path card scrolls to its section", async ({ page }) => {
    await page.locator(".path-card.easy").click();
    await expect(page.locator("#path-pro")).toBeInViewport();
  });

  test("details sections toggle open and closed", async ({ page }) => {
    const details = page.locator("details").first();
    // Should start closed
    await expect(details).not.toHaveAttribute("open", "");
    // Click summary to open
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    // Click again to close
    await details.locator("summary").click();
    await expect(details).not.toHaveAttribute("open", "");
  });

  test("toolbar has print and reset buttons", async ({ page }) => {
    const toolbar = page.locator(".toolbar");
    await expect(toolbar).toBeVisible();
    await expect(toolbar.locator("button").first()).toContainText("Print");
    await expect(toolbar.locator("#reset-btn")).toContainText("Reset");
  });
});

test.describe("Guide checklist persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide/");
  });

  test("initial state: progress reads 0 of N complete", async ({ page }) => {
    const progress = page.locator("#progress");
    await expect(progress).toContainText("0 of");
    await expect(progress).toContainText("complete");
  });

  test("clicking a todo row checks it and increments progress", async ({
    page,
  }) => {
    const firstTodo = page.locator(".todos li[data-id]").first();
    await firstTodo.click();
    await expect(firstTodo).toHaveClass(/done/);
    const progress = page.locator("#progress");
    await expect(progress).toContainText("1 of");
  });

  test("checking a checkbox directly also marks row done", async ({
    page,
  }) => {
    const firstCb = page.locator(".todos li[data-id] input[type=checkbox]").first();
    await firstCb.check();
    const firstLi = page.locator(".todos li[data-id]").first();
    await expect(firstLi).toHaveClass(/done/);
  });

  test("checkbox state persists across reload", async ({ page }) => {
    const firstTodo = page.locator(".todos li[data-id]").first();
    await firstTodo.click();
    await expect(firstTodo).toHaveClass(/done/);

    // Reload
    await page.reload();
    const firstTodoAfterReload = page.locator(".todos li[data-id]").first();
    await expect(firstTodoAfterReload).toHaveClass(/done/);
    const progress = page.locator("#progress");
    await expect(progress).toContainText("1 of");
  });

  test("reset button clears all checkboxes when confirmed", async ({
    page,
  }) => {
    // Check one item first
    const firstTodo = page.locator(".todos li[data-id]").first();
    await firstTodo.click();
    await expect(firstTodo).toHaveClass(/done/);

    // Accept the confirm dialog
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });

    await page.locator("#reset-btn").click();

    // All todos should be unchecked now
    const anyDone = page.locator(".todos li.done");
    await expect(anyDone).toHaveCount(0);
    const progress = page.locator("#progress");
    await expect(progress).toContainText("0 of");
  });

  test("reset button does nothing when confirm is cancelled", async ({
    page,
  }) => {
    const firstTodo = page.locator(".todos li[data-id]").first();
    await firstTodo.click();
    await expect(firstTodo).toHaveClass(/done/);

    // Dismiss the confirm dialog
    page.once("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await page.locator("#reset-btn").click();

    // Item should still be checked
    const firstTodoAfter = page.locator(".todos li[data-id]").first();
    await expect(firstTodoAfter).toHaveClass(/done/);
  });

  test("100% completion shows celebration emoji", async ({ page }) => {
    // Check all items
    const allCbs = page.locator(
      ".todos li[data-id] input[type=checkbox]"
    );
    const count = await allCbs.count();
    for (let i = 0; i < count; i++) {
      await allCbs.nth(i).check();
    }
    const progress = page.locator("#progress");
    await expect(progress).toContainText("🎉");
  });
});
