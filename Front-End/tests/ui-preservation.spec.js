import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
test("original CSS, welcome pixels, and auth geometry are preserved", async ({ browser }) => {
  const root = process.cwd();
  const baseline = path.join(root, ".artifacts/baseline/Front-End");
  expect(fs.readFileSync(path.join(root, "src/styles/index.css")).equals(fs.readFileSync(path.join(baseline, "src/styles/index.css")))).toBe(true);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const original = await context.newPage(); const current = await context.newPage();
  await original.goto("http://127.0.0.1:5181"); await current.goto("http://127.0.0.1:5179");
  for (const page of [original, current]) {
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode().catch(() => {}))); });
  }
  const before = await original.screenshot({ animations: "disabled", fullPage: true, path: ".artifacts/welcome-baseline.png" });
  const after = await current.screenshot({ animations: "disabled", fullPage: true, path: ".artifacts/welcome-current.png" });
  expect(after.equals(before)).toBe(true);
  for (const page of [original, current]) await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const measure = (page, selector) => page.locator(selector).first().evaluate((node) => {
    const css = getComputedStyle(node), rect = node.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, font: css.fontFamily, fontSize: css.fontSize, color: css.color, background: css.backgroundColor, padding: css.padding, borderRadius: css.borderRadius };
  });
  for (const selector of [".auth-topbar", ".auth-card", ".auth-symbol", ".auth-tabs", ".auth-field input", ".auth-field select"]) {
    expect(await measure(current, selector)).toEqual(await measure(original, selector));
  }
  await context.close();
});
test("mobile welcome remains responsive", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: ".artifacts/mobile-welcome.png", fullPage: true });
});

test("all five dashboard shells retain baseline geometry and styles", async ({ browser, request }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const role of ["administrator", "logistics", "driver", "customer", "merchant"]) {
    const response = await request.post("/api/auth/login", { data: { email: `${role}@browser.test`, password: "BrowserPassword123!", roleId: role } });
    const session = await response.json();
    const baseline = await context.newPage(); const current = await context.newPage();
    for (const page of [baseline, current]) {
      await page.route("**/api/auth/login", (route) => route.fulfill({ json: session }));
    }
    await baseline.goto("http://127.0.0.1:5181"); await current.goto("http://127.0.0.1:5179");
    for (const page of [baseline, current]) {
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await page.locator("select[name=roleId]").selectOption(role);
      await page.locator("input[name=email]").fill(`${role}@browser.test`);
      await page.locator("input[name=password]").fill("BrowserPassword123!");
      await page.locator("button[type=submit]").click();
      await expect(page.locator(".ops-sidebar")).toBeVisible();
    }
    for (const selector of [".ops-sidebar", ".ops-topbar", ".ops-main", ".ops-page-heading"]) {
      const measure = (page) => page.locator(selector).evaluate((node) => {
        const style = getComputedStyle(node), rect = node.getBoundingClientRect();
        return { x: rect.x, width: rect.width, font: style.fontFamily, color: style.color, padding: style.padding, background: style.backgroundColor };
      });
      expect(await measure(current)).toEqual(await measure(baseline));
    }
    await baseline.close(); await current.close();
    await context.clearCookies();
    // localStorage is origin-scoped; clear to return to the login screens next iteration.
    const reset = await context.newPage(); await reset.goto("http://127.0.0.1:5179"); await reset.evaluate(() => localStorage.clear()); await reset.close();
  }
  await context.close();
});
