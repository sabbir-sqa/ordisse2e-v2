// pages/base.page.js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  // Common navigation
  async navigate(path = '') {
    await this.page.goto(path);
    // Optional: Wait for main content or loader to disappear
    await this.page.waitForLoadState('networkidle');
  }

  // Common helpers
  async clickButton(text) {
    await this.page.getByRole('button', { name: text, exact: true }).click();
  }

  // Form interactions
  async fillField(label, value) {
    // Prefer getBylabel -> accessibility + stability
    await this.page.getByLabel(label, { exact: true }).fill(value);
  }

  // Select dropdown option by visible text
  async selectOption(label, optionText) {
    const select = this.page.getByLabel(label, { exact: true });
    await select.selectOption({ label: optionText });
  }

  // Assertions
  async expectToBeVisible(text) {
    await this.page.getByText(text, { exact: true }).toBeVisible();
  }

  // Wait for success toast notification
  async waitForSuccessToast(timeout = 5000) {
    // Adjust selector based on ORDISS toast style
    const toast = this.page.locator(
      '.toast-success, .alert-success, .toast-container, [role="alert"]:hasText("success")'
    );
    await expect(toast).toBeVisible({ timeout });
    await toast.waitFor({ state: hidden, timeout: timeout + 2000 }); //Wait fade out
  }
}

module.exports = { BasePage };
