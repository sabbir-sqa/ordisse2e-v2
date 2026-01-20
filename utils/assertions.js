// utils/assertions.js
/**
 * Assertion Helpers
 *
 * 📚 PURPOSE:
 * Provides reusable assertion functions for common test validations.
 * Makes tests more readable and maintainable.
 *
 * 🎯 WHEN TO USE:
 * - Validating table/list content
 * - Checking form validation messages
 * - Verifying notification messages
 * - Confirming data in UI
 *
 * 💡 EXAMPLE:
 * // Instead of:
 * const rows = await page.locator('tr[data-row]').count();
 * expect(rows).toBeGreaterThan(0);
 *
 * // Use:
 * await assertTableNotEmpty(page, 'tr[data-row]');
 *
 * NEW MEMBERS:
 * - These functions wrap Playwright assertions
 * - All use async/await
 * - All throw descriptive errors on failure
 * - Import and use like: assertXxx(page, selector, expected)
 */

const { expect } = require('@playwright/test');

/**
 * Assert table/grid has rows
 * @param {Page} page - Playwright page object
 * @param {string} rowSelector - CSS selector for table rows
 * @param {number} minRows - Minimum expected rows (default: 1)
 *
 * USAGE:
 *   await assertTableNotEmpty(page, 'tr[data-role="table-row"]');
 *   await assertTableNotEmpty(page, 'tbody > tr', 5); // At least 5 rows
 */
async function assertTableNotEmpty(page, rowSelector, minRows = 1) {
  const rows = page.locator(rowSelector);
  const count = await rows.count();

  expect(count).toBeGreaterThanOrEqual(minRows);
}

/**
 * Assert table contains specific value
 * @param {Page} page - Playwright page object
 * @param {string} tableSelector - CSS selector for table
 * @param {string} searchValue - Value to find
 *
 * USAGE:
 *   await assertTableContains(page, 'tbody', 'Engineering');
 *   await assertTableContains(page, '[data-role="grid"]', 'John Doe');
 */
async function assertTableContains(page, tableSelector, searchValue) {
  const table = page.locator(tableSelector);
  const content = await table.textContent();

  expect(content).toContain(searchValue);
}

/**
 * Assert table does NOT contain specific value
 * @param {Page} page
 * @param {string} tableSelector
 * @param {string} searchValue
 *
 * USAGE:
 *   await assertTableNotContains(page, 'tbody', 'Deleted Unit');
 */
async function assertTableNotContains(page, tableSelector, searchValue) {
  const table = page.locator(tableSelector);
  const content = await table.textContent();

  expect(content).not.toContain(searchValue);
}

/**
 * Assert form field has validation error
 * @param {Page} page
 * @param {string} fieldName - Name attribute of field
 * @param {string} errorMessage - Expected error message
 *
 * USAGE:
 *   await assertFormFieldError(page, 'email', 'Invalid email');
 *   await assertFormFieldError(page, 'username', 'Required');
 */
async function assertFormFieldError(page, fieldName, errorMessage) {
  // Find field error message
  const errorLocator = page
    .locator(`[name="${fieldName}"]`)
    .locator('..')
    .locator('.mat-error, [role="alert"]');

  const errorText = await errorLocator.textContent();
  expect(errorText).toContain(errorMessage);
}

/**
 * Assert form field is valid (no error)
 * @param {Page} page
 * @param {string} fieldName
 *
 * USAGE:
 *   await assertFormFieldValid(page, 'email');
 */
async function assertFormFieldValid(page, fieldName) {
  const errorLocator = page
    .locator(`[name="${fieldName}"]`)
    .locator('..')
    .locator('.mat-error, [role="alert"]');

  const errorCount = await errorLocator.count();
  expect(errorCount).toBe(0);
}

/**
 * Assert success notification message appears
 * @param {Page} page
 * @param {string} expectedMessage - Message text to verify
 * @param {number} timeout - Max wait time (default: 5 seconds)
 *
 * USAGE:
 *   await assertSuccessMessage(page, 'Unit created successfully');
 *   await assertSuccessMessage(page, 'Saved', 3000);
 */
