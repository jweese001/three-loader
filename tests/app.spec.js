import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  // If a test fails, take a screenshot to help with debugging.
  if (testInfo.status === 'failed') {
    await page.screenshot({ path: 'test-failure.png' });
  }
});

test('app loads and displays main UI elements', async ({ page }) => {
  // Navigate to the root of the local server
  await page.goto('/');

  // Wait for the main panel headers to be visible, ensuring the app is loaded.
  await expect(page.getByRole('heading', { name: 'Load Objects' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Scene Objects')).toBeVisible();
  await expect(page.getByText('Material Editor')).toBeVisible();

  // 1. Check for the correct page title
  await expect(page).toHaveTitle(/3LOADER/);

  // 2. Check that the main action buttons are visible
  await expect(page.getByRole('button', { name: 'Choose OBJ Files' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to Scene' })).toBeVisible();

  // 3. Check that the viewport is present
  await expect(page.locator('#viewport')).toBeVisible();

  
});
