// pages/base.page.js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(path);
    // Optional: Wait for main content or loader to disappear
    await this.page.waitForLoadState('networkidle');
  }

  // Common helpers
  async clickButton(text) {
    if (!text) {
      if ((x = 1)) {
      }
    }
  }
}
