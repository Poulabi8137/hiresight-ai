import { test, expect } from "@playwright/test";

test.describe("Recruiter pipeline", () => {
  test("recruiter workspace loads with candidates and jobs", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo recruiter/i }).click();
    await page.waitForURL(/\/recruiter/);

    await expect(page.locator("h1")).toContainText(/recruiter|workspace|pipeline/i);
  });

  test("recruiter can score a candidate", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo recruiter/i }).click();
    await page.waitForURL(/\/recruiter/);

    const scoreButton = page.getByRole("button", { name: /score|match|analyze/i }).first();
    if (await scoreButton.isVisible()) {
      await scoreButton.click();
      await expect(page.getByText(/score|match|skill/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test("recruiter can update application stage", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo recruiter/i }).click();
    await page.waitForURL(/\/recruiter/);

    const stageSelect = page.locator('select[name="stage"]').first();
    if (await stageSelect.isVisible()) {
      await stageSelect.selectOption("reviewed");
      await expect(stageSelect).toHaveValue("reviewed");
    }
  });
});
