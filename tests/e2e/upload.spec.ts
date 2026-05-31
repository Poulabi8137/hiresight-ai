import { test, expect } from "@playwright/test";

test.describe("Upload flow", () => {
  test("upload page loads and shows drop zone", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo candidate/i }).click();
    await page.waitForURL(/\/candidate/);

    await page.goto("/upload");
    await expect(page.getByText(/upload|resume|drop/i)).toBeVisible({ timeout: 10000 });
  });

  test("resume upload area is present", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.locator('input[type="file"]').first()).toBeVisible({ timeout: 10000 });
  });
});
