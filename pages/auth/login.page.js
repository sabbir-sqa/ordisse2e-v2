// pages/auth/login.page.js
const BasePage = require('../base.page');

/**
 * Login Page Object
 * Handles authentication flow with clean semantic locators
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // 🧩 Locators (semantic - resilient to UI changes)
    this.usernameInput = this.page.getByRole('textbox', {
      name: 'Enter user ID',
    });
    this.passwordInput = this.page.getByRole('textbox', {
      name: 'Enter password',
    });
    this.loginButton = this.page.getByRole('button', { name: 'Log in' });
    this.errorMessage = this.page.locator(
      '.alert-danger, .toast-error, #toast-container, [role="alert"]',
    );
    this.profileCard = this.page.locator('.profile-card');
  }

  // 🌐 Navigation
  async gotoLoginPage() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // 🔐 Login
  async login(username, password) {
    await this.gotoLoginPage();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    // Wait for redirect to dashboard
    // await this.page.waitForURL(/\/administrator/, { timeout: 15_000 });
    // await this.page.waitForLoadState('domcontentloaded');

    // Alternatively, wait for profile card to appear
    await this.profileCard.waitFor({ state: 'visible', timeout: 15_000 });
  }

  // 🧪 Verification
  async isLoggedIn() {
    return !this.page.url().includes('/login');
  }

  async validateLoginForm() {
    const hasUsernameField = await this.usernameInput.isVisible();
    const hasPasswordField = await this.passwordInput.isVisible();
    const hasLoginButton = await this.loginButton.isVisible();
    return hasUsernameField && hasPasswordField && hasLoginButton;
  }

  // ⚠️ Error Handling
  async getErrorMessage() {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 3000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  async expectError(expectedMessage) {
    const actualMessage = await this.getErrorMessage();
    if (!actualMessage || !actualMessage.includes(expectedMessage)) {
      throw new Error(
        `Expected error "${expectedMessage}" but got "${actualMessage}"`,
      );
    }
  }
}

module.exports = LoginPage;
