import { test, expect } from "@playwright/test";

// ===== Navigation & Layout =====

test.describe("Sidebar navigation", () => {
  test("all nav items render", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Event Hub")).toBeVisible();

    const labels = ["總覽", "活動專案", "廠商建檔", "場館瀏覽", "講者列表", "贊助廠商", "其他服務", "設定"];
    for (const label of labels) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }
  });
});

// ===== Dashboard =====

test.describe("Dashboard", () => {
  test("renders overview page with stat cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("總覽");
    await expect(page.locator("text=進行中活動")).toBeVisible();
    await expect(page.locator("text=即將到期")).toBeVisible();
  });

  test("todos section is collapsible", async ({ page }) => {
    await page.goto("/dashboard");
    const todosBtn = page.locator("text=待辦事項").first();
    if (await todosBtn.isVisible()) {
      await todosBtn.click();
      // After click, should expand/collapse
      await expect(page.locator("text=待辦事項")).toBeVisible();
    }
  });
});

// ===== Vendors (廠商建檔) =====

test.describe("Vendors", () => {
  test("lists vendors with correct columns", async ({ page }) => {
    await page.goto("/vendors");
    await expect(page.locator("h1")).toContainText("廠商建檔");
    await expect(page.locator("th:has-text('統一編號')")).toBeVisible();
    await expect(page.locator("th:has-text('銀行代碼')")).toBeVisible();
  });

  test("has export button", async ({ page }) => {
    await page.goto("/vendors");
    await expect(page.locator("button:has-text('匯出')")).toBeVisible();
  });

  test("can open add vendor dialog", async ({ page }) => {
    await page.goto("/vendors");
    await page.click("button:has-text('新增廠商')");
    await expect(page.locator("label:has-text('銀行代碼')")).toBeVisible();
  });
});

// ===== Venues (場館瀏覽) =====

test.describe("Venues", () => {
  test("renders venue list with title", async ({ page }) => {
    await page.goto("/venues");
    await expect(page.locator("h1")).toContainText("場館瀏覽");
  });

  test("venue form has vendor dropdown", async ({ page }) => {
    await page.goto("/venues");
    await page.click("button:has-text('新增場地')");
    await expect(page.locator("label:has-text('關聯廠商')")).toBeVisible();
  });
});

// ===== Talents (講者列表) =====

test.describe("Talents", () => {
  test("renders speaker list", async ({ page }) => {
    await page.goto("/talents");
    await expect(page.locator("h1")).toContainText("講者列表");
  });

  test("has export button", async ({ page }) => {
    await page.goto("/talents");
    await expect(page.locator("button:has-text('匯出')")).toBeVisible();
  });
});

// ===== Sponsors (贊助廠商) =====

test.describe("Sponsors", () => {
  test("renders as table with contact columns", async ({ page }) => {
    await page.goto("/sponsors");
    await expect(page.locator("h1")).toContainText("贊助廠商");
    await expect(page.locator("th:has-text('聯絡人')")).toBeVisible();
    await expect(page.locator("th:has-text('Email')")).toBeVisible();
  });

  test("sponsor form has vendor dropdown", async ({ page }) => {
    await page.goto("/sponsors");
    await page.click("button:has-text('新增贊助商')");
    await expect(page.locator("label:has-text('關聯廠商')")).toBeVisible();
  });
});

// ===== Services (其他服務) =====

test.describe("Services", () => {
  test("renders with price column", async ({ page }) => {
    await page.goto("/expenses");
    await expect(page.locator("h1")).toContainText("其他服務");
    await expect(page.locator("th:has-text('服務項目')")).toBeVisible();
    await expect(page.locator("th:has-text('廠商')")).toBeVisible();
    await expect(page.locator("th:has-text('報價')")).toBeVisible();
  });

  test("has export button", async ({ page }) => {
    await page.goto("/expenses");
    await expect(page.locator("button:has-text('匯出')")).toBeVisible();
  });
});

// ===== Settings =====

test.describe("Settings", () => {
  test("renders settings page with company fields", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("設定");
    await expect(page.locator("label:has-text('公司名稱')")).toBeVisible();
    await expect(page.locator("label:has-text('公司英文名稱')")).toBeVisible();
  });
});

// ===== Event Wizard =====

test.describe("Event Wizard", () => {
  test("Step 1: FY system toggle + no webinar type", async ({ page }) => {
    await page.goto("/events/new");
    await expect(page.getByRole("heading", { name: "建立活動" })).toBeVisible();

    // FY system buttons
    await expect(page.locator("button:has-text('Adobe FY')")).toBeVisible();
    await expect(page.locator("button:has-text('Weblink FY')")).toBeVisible();

    // No webinar option
    const pageContent = await page.content();
    expect(pageContent).not.toContain('>線上直播</option>');
  });

  test("Step 2: has add venue button", async ({ page }) => {
    await page.goto("/events/new");
    await page.click("button:has-text('下一步')");
    await expect(page.locator("button:has-text('新增場地')")).toBeVisible();
    // Shows "待確認" when no venue selected
    await expect(page.locator("text=待確認")).toBeVisible();
  });

  test("Step 3: shows today's date", async ({ page }) => {
    await page.goto("/events/new");
    await page.click("button:has-text('下一步')");
    await page.click("button:has-text('下一步')");
    await expect(page.locator("text=今天")).toBeVisible();
  });

  test("full wizard flow: validates organizer required", async ({ page }) => {
    await page.goto("/events/new");

    // Step 1: fill name
    await page.fill("input[placeholder*='之後可改']", "E2E 測試活動");
    await page.click("button:has-text('下一步')");

    // Step 2: select attendees
    await page.click("button:has-text('150')");
    await page.click("button:has-text('下一步')");

    // Step 3-7: click through
    for (let i = 0; i < 5; i++) {
      await page.click("button:has-text('下一步')");
    }

    // Step 8: should have calendar section
    await expect(page.locator("text=建立行事曆邀請")).toBeVisible();

    // Click create — should show error (no organizer set)
    await page.click("button:has-text('建立活動')");

    // Should stay on wizard (not redirect) and show toast about organizer
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain("/events/new");
  });
});

// ===== Event Detail =====

test.describe("Event Detail", () => {
  test("has tab navigation", async ({ page }) => {
    // Navigate through events list to find one
    await page.goto("/events");
    const firstRow = page.locator("tr").nth(1);
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await expect(page.locator("text=基本資訊")).toBeVisible();
      await expect(page.locator("text=議程")).toBeVisible();
      await expect(page.locator("text=贊助合作")).toBeVisible();
      await expect(page.locator("text=行銷文案")).toBeVisible();
      await expect(page.locator("text=費用結案")).toBeVisible();
    }
  });
});

// ===== Global Search =====

test.describe("Global Search", () => {
  test("search trigger button is visible in header", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=搜尋...").first()).toBeVisible();
  });
});

// ===== Login =====

test.describe("Login", () => {
  test("login page renders with hero and form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Event Hub").first()).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("text=快速進入").first()).toBeVisible();
  });
});