async function assertSuccessMessage(page, expectedMessage, timeout = 5000) {
  const successLocator = page.locator(
    '[role="alert"].success, .success-message, .mat-snack-bar-container',
  );

  try {
    await successLocator.waitFor({ state: 'visible', timeout });
    const message = await successLocator.textContent();
    expect(message).toContain(expectedMessage);
  } catch (error) {
    throw new Error(
      `❌ Success message not found. Expected: "${expectedMessage}"\n` +
        `   Timeout: ${timeout}ms`,
    );
  }
}

/**
 * Assert error notification message appears
 * @param {Page} page
 * @param {string} expectedMessage - Message text to verify
 * @param {number} timeout - Max wait time (default: 5 seconds)
 *
 * USAGE:
 *   await assertErrorMessage(page, 'Failed to save');
 */
async function assertErrorMessage(page, expectedMessage, timeout = 5000) {
  const errorLocator = page.locator(
    '[role="alert"].error, .error-message, .mat-error',
  );

  try {
    await errorLocator.waitFor({ state: 'visible', timeout });
    const message = await errorLocator.textContent();
    expect(message).toContain(expectedMessage);
  } catch (error) {
    throw new Error(
      `❌ Error message not found. Expected: "${expectedMessage}"\n` +
        `   Timeout: ${timeout}ms`,
    );
  }
}

/**
 * Assert element text matches exactly
 * @param {Page} page
 * @param {string} selector
 * @param {string} expectedText
 *
 * USAGE:
 *   await assertElementText(page, 'h1', 'Unit Types');
 */
async function assertElementText(page, selector, expectedText) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: 5000 });

  const text = await element.textContent();
  expect(text?.trim()).toBe(expectedText.trim());
}

/**
 * Assert element text contains substring
 * @param {Page} page
 * @param {string} selector
 * @param {string} expectedText
 *
 * USAGE:
 *   await assertElementTextContains(page, 'p', 'Loading');
 */
async function assertElementTextContains(page, selector, expectedText) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: 5000 });

  const text = await element.textContent();
  expect(text).toContain(expectedText);
}

/**
 * Assert modal/dialog is visible
 * @param {Page} page
 * @param {string} modalSelector - CSS selector for modal
 * @param {string} expectedTitle - Expected modal title (optional)
 *
 * USAGE:
 *   await assertModalVisible(page, '[role="dialog"]');
 *   await assertModalVisible(page, '.modal', 'Confirm Delete');
 */
async function assertModalVisible(page, modalSelector, expectedTitle = null) {
  const modal = page.locator(modalSelector);

  try {
    await modal.waitFor({ state: 'visible', timeout: 5000 });
  } catch (error) {
    throw new Error(`❌ Modal not visible: ${modalSelector}`);
  }

  if (expectedTitle) {
    const title = modal.locator('h1, h2, .modal-title').first();
    const titleText = await title.textContent();
    expect(titleText).toContain(expectedTitle);
  }
}

/**
 * Assert modal/dialog is hidden
 * @param {Page} page
 * @param {string} modalSelector
 *
 * USAGE:
 *   await assertModalHidden(page, '[role="dialog"]');
 */
async function assertModalHidden(page, modalSelector) {
  const modal = page.locator(modalSelector);

  try {
    await modal.waitFor({ state: 'hidden', timeout: 5000 });
  } catch (error) {
    throw new Error(`❌ Modal still visible: ${modalSelector}`);
  }
}

/**
 * Assert element has specific attribute value
 * @param {Page} page
 * @param {string} selector
 * @param {string} attributeName
 * @param {string} expectedValue
 *
 * USAGE:
 *   await assertElementAttribute(page, 'input[name="email"]', 'value', 'test@test.com');
 *   await assertElementAttribute(page, 'button', 'disabled', 'true');
 */
async function assertElementAttribute(
  page,
  selector,
  attributeName,
  expectedValue,
) {
  const element = page.locator(selector);
  const attribute = await element.getAttribute(attributeName);

  expect(attribute).toBe(expectedValue);
}

/**
 * Assert element is enabled/disabled
 * @param {Page} page
 * @param {string} selector
 * @param {boolean} shouldBeEnabled - true = enabled, false = disabled
 *
 * USAGE:
 *   await assertElementEnabled(page, '[type="submit"]', true);
 *   await assertElementDisabled(page, '[type="submit"]', true); // shortcut
 */
async function assertElementEnabled(page, selector, shouldBeEnabled = true) {
  const element = page.locator(selector);
  const isEnabled = await element.isEnabled();

  expect(isEnabled).toBe(shouldBeEnabled);
}

