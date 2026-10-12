import { defineConfig, devices } from "@playwright/test";

// The sign-in test creates and deletes a throwaway user, so it needs DATABASE_URL.
process.loadEnvFile(".env.local");

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: true,
  },
});
