import { test, expect } from "@playwright/test";
async function settle(page) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter((image) => image.loading !== "lazy").map((image) => image.decode().catch(() => {}))); });
}
const formContract = (page) => page.locator("#auth-form input, #auth-form select, #auth-form button").evaluateAll((nodes) => nodes.map((node) => ({ tag: node.tagName, name: node.name, type: node.type, required: node.required })));
test("enhanced palette preserves original welcome controls and authentication form structure", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const original = await context.newPage(), current = await context.newPage();
  await original.goto("http://127.0.0.1:5181"); await current.goto("http://127.0.0.1:5179");
  const controls = (page) => page.locator(".welcome-topbar button, .welcome-cta-row button, .welcome-contact button").allTextContents();
  expect(await controls(current)).toEqual(await controls(original));
  expect(await current.locator("main > section").count()).toBe(await original.locator("main > section").count());
  const palette = await current.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(["navy", "ocean", "teal", "background", "white"].map((name) => [name, styles.getPropertyValue(`--${name}`).trim().toUpperCase()]));
  });
  expect(palette).toEqual({ navy: "#102A43", ocean: "#176B91", teal: "#13B8A6", background: "#F3F7FA", white: "#FFFFFF" });
  for (const page of [original, current]) await page.getByRole("button", { name: "Sign in", exact: true }).click();
  expect(await formContract(current)).toEqual(await formContract(original));
  for (const page of [original, current]) await page.getByRole("tab", { name: "Sign up", exact: true }).click();
  expect(await formContract(current)).toEqual(await formContract(original));
  expect(await current.locator("select[name=roleId] option").evaluateAll((nodes) => nodes.map((node) => node.value))).toEqual(["", "administrator", "logistics", "driver", "customer", "merchant"]);
  await context.close();
});
test("enhanced landing and login visual baselines", async ({ page }) => {
  test.skip(process.platform !== "win32", "Pixel references were reviewed on Windows; portable structure, palette and responsiveness checks run on every platform.");
  await page.goto("/"); await settle(page);
  await expect(page).toHaveScreenshot("welcome-desktop.png", { fullPage: true, animations: "disabled", maxDiffPixels: 120 });
  await page.getByRole("button", { name: "Sign in", exact: true }).click(); await settle(page);
  await expect(page).toHaveScreenshot("login-desktop.png", { fullPage: true, animations: "disabled", maxDiffPixels: 120 });
});
test("local photographs load with accurate dimensions and descriptive alt text", async ({ page }) => {
  const failed = [];
  page.on("response", (response) => { if (response.url().includes("/images/logistics-") && !response.ok()) failed.push(response.url()); });
  await page.goto("/"); await settle(page);
  const images = await page.locator("img").evaluateAll((nodes) => nodes.filter((node) => node.getAttribute("src")?.includes("logistics-")).map((node) => ({ alt: node.alt, width: node.naturalWidth, height: node.naturalHeight, local: new URL(node.currentSrc).origin === location.origin })));
  expect(images.length).toBeGreaterThanOrEqual(2);
  expect(images.every((image) => image.alt.length > 15 && image.width > 0 && image.height > 0 && image.local)).toBe(true);
  expect(failed).toEqual([]);
});
for (const width of [390, 768]) {
  test(`landing and signup stay responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 }); await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `.artifacts/welcome-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Sign up", exact: true }).click();
    await expect(page.locator(".auth-submit")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
test("all five dashboards retain original navigation and shell geometry", async ({ browser, request }) => {
  for (const role of ["administrator", "logistics", "driver", "customer", "merchant"]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const response = await request.post("/api/auth/login", { data: { email: `${role}@browser.test`, password: "BrowserPassword123!", roleId: role } });
    const session = await response.json();
    const original = await context.newPage(), current = await context.newPage();
    for (const page of [original, current]) await page.route("**/api/auth/login", (route) => route.fulfill({ json: session }));
    await original.goto("http://127.0.0.1:5181"); await current.goto("http://127.0.0.1:5179");
    for (const page of [original, current]) {
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await page.locator("select[name=roleId]").selectOption(role);
      await page.locator("input[name=email]").fill(`${role}@browser.test`);
      await page.locator("input[name=password]").fill("BrowserPassword123!");
      await page.locator("button[type=submit]").click(); await expect(page.locator(".ops-sidebar")).toBeVisible();
    }
    const names = (page) => page.locator(".ops-nav-link").evaluateAll((nodes) => nodes.map((node) => node.querySelectorAll("span")[1]?.textContent));
    const originalNames = await names(original); const currentNames = await names(current);
    for (const name of originalNames) expect(currentNames).toContain(name);
    for (const selector of [".ops-sidebar", ".ops-topbar", ".ops-main"]) {
      const measure = (page) => page.locator(selector).evaluate((node) => { const rect = node.getBoundingClientRect(); return { x: rect.x, width: rect.width }; });
      expect(await measure(current)).toEqual(await measure(original));
    }
    await current.screenshot({ path: `.artifacts/enhanced-${role}.png`, fullPage: true });
    await current.setViewportSize({ width: 390, height: 844 });
    expect(await current.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await current.getByRole("button", { name: "Open navigation", exact: true }).click();
    await expect(current.locator(".ops-sidebar")).toBeVisible();
    await current.screenshot({ path: `.artifacts/enhanced-${role}-mobile.png`, fullPage: true });
    await context.close();
  }
});
