# ♊ **Gemini Support Plan: three-loader**

This document outlines the development and support plan provided by Gemini for the `three-loader` project. It is based on the initial [Codebase Review](./gemini-docs/CODEBASE_REVIEW.md) and will serve as a living document to track tasks and priorities.

## **Immediate Priority: Automated Testing Strategy**

Based on the codebase review, the highest priority is to establish an automated testing framework. This will provide a safety net for future development, prevent regressions, and enable safe refactoring.

We will use **Playwright** for end-to-end (E2E) testing, as it excels at simulating real user interactions in a browser environment, which is perfect for this highly interactive application.

---

### **Phase 1: Playwright Setup & Initial Smoke Test**

**Goal:** Install, configure, and validate the testing framework.

1.  **Install Playwright:**
    *   Add the necessary development dependency to `package.json`.
    *   Command: `npm install --save-dev @playwright/test`

2.  **Configure Playwright:**
    *   Create `playwright.config.js` at the project root.
    *   Configure the `webServer` option to automatically launch the Vite dev server (`npm run dev`) before running tests. This ensures tests run against a live, build-free version of the app.
    *   Set the base URL to the Vite server address (e.g., `http://localhost:5173`).

3.  **Create First Test (Smoke Test):**
    *   Create a new test file, e.g., `tests/app.spec.js`.
    *   Write a simple test that:
        *   Navigates to the root URL.
        *   Asserts that the page title is correct.
        *   Asserts that the main UI panels (e.g., "Scene Objects", "Material Editor") are visible.
    *   This test will confirm that the application loads without crashing.

4.  **Update `package.json`:**
    *   Add a new script for running tests: `"test": "playwright test"`.

---

### **Phase 2: Core Functionality Tests**

**Goal:** Test the fundamental features of loading and creating objects.

1.  **Test File Loading:**
    *   Create a test that simulates a user dragging and dropping an `.obj` file (`examples/spiked.obj`) onto the viewport.
    *   **Assertions:**
        *   Verify that a new item appears in the "Scene Objects" list.
        *   Verify that the object count in the scene statistics increases.
        *   (Advanced) Verify that the 3D canvas contains new geometry.

2.  **Test Primitive Creation:**
    *   Create a test that selects "Box" from the primitive dropdown and clicks the "Add Primitive" button.
    *   **Assertions:**
        *   Verify that a "Box" object appears in the "Scene Objects" list.
        *   Verify that the "Add Primitive" button becomes disabled after creation.

---

### **Phase 3: UI Interaction & State Change Tests**

**Goal:** Ensure that UI controls correctly modify the state of the 3D objects.

1.  **Test Material Editor:**
    *   Load an object.
    *   Use Playwright locators to interact with the "Material Editor" panel.
    *   Change the color using the color picker.
    *   Drag the `roughness` slider.
    *   **Assertions:** This is tricky without direct access to the Three.js scene. We will use the **bidirectional sync** feature as our validation mechanism. After changing the UI, we will:
        *   Click the "From UI" sync button.
        *   Assert that the code in the Monaco editor now contains the new color hex value and roughness value.

2.  **Test Transform Controls:**
    *   Load an object.
    *   Interact with the "Transform" panel inputs to change the `position-x` value.
    *   **Assertions:**
        *   Click the "From UI" sync button.
        *   Assert that the code in the Monaco editor reflects the new X position.

---

### **Phase 4: Bidirectional Sync Workflow Tests**

**Goal:** Test the most critical and complex feature of the application—the sync between the code and the UI.

1.  **Test UI-to-Code Sync:**
    *   This is covered by the tests in Phase 3, which use the code editor's state as the ground truth for UI changes.

2.  **Test Code-to-UI Sync:**
    *   Load an object.
    *   Programmatically clear the Monaco editor and fill it with a simple piece of code that creates a `MeshStandardMaterial` with a unique color (e.g., `0xff00ff`).
    *   Click the "To UI" sync button.
    *   **Assertions:**
        *   Assert that the color picker in the "Material Editor" now shows the new color (`#ff00ff`).
        *   (Advanced) Take a screenshot of the viewport to visually verify the object's color has changed. Playwright's visual regression testing can be used here.

---

### **Future Goals**

Once a robust testing suite is in place, I can proceed with other improvements identified in the codebase review:

*   **Code Quality:** Integrate and configure ESLint and Prettier.
*   **TypeScript Migration:** Begin a gradual migration from JavaScript to TypeScript to improve code safety and maintainability.
*   **State Management Refactor:** Explore introducing a formal state management library to simplify the application's data flow.

---

## **Session Summary (2025-09-13)**

This session focused on establishing and debugging the Playwright automated testing framework for the `three-loader` project.

*   **Playwright Setup:** Confirmed Playwright installation and configuration.
*   **Port Conflict Resolution:** Resolved port conflicts by updating `vite.config.js` and `playwright.config.js` to use `http://localhost:5173` for the development server.
*   **Test Implementation & Debugging:**
    *   Implemented and refined UI interaction tests in `tests/ui-interaction.spec.js` and `tests/core-functionality.spec.js`.
    *   Addressed various Playwright test failures, including:
        *   `ENOENT` errors for file paths by correcting relative paths.
        *   `element not visible/enabled` errors by adding `page.waitForSelector` and `page.waitForFunction` calls to ensure UI elements are ready for interaction.
        *   Assertion failures in the Monaco editor content by refining expected text and using `toMatch` with regex for WebKit-specific rendering.
        *   Resolved a `SyntaxError` due to incorrect string escaping in assertions.
*   **Current Status:** All implemented Playwright tests are now passing across Chromium, Firefox, and WebKit.

## **Updated Tasks List**

*   **Phase 3: UI Interaction & State Change Tests (Complete)**
    *   Test Material Editor: Implemented and passing.
    *   Test Transform Controls: Implemented and passing.
*   **Phase 4: Bidirectional Sync Workflow Tests (Next Priority)**
    *   Test UI-to-Code Sync: Partially covered by Phase 3 tests.
    *   **Implement Code-to-UI Sync Test:** This involves programmatically setting Monaco editor content and asserting UI changes.
*   **Future Goals (Unchanged)**
    *   Code Quality: Integrate and configure ESLint and Prettier.
    *   TypeScript Migration: Begin a gradual migration from JavaScript to TypeScript.
    *   State Management Refactor: Explore introducing a formal state management library.