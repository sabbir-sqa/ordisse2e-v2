// pages/unit-type/unit-type-list.page.js
const BasePage = require('../base.page');

class UnitTypeListPage extends BasePage {
  constructor(page) {
    super(page);
    this.unitTypeBreadcrumb = page
      .locator('main-breadcrumb')
      .getByText('Unit Types');
    this.createButton = page.getByRole('button', { name: 'Create Unit Type' });
    this.unitTypeImportButton = page.getByRole('button', { name: 'Import' });
    this.unitTypeFilterButton = page.getByRole('button', { name: 'Filter' });
    this.unitTypeExportButton = page.getByRole('button', { name: 'Export' });
    this.unitTypeSearchInput = page.getByRole('combobox', { name: 'Search' });
    this.unitTypeNameColumnHeader = page.getByRole('button', {
      name: 'Name',
      exact: true,
    });
  }

  async navigate() {
    await this.page.goto('/administration/unit-types'); // Adjust path as needed
    await this.page.waitForLoadState('networkidle'); // Wait for network to be idle
  }

  async search(name) {
    await this.unitTypeSearchInput.fill(name);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500); // Wait for search results to load
  }

  async isUnitTypeVisible() {
    return await this.unitTypeNameColumnHeader().isVisible();
  }
}

module.exports = { UnitTypeListPage };
