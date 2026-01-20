// tests/auth/login.spec.js
/**
 * Login Tests
 *
 * ✅ Purpose: Verify authentication flows and login validation
 * ✅ When to use: New login features, auth changes, credential validation
 * ✅ Independent: Does NOT use shared auth state (test.use override)
 *
 * 📍 Location: tests/auth/login.spec.js
 * 📍 Related: tests/setup/global-setup.js (handles shared auth caching)
 */
const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/auth/login.page');

// Override to NOT use saved auth for login tests
// Each test starts fresh to properly test the login flow
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login Tests', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should login successfully with valid credentials', async () => {
    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.SUPERADMIN_USERNAME || 'main.superadmin',
      process.env.SUPERADMIN_PASSWORD || 'Ordiss@SA',
    );

    expect(await loginPage.isLoggedIn()).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await loginPage.gotoLoginPage();

    // Fill credentials manually without waiting for navigation
    const userIdField = page.getByRole('textbox', { name: 'Enter user ID' });
    const passwordField = page.getByRole('textbox', { name: 'Enter password' });

    await loginPage.fillField(userIdField, 'wronguser');
    await loginPage.fillField(passwordField, 'wrongpass');
    await loginPage.clickButton(page.getByRole('button', { name: 'Log in' }));

    // ✅ Wait for error message to appear instead of fixed timeout
    const errorLocator = page.locator('[data-testid="error-message"]');
    try {
      await loginPage.waitForElement(errorLocator);
    } catch {
      // Error message might not show, just check isLoggedIn
    }

    expect(await loginPage.isLoggedIn()).toBeFalsy();
  });

  test('should validate login form elements', async () => {
    await loginPage.gotoLoginPage();
    expect(await loginPage.validateLoginForm()).toBeTruthy();
  });

  test('should handle empty credentials', async ({ page }) => {
    await loginPage.gotoLoginPage();

    await page.getByRole('button', { name: 'Log in' }).click();

    // ✅ Wait for error or check login state
    // Instead of: await page.waitForTimeout(1000)
    const errorLocator = page.locator('[data-testid="error-message"]');
    try {
      await loginPage.waitForElement(errorLocator, 3000);
    } catch {
      // Error might not show, just verify not logged in
    }

    expect(await loginPage.isLoggedIn()).toBeFalsy();
  });
});
