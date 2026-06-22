import { defineConfig, devices } from "@playwright/test"

const frontendUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001"
const backendUrl = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:8080"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
  },
  metadata: {
    backendUrl,
  },
  webServer: {
    command: "pnpm run dev -- --host 127.0.0.1 --port 3001",
    url: frontendUrl,
    reuseExistingServer: true,
    timeout: 60_000,
    env: {
      VITE_USE_MOCK_FALLBACK: "false",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
