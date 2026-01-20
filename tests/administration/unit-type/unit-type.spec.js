// tests/administration/unit-type/unit-type.spec.js
/**
 * Administration → Unit Type Tests
 *
 * 📍 Module: Administration
 * 📍 Feature: Unit Type Management
 * 📍 Purpose: Test unit type CRUD operations
 *
 * ✅ When to use: Unit type feature changes, form validation, grid operations
 * ✅ Uses: Shared auth state from global-setup (faster execution)
 *
 * 📁 Structure:
 * tests/
 *   ├── setup/                        # Global infrastructure
 *   └── administration/               # MAIN MODULE
 *       ├── unit-type/               # Feature folder
 *       │   └── unit-type.spec.js    # Tests for this feature
 *       ├── organogram/              # Other features under Administration
 *       ├── units/
 *       ├── roles-permissions/
 *       └── user-management/
 *
 * 📍 Page Objects: pages/administration/unit-type/unit-type-*.page.js
 * 📍 Test Data: test-data/unit-types.csv
 */
const { test, expect } = require('@playwright/test');
const LoginPage = require('../../../pages/auth/login.page');
const UnitTypeListPage = require('../../../pages/administration/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../../../pages/administration/unit-type/unit-type-form.page');

test.describe('Administration → Unit Type Management', () => {
  let loginPage;
  let listPage;
  let formPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    listPage = new UnitTypeListPage(page);
    formPage = new UnitTypeFormPage(page);

    // Start from landing page and login
    await loginPage.gotoLoginPage();
    await loginPage.login(
      process.env.SUPERADMIN_USERNAME || 'main.superadmin',
      process.env.SUPERADMIN_PASSWORD || 'Ordiss@SA',
    );

    // Navigate to unit types
    await listPage.navigate();
  });

  test('should display unit type list page', async () => {
    await listPage.expectOnPage();
  });

  test('should open create unit type form', async () => {
    await listPage.clickCreate();
    await formPage.expectOnPage();

    // Verify form fields are visible
    await expect(formPage.nameEn).toBeVisible();
    await expect(formPage.categorySelect).toBeVisible();
    await expect(formPage.saveBtn).toBeVisible();
  });

  test('should search and filter unit types', async () => {
    // Search for a unit type
    await listPage.search('Army');

    // Verify search input has the value
    const searchValue = await listPage.searchInput.inputValue();
    expect(searchValue).toContain('Army');
  });

  test('should handle form cancellation', async () => {
    await listPage.clickCreate();
    await formPage.nameEn.fill('Cancel Test');
    await formPage.cancel();

    // Should be back on list page
    await listPage.expectOnPage();
  });
});
