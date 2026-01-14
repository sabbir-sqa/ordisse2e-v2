// pages/unit-type/unit-type-form.page.js
const BasePage = require('../base.page');

class UnitTypeFormPage extends BasePage {
  constructor(page) {
    super(page);
    // Inputs
    this.nameEn = page.getByLabel('Name (English)', { exact: true });
    this.nameBn = page.getByLabel('Name (Bengali)', { exact: true });
    this.shortNameEn = page.getByLabel('Short Name (English)', { exact: true });
    this.shortNameBn = page.getByLabel('Short Name (Bengali)', { exact: true });

    // Selects
    this.categorySelect = page.getByLabel('Category', { exact: true });
    this.serviceSelect = page.getByLabel('Services', { exact: true });
    this.corpsSelect = page.getByLabel('Select corps', { exact: true });

    // Radios
    this.staticRadio = page.getByLabel('Static', { exact: true });
    this.fieldRadio = page.getByLabel('Field', { exact: true });

    // Checkboxes
    this.depotCheckbox = page.getByLabel('Depot', { exact: true });
    this.workshopCheckbox = page.getByLabel('Workshop', { exact: true });

    // Buttons
    this.saveBtn = page.getByRole('button', { name: 'Create' });
    this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
  }

  async fillForm(data) {
    // Fill text inputs
    await this.nameEn.fill(data['Name (English)']);
    await this.nameBn.fill(data['Name (Bengali)']);
    if (data['Short Name (English)'])
      await this.shortNameEn.fill(data['Short Name (English)']);
    if (data['Short Name (Bengali)'])
      await this.shortNameBn.fill(data['Short Name (Bengali)']);

    // Category select
    if (data.Category) {
      await this.categorySelect.click();
      await this.page
        .getByRole('option', { name: data.Category.trim(), exact: true })
        .click();
    }

    // Services select
    if (data.service) {
      await this.serviceSelect.click();
      await this.page
        .getByRole('option', { name: data.service.trim(), exact: true })
        .click();
    }

    // Type: Static/Field radio
    const type = (data.Type || '').toLowerCase();
    if (type === ' static') {
      await this.staticRadio.check();
    } else if (type === 'field') {
      await this.fieldRadio.check();
    }

    // Service Type: Depot/Workshop checkboxes
    const isDepot = (data['Depot'] || '').toLowerCase();
    const isWorkshop = (data['Workshop'] || '').toLowerCase();

    const depotChecked = await this.depotCheckbox.isChecked();
    const workshopChecked = await this.workshopCheckbox.isChecked();

    if (isDepot !== depotChecked) await this.depotCheckbox.click();
    if (isWorkshop !== workshopChecked) await this.workshopCheckbox.click();

    // Corps multi-select
    if (data['Corps']) {
      const corpsList = data['Corps']
        .split(',') // Split by comma
        .map((c) => c.trim()) // Trim whitespace
        .filter((c) => c); // Remove empty strings

      for (const corps of corpsList) {
        await this.corpsSelect.click();
        await this.corpsSelect.fill(corps);
        await this.page.waitForTimeout(500); // Wait for options to filter
        const option = this.page.getByRole('option', {
          name: corps,
          exact: false,
        });
        if (await option.isVisible()) {
          await option.click();
        }
        // Clear input for next entry (if any)
        await this.corpsSelect.press('Escape');
      }
    }
  }

  async save() {
    await this.saveBtn.click();
    // Wait for success or navigate back to list
    await this.page.waitForURL(/\/administration\/unit-types/, {
      timeout: 15_000,
    });
    return true;
  }

  async cancel() {
    await this.cancelBtn.click();
  }
}

module.exports = UnitTypeFormPage;
