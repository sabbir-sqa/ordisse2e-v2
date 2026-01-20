// tests/unit-type.spec.js
const { test, expect } = require('@playwright/test');
const { readCSV } = require('../utils/csv-reader');
const UnitTypeListPage = require('../pages/unit-type/unit-type-list.page');
const UnitTypeFormPage = require('../pages/unit-type/unit-type-form.page');

let testData = [];

test.beforeAll(async () => {
  try {
    testData = await readCSV('./test-data/unit-types.csv');
    if (!Array.isArray(testData) || testData.length === 0) {
      throw new Error('No test data loaded from CSV');
    }
    console.log(`Loaded ${testData.length} unit types for testing`);
  } catch (error) {
    console.error('Failed to load test data:', error.message);
    throw error;
  }
});

test.describe('Unit Type CRUD Tests', () => {
  // Only run tests if testData is valid
  if (testData.length > 0) {
    for (const [index, unitType] of testData.entries()) {
      test(`[${index + 1}] Create Unit Type: ${unitType['Name (English)']}`, async ({
        page,
      }) => {
        const listPage = new UnitTypeListPage(page);
        const formPage = new UnitTypeFormPage(page);

        await listPage.navigate();
        await listPage.clickCreate();
        await formPage.fillForm(unitType);
        await formPage.save();

        // Optional: verify
        await listPage.navigate();
        await listPage.search(unitType['Name (English)']);
        expect(
          await listPage.isUnitTypeVisible(unitType['Name (English)']),
        ).toBeTruthy();
      });
    }
  } else {
    test.skip('No test data available', () => {});
  }
});
