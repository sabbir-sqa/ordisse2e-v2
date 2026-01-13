// pages/unit-type/unit-type-form.page.js
const BasePage = require('../base.page');
class UnitTypeFormPage extends BasePage {
  constructor(page) {
    super(page);
    this.unitTypeCreateBtn = page.getByRole('button', {
      name: 'Create Unit Type',
    });
    this.unitTypeEnNameInput = page.getByLabel('Name (English)', {
      exact: true,
    });
    this.unitTypeBnNameInput = page.getByLabel('Name (Bengali)', {
      exact: true,
    });
    this.unitTypeShortEnNameInput = page.getByLabel('Short Name (English)', {
      exact: true,
    });
    this.unitTypeShortBnNameInput = page.getByLabel('Short Name (Bengali)', {
      exact: true,
    });
    this.unitTypeCategorySelect = page.getByLabel('Category', { exact: true });
    this.unitTypeServicesSelect = page.getByLabel('Services', { exact: true });
    this.unitTypeTypeStaticRadioBtn = page.getByLabel('Static', {
      exact: true,
    });
    this.unitTypeTypeFieldRadioBtn = page.getByLabel('Field', { exact: true });
    this.unitTypeServiceTypeDepotCheckbox = page.getByLabel('Depot', {
      exact: true,
    });
    this.unitTypeServiceTypeWorkshopCheckbox = page.getByLabel('Workshop', {
      exact: true,
    });
    this.unitTypeSaveBtn = page.getByRole('button', { name: 'Create' });
    this.unitTypeCancelBtn = page.getByRole('button', { name: 'Cancel' });
  }

  async fillUnitTypeForm(data) {
    await this.fillField('Name (English)', data.nameEn);
    await this.fillField('Name (Bengali)', data.nameBn);
    await this.fillField('Short Name (English)', data.shortNameEn);
    await this.fillField('Short Name (Bengali)', data.shortNameBn);
    await this.selectOption('Category', data.category);
  }
}
