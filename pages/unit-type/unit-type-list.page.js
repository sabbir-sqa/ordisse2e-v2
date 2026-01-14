// pages/unit-type/unit-type-list.page.js
const BasePage = require('../base.page');

class UnitTypeListPage extends BasePage {
  constructor(page) {
    super(page);
    this.createButton = page.getByRole('button', { name: 'Create Unit Type' });
    this.searchInput = page.getByRole('combobox', { name: 'Search' });
    // Locator for a row containing specific unit type name
    this.unitTypeRowByName = (name) =>
      page.locator(`.mat-row:has-text("${name}")`).first();
  }

  async navigate() {
    await this.page.goto('/administration/unit-types');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
    await this.page.waitForSelector('text=Create Unit Type', {
      state: 'visible',
    });
  }

  async search(name) {
    await this.searchInput.fill(name);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(800); // Allow debounce
  }

  async isUnitTypeVisible(name) {
    return await this.unitTypeRowByName(name).isVisible({ timeout: 5000 });
  }
}

module.exports = UnitTypeListPage;
