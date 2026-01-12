// tests/auth.setup.js
const { test } = require('@playwright/test');
const LoginPage = require('../pages/auth/login.page').LoginPage;

test.use({ storageState: undefined }); // Ensure no prior auth state

test('authenticate once before tests', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(
    process.env.SUPERUSER_USERNAME,
    process.env.SUPERUSER_PASSWORD
  );
});

// Save signed-in state to 'auth.json' for reuse in tests
await page.context().storageState({ path: './playwright/.auth/user.json' });
