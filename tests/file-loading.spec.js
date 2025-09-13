import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  // If a test fails, take a screenshot to help with debugging.
  if (testInfo.status === 'failed') {
    await page.screenshot({ path: 'test-failure.png' });
  }
});

test.describe('Phase 2: Core Functionality', () => {
  test('loads an OBJ file and verifies it in the scene list', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // The locator for the hidden file input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Choose OBJ Files' }).click();
    const fileChooser = await fileChooserPromise;

    // Set the input file
    await fileChooser.setFiles('examples/spiked.obj');

    // Get the panel that contains the scene objects by finding the heading and selecting its parent container
    const sceneObjectsPanel = page.locator('div:has(h3:has-text("Scene Objects"))');

    // Assert that the new object appears in the scene list, with a longer timeout for file processing
    await expect(sceneObjectsPanel.getByText('Spiked_1')).toBeVisible({ timeout: 10000 });
  });
});
