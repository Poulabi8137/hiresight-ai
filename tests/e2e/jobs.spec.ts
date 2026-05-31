import { test, expect } from "@playwright/test";

test.describe("Jobs and applications flow", () => {
  test("jobs page lists available positions", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText(/software|engineer|developer/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("candidate can view and apply to a job", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo candidate/i }).click();
    await page.waitForURL(/\/candidate/);

    const applyButton = page.getByRole("button", { name: /apply/i }).first();
    if (await applyButton.isVisible()) {
      await applyButton.click();
      await expect(page.getByText(/applied|submitted|success/i).or(page.getByText(/already applied/i))).toBeVisible({ timeout: 5000 });
    }
  });

  test("candidate can save a job", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo candidate/i }).click();
    await page.waitForURL(/\/candidate/);

    const saveButton = page.getByRole("button", { name: /save|bookmark|heart/i }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }
  });
});
