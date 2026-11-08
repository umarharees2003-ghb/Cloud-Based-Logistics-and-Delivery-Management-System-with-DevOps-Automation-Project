import { test, expect } from "@playwright/test";
test.use({ baseURL: "http://127.0.0.1:5180" });
const labels = { customer: "Customer / Sender", merchant: "Business Client / Merchant", driver: "Delivery Driver / Courier", logistics: "Logistics Manager / Operations Staff" };
for (const role of ["customer", "merchant", "driver", "logistics"]) {
  test(`demo signup persists selected ${role} role and opens original dashboard on login`, async ({ page, request }) => {
    const email = `self-${role}@demo-browser.test`;
    await page.goto("/");
    await page.getByRole("button", { name: "Sign up", exact: true }).click();
    await expect(page.locator("select[name=roleId] option")).toHaveCount(6);
    await page.locator("select[name=roleId]").selectOption(role);
    await page.locator("input[name=fullName]").fill(`Self Registered ${role}`);
    await page.locator("input[name=email]").fill(email);
    await page.locator("input[name=password]").fill("SelfSignupPassword123!");
    await page.locator("input[name=confirmPassword]").fill("SelfSignupPassword123!");
    const registered = page.waitForResponse((res) => res.url().endsWith("/api/auth/register") && res.request().method() === "POST");
    await page.locator("button[type=submit]").click();
    const response = await registered; expect(response.status()).toBe(201);
    const session = await response.json(); expect(session.user.role).toBe(role);
    const headers = { Authorization: `Bearer ${session.token}` };
    const me = await request.get("/api/auth/me", { headers }); expect((await me.json()).user.role).toBe(role);
    expect((await request.get("/api/users", { headers })).status()).toBe(403);
    await expect(page.locator(".role-demo-banner")).toContainText(labels[role]);
    if (role === "driver") {
      await expect(page.getByText("No fleet profile", { exact: true })).toBeVisible();
      const fleetProfile = await request.get("/api/drivers/me/profile", { headers });
      expect(fleetProfile.status()).toBe(200); expect((await fleetProfile.json()).data).toBeNull();
    }
    await page.locator(".sidebar-profile").click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.locator("select[name=roleId]").selectOption(role);
    await page.locator("input[name=email]").fill(email);
    await page.locator("input[name=password]").fill("SelfSignupPassword123!");
    await page.locator("button[type=submit]").click();
    await expect(page.locator(".role-demo-banner")).toContainText(labels[role]);
    await page.reload(); await expect(page.locator(".role-demo-banner")).toContainText(labels[role]);
    if (role === "logistics") {
      await page.getByRole("button", { name: /^Deliveries \d+$/ }).click();
      await expect(page.getByRole("heading", { name: "All deliveries", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "New delivery", exact: false }).click();
      await expect(page.getByRole("dialog")).toContainText("Create a delivery");
      await page.getByRole("button", { name: "Close form" }).click();
      await page.getByRole("button", { name: "Fleet management", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Driver roster" })).toBeVisible();
      await page.getByRole("button", { name: "Analytics & reports", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Weekly performance" })).toBeVisible();
    }
  });
}
test("demo mode still rejects public administrator signup in the original dropdown", async ({ page }) => {
  await page.goto("/"); await page.getByRole("button", { name: "Sign up", exact: true }).click();
  await page.locator("select[name=roleId]").selectOption("administrator");
  await page.locator("input[name=fullName]").fill("Unapproved Administrator");
  await page.locator("input[name=email]").fill("blocked-admin@demo-browser.test");
  await page.locator("input[name=password]").fill("SelfSignupPassword123!");
  await page.locator("input[name=confirmPassword]").fill("SelfSignupPassword123!");
  await page.locator("button[type=submit]").click();
  await expect(page.locator(".auth-notice")).toContainText("Role:");
  await expect(page.locator(".auth-notice")).toContainText("administrator");
  await expect(page.locator(".ops-sidebar")).toHaveCount(0);
});
