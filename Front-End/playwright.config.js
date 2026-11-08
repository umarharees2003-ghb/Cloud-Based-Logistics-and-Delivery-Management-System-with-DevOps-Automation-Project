import { defineConfig } from "@playwright/test";
export default defineConfig({
  timeout: 60000,
  testDir: "./tests", testMatch: "**/*.spec.js", workers: 1,
  use: { baseURL: "http://127.0.0.1:5179", viewport: { width: 1280, height: 800 }, trace: "retain-on-failure" },
  outputDir: ".artifacts/playwright",
  webServer: [
    { command: "node tests/start-api.cjs", url: "http://127.0.0.1:5056/api/health/ready", env: { TEST_API_PORT: "5056", DEMO_PUBLIC_STAFF_SIGNUP: "true" }, timeout: 120000, reuseExistingServer: false },
    { command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5180 --strictPort", url: "http://127.0.0.1:5180", env: { ROUTEFLOW_API_TARGET: "http://127.0.0.1:5056" }, reuseExistingServer: false },
    { command: "node tests/prepare-baseline.cjs && node node_modules/vite/bin/vite.js .artifacts/baseline/Front-End --host 127.0.0.1 --port 5181 --strictPort", url: "http://127.0.0.1:5181", timeout: 60000, reuseExistingServer: false },
    { command: "node tests/start-api.cjs", url: "http://127.0.0.1:5055/api/health/ready", timeout: 120000, reuseExistingServer: false },
    { command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5179 --strictPort", url: "http://127.0.0.1:5179", env: { ROUTEFLOW_API_TARGET: "http://127.0.0.1:5055" }, reuseExistingServer: false },
  ],
});
