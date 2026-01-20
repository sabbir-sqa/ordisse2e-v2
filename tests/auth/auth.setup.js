// tests/auth.setup.js
const { test } = require('@playwright/test');
const LoginPage = require('../../pages/auth/login.page');

test.use({ storageState: undefined });

test('authenticate once', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(
    process.env.SUPERADMIN_USERNAME,
    process.env.SUPERADMIN_PASSWORD,
  );

  //
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
