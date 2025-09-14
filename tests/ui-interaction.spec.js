import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  // If a test fails, take a screenshot to help with debugging.
  if (testInfo.status === 'failed') {
    await page.screenshot({ path: 'test-failure.png' });
  }
});

test.describe('Phase 3: UI Interaction & State Change', () => {
  test('Material Editor changes reflect in code editor via From UI sync', async ({ page }) => {
    await page.goto('/');

    // 1. Load an object (e.g., a Box Geometry)
    await page.getByLabel('Select Geometry').selectOption('Box Geometry');
    await page.waitForFunction(() => document.getElementById('add-primitive-btn') && !document.getElementById('add-primitive-btn').disabled);
    await page.getByRole('button', { name: 'Add to Scene' }).click();
    const sceneObjectsPanel = page.locator('div:has(h3:has-text("Scene Objects"))');
    await expect(sceneObjectsPanel.getByText('Box_1')).toBeVisible();

    // 2. Switch to Code Editor view
    await page.getByRole('button', { name: 'View' }).click();
    await page.waitForSelector('.monaco-editor'); // Wait for the Monaco editor to appear

    // Now we are in the Code Editor view. Interact with Material Editor.
    // This part will be filled in later, after we confirm the view switch.

    // Assertion to ensure we are in the Code Editor view
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });
});

test('Recorded native UI interactions and From UI sync', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByLabel('Add Primitive Select Geometry').selectOption('torusKnot');
  await page.waitForFunction(() => document.getElementById('add-primitive-btn') && !document.getElementById('add-primitive-btn').disabled);
  await page.getByRole('button', { name: 'Add to Scene' }).click();
  await page.getByText('Material Editor ▼').click();
  await page.getByText('Material Editor ▼').click();
  await page.waitForSelector('select#material-type'); // Wait for the material type dropdown to be visible
  await page.getByLabel('Material Type Standard Basic').selectOption('phong');
  await page.getByRole('textbox', { name: 'Color' }).click();
  await page.getByRole('textbox', { name: 'Color' }).fill('#e44e4e');
  await page.getByLabel('Animation Type NoneRotate').selectOption('rotate-y');
  await page.getByRole('button', { name: 'View' }).click(); // Switch to code editor
  await page.getByRole('button', { name: 'From UI' }).click(); // Sync UI to code
  await page.waitForTimeout(500); // Give editor time to update

  const monacoEditor = page.locator('.monaco-editor'); // Generic selector for Monaco editor
  await expect(monacoEditor).toContainText('new THREE.TorusKnotGeometry');
  await expect(monacoEditor).toContainText('new THREE.MeshPhongMaterial');
  await expect(monacoEditor).toContainText("color: '#e44e4e'");
  await expect(await monacoEditor.innerText()).toMatch(/rotation\.y \+= 0\.01;/); // Fixed WebKit assertion

  await page.getByRole('button', { name: 'View' }).click(); // Switch back to UI
  await page.getByRole('slider', { name: 'Speed' }).fill('0.029');
  await page.locator('#pos-x').click();
  await page.locator('#pos-x').fill('2');
  await page.getByRole('button', { name: 'View' }).click(); // Switch to code editor
  await page.getByRole('button', { name: 'From UI' }).click(); // Sync UI to code
  await page.waitForTimeout(500); // Give editor time to update

  await expect(monacoEditor).toContainText('object1.position.set(2, 0, 0);');

  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('button', { name: 'To UI' }).click();
});