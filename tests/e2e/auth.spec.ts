import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test("auth page loads with login and demo options", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("button", { name: /demo/i })).toBeVisible();
  });

  test("demo candidate login works", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo candidate/i }).click();
    await page.waitForURL(/\/candidate/);
    await expect(page.locator("h1")).toContainText(/profile/i);
  });

  test("demo recruiter login works", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /demo recruiter/i }).click();
    await page.waitForURL(/\/recruiter/);
    await expect(page.locator("h1")).toContainText(/recruiter/i);
  });
});
