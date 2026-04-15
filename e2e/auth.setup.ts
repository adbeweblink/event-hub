import { test as setup, expect } from "@playwright/test";

const AUTH_FILE = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  // Wait for page to load
  await page.waitForSelector("input[type='email']", { timeout: 10000 });

  await page.fill("input[type='email']", "mark.tsao@weblink.com.tw");
  await page.fill("input[type='password']", "Adobe123$");
  await page.click("button[type='submit']");

  // Wait longer — Supabase auth can be slow
  try {
    await page.waitForURL("**/dashboard", { timeout: 20000 });
  } catch {
    // If login form shows error, capture it
    const errorText = await page.locator(".text-destructive, [class*='destructive'], [class*='error']").first().textContent().catch(() => "");
    const currentUrl = page.url();
    await page.screenshot({ path: "e2e/auth-debug.png" });
    throw new Error(`Login failed. URL: ${currentUrl}, Error: ${errorText}`);
  }

  await expect(page.locator("h1")).toContainText("總覽");
  await page.context().storageState({ path: AUTH_FILE });
});