/**
 * Shortcut for disabled elements
 */
async function assertElementDisabled(page, selector) {
  await assertElementEnabled(page, selector, false);
}

/**
 * Assert multiple elements exist
 * @param {Page} page
 * @param {string} selector
 * @param {number} expectedCount
 *
 * USAGE:
 *   await assertElementCount(page, 'tr[data-row]', 5);
 */
async function assertElementCount(page, selector, expectedCount) {
  const elements = page.locator(selector);
  const count = await elements.count();

  expect(count).toBe(expectedCount);
}

/**
 * Assert URL matches pattern
 * @param {Page} page
 * @param {string|RegExp} pattern
 *
 * USAGE:
 *   await assertUrlContains(page, '/admin/units');
 *   await assertUrlContains(page, /unit\/\d+/);
 */
async function assertUrlContains(page, pattern) {
  const url = page.url();

  if (typeof pattern === 'string') {
    expect(url).toContain(pattern);
  } else {
    expect(url).toMatch(pattern);
  }
}

/**
 * Assert dropdown/select has specific option
 * @param {Page} page
 * @param {string} selectSelector
 * @param {string} optionValue
 *
 * USAGE:
 *   await assertSelectHasOption(page, '[name="category"]', 'Army');
 */
async function assertSelectHasOption(page, selectSelector, optionValue) {
  const select = page.locator(selectSelector);
  const option = select.locator(`option[value="${optionValue}"]`);

  const count = await option.count();
  expect(count).toBeGreaterThan(0);
}

/**
 * Assert data attribute matches
 * @param {Page} page
 * @param {string} selector
 * @param {string} dataAttrName - Without 'data-' prefix
 * @param {string} expectedValue
 *
 * USAGE:
 *   await assertDataAttribute(page, 'tr', 'row-id', '123');
 */
async function assertDataAttribute(
  page,
  selector,
  dataAttrName,
  expectedValue,
) {
  const element = page.locator(selector);
  const attrValue = await element.getAttribute(`data-${dataAttrName}`);

  expect(attrValue).toBe(expectedValue);
}

/**
 * Assert list items loaded (for infinite scroll/lazy loading)
 * @param {Page} page
 * @param {string} itemSelector
 * @param {number} minCount - Minimum items to load
 *
 * USAGE:
 *   await assertListLoaded(page, '[data-testid="list-item"]', 10);
 */
async function assertListLoaded(page, itemSelector, minCount = 1) {
  const items = page.locator(itemSelector);
  const count = await items.count();

  expect(count).toBeGreaterThanOrEqual(minCount);
}

/**
 * Assert form is dirty (has unsaved changes)
 * @param {Page} page
 *
 * USAGE:
 *   await assertFormDirty(page);
 */
async function assertFormDirty(page) {
  // Assumes form has data-dirty attribute or ng-dirty class
  const dirtyForm = page.locator('form[data-dirty], form.ng-dirty').first();
  const isDirty = (await dirtyForm.count()) > 0;

  expect(isDirty).toBeTruthy();
}

/**
 * Assert table is sorted by column
 * @param {Page} page
 * @param {string} columnSelector - CSS selector for column
 * @param {string} direction - 'asc' or 'desc'
 *
 * USAGE:
 *   await assertTableSorted(page, 'th[data-col="name"]', 'asc');
 */
async function assertTableSorted(page, columnSelector, direction = 'asc') {
  const column = page.locator(columnSelector);
  const aria = await column.getAttribute('aria-sort');

  const expectedAria = direction === 'asc' ? 'ascending' : 'descending';
  expect(aria).toContain(expectedAria);
}

module.exports = {
  // Table assertions
  assertTableNotEmpty,
  assertTableContains,
  assertTableNotContains,
  assertTableSorted,

  // Form assertions
  assertFormFieldError,
  assertFormFieldValid,
  assertFormDirty,

  // Message assertions
  assertSuccessMessage,
  assertErrorMessage,

  // Element assertions
  assertElementText,
  assertElementTextContains,
  assertElementAttribute,
  assertElementCount,
  assertElementEnabled,
  assertElementDisabled,
  assertDataAttribute,

  // Modal assertions
  assertModalVisible,
  assertModalHidden,

  // Select/dropdown assertions
  assertSelectHasOption,

  // Navigation assertions
  assertUrlContains,

  // List/grid assertions
  assertListLoaded,
};
