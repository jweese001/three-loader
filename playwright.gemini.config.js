// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * This is a dedicated configuration for Gemini's isolated testing environment.
 * It uses a unique port to avoid conflicts with local development servers.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for local execution
  workers: 1, // Run serially to be safe
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run a dedicated local dev server before starting the tests
  webServer: {
    command: 'vite --port 5199', // Use a unique port
    url: 'http://localhost:5199',
    reuseExistingServer: false, // NEVER reuse an existing server
    timeout: 120 * 1000, // Increase timeout just in case
  },
});
