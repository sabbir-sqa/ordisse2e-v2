// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/auth/login.page');

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully with valid credentials', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.VALID_USERNAME,
      process.env.VALID_PASSWORD
    );
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show error with invalid credentials', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.usernameInput.fill(process.env.SUPERADMIN_USERNAME);
    await loginPage.passwordInput.fill('wrongpassword');
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Invalid username or password'
    );
  });
});
