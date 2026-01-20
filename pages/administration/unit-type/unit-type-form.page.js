// pages/administration/unit-type/unit-type-form.page.js
const BasePage = require('../../base.page');

/**
 * Administration → Unit Type Form Page Object
 * Handles unit type creation and editing forms
 */
class UnitTypeFormPage extends BasePage {
  constructor(page) {
    super(page);

    // 🧩 Locators (semantic - better resilience)
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

  // 🌐 Navigation
  async expectOnPage() {
    await this.nameEn.waitFor({ state: 'visible', timeout: 10000 });
  }

  // 🔨 Form Filling
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
    if (type === 'static') {
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
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c);

      for (const corps of corpsList) {
        await this.corpsSelect.click();
        await this.corpsSelect.fill(corps);
        await this.page.waitForTimeout(500);
        const option = this.page.getByRole('option', {
          name: corps,
          exact: false,
        });
        if (await option.isVisible()) {
          await option.click();
        }
        await this.corpsSelect.press('Escape');
      }
    }
  }

  async save() {
    await this.saveBtn.click();
    await this.page.waitForURL(/\/administration\/unit-types/, {
      timeout: 15_000,
    });
    return true;
  }

  async cancel() {
    await this.cancelBtn.click();
  }

  // 🔨 Core Actions
  /**
   * Create new unit type
   * Fills form and submits
   */
  async fillForm(unitTypeData) {
    await this.fillBasicInfo(unitTypeData);
    await this.selectCategory(unitTypeData['Category']);
    await this.selectService(unitTypeData['Service']);
    await this.selectType(unitTypeData['Type']);
    await this.setCheckboxes(unitTypeData);
    await this.selectCorps(unitTypeData['Corps Names (English)']);
  }

  /**
   * Submit form in create mode
   * ✅ Uses smart wait instead of waitForTimeout(2000)
   */
  async create() {
    await this.clickButton(this.createButton);

    // ✅ Wait for navigation away from create page
    await this.waitForNavigation(
      (url) =>
        url.includes('/administration/unit-types') && !url.includes('/create'),
      10000,
    );

    return true; // Success if we reach here
  }

  /**
   * Submit form in edit mode
   */
  async update() {
    await this.clickButton(this.updateButton);

    // ✅ Wait for navigation away from edit page
    await this.waitForNavigation(
      (url) =>
        url.includes('/administration/unit-types') && !url.includes('/edit'),
      10000,
    );

    return true; // Success if we reach here
  }

  /**
   * Save (either create or update based on button visible)
   */
  async save() {
    const isCreateMode = await this.elementExists(this.createButton);
    return isCreateMode ? await this.create() : await this.update();
  }

  /**
   * Cancel form editing
   */
  async cancel() {
    await this.clickButton(this.cancelButton);
    await this.waitForPageLoad('networkidle');
  }

  // 🧪 Reusable sub-actions
  async fillBasicInfo(data) {
    if (data['Name (English)']) {
      await this.nameEnglishInput.fill(data['Name (English)']);
    }

    if (data['Name (Bangla)']) {
      await this.nameBanglaInput.fill(data['Name (Bangla)']);
    }

    if (data['Short Name (English)']) {
      await this.shortNameEnglishInput.fill(data['Short Name (English)']);
    }

    if (data['Short Name (Bangla)']) {
      await this.shortNameBanglaInput.fill(data['Short Name (Bangla)']);
    }
  }

  async selectCategory(category) {
    if (category) {
      await this.categorySelect.click();
      await this.page.getByRole('option', { name: category }).click();
    }
  }

  async selectService(service) {
    if (service) {
      await this.serviceSelect.click();
      await this.page.getByRole('option', { name: service }).click();
    }
  }

  async selectType(type) {
    if (type === 'Static') {
      await this.staticRadio.check();
    } else if (type === 'Field') {
      await this.fieldRadio.check();
    }
  }

  async setCheckboxes(data) {
    if (data['Is Workshop'] === 'Yes') {
      await this.workshopCheckbox.check();
    }

    if (data['Is Depot'] === 'Yes') {
      await this.depotCheckbox.check();
    }
  }

  async selectCorps(corps) {
    if (corps) {
      await this.corpsSelect.click();
      await this.corpsSelect.fill(corps.substring(0, 3));
      await this.page.getByRole('option', { name: corps }).click();
    }
  }

  // 🔁 Reset / Helpers
  async clearForm() {
    await this.nameEnglishInput.clear();
    await this.nameBanglaInput.clear();
    await this.shortNameEnglishInput.clear();
    await this.shortNameBanglaInput.clear();
  }

  // ⚠️ Message Handling
  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isSuccess() {
    try {
      await this.waitForSuccess();
      return true;
    } catch {
      return false;
    }
  }

  async getSuccessMessage() {
    try {
      await this.waitForSuccess();
      return await this.successMessage.textContent();
    } catch {
      return null;
    }
  }

  async getErrorMessage() {
    try {
      await this.waitForError();
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  async expectSuccess() {
    const success = await this.isSuccess();
    if (!success) {
      const error = await this.getErrorMessage();
      throw new Error(`Expected success but got error: ${error}`);
    }
  }
}

module.exports = UnitTypeFormPage;
