// pages/auth/login.page.js
const { timeout } = require('../../playwright.config');
const { BasePage } = require('../base.page');
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Define locators once (optional but clean)
    this.usernameInput = this.page.getByLabel('User ID', { exact: true });
    this.passwordInput = this.page.getByLabel('Password', { exact: true });
    this.loginButton = this.page.getByRole('button', {
      name: 'Log in',
      exact: true,
    });
    this.errorMessage = this.page.locator(
      '.alert-danger, .toast-error, #toast-container, [role="alert"]'
    );
  }

  async goto() {
    await this.navigate('/login'); // Adjust if root redirects to login
  }

  async login(username, password) {
    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    // Wait for redirect - e.g., dashboard title
    await this.page.waitForURL(/\/dashboard/, { timeout: 15_000 });

    //Optional: Verify no error
    await expect(this.errorMessage).toBeHidden({ timeout: 5000 });
  }
}

module.exports = { LoginPage };
