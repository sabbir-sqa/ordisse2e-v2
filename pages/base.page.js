// pages/base.page.js
/**
 * BasePage - Foundation for all page objects
 *
 * 📚 TEACHING NOTES FOR NEW MEMBERS:
 *
 * 1. WAIT STRATEGIES
 *    Why? Elements may not be immediately visible/ready
 *    When to use? Before interacting with any element
 *    Example: await this.waitForElement(selector) before clicking
 *
 * 2. SMART INTERACTIONS
 *    Why? Direct clicks/fills fail if element not ready
 *    Smart version: Waits first, then interacts, with retry logic
 *    Example: await this.clickButton(selector) handles timing issues
 *
 * 3. ASSERTION HELPERS
 *    Why? Common checks (text, count, values) should be reusable
 *    Example: Instead of page.locator().textContent() everywhere,
 *             use: const text = await this.getElementText(selector)
 *
 * 4. ERROR HANDLING
 *    Why? Better debugging when tests fail
 *    Provides: Automatic screenshots, clear error messages
 *    Example: Error message shows WHICH selector failed + screenshot taken
 */

class BasePage {
  constructor(page) {
    this.page = page;
    // Get baseURL from Playwright config via page context
    this.baseUrl = page.context()._options.baseURL || 'https://10.10.10.10:700';
    this.defaultTimeout = 10000; // 10 seconds
    this.shortTimeout = 3000; // 3 seconds
  }

  // ============================================
  // 1️⃣ WAIT STRATEGIES - Foundation for reliability
  // ============================================

  /**
   * Wait for element to be visible in DOM
   * @param {string|Locator} selector - CSS selector or Playwright Locator
   * @param {number} timeout - Max wait time in ms (default: 10s)
   * @throws Error if element not visible within timeout
   *
   * USAGE:
   *   await this.waitForElement('[name="username"]');
   *   await this.waitForElement(this.submitButton);
   */
  async waitForElement(selector, timeout = this.defaultTimeout) {
    try {
      const locator =
        typeof selector === 'string' ? this.page.locator(selector) : selector;

      await locator.waitFor({ state: 'visible', timeout });
    } catch (error) {
      throw new Error(
        `❌ Element not visible: "${selector}" after ${timeout}ms`,
      );
    }
  }

  /**
   * Wait for URL to change (navigation)
   * @param {string|RegExp|function} urlPattern - URL to expect
   * @param {number} timeout - Max wait time in ms
   *
   * USAGE:
   *   await this.waitForNavigation('/unit-types');
   *   await this.waitForNavigation((url) => url.includes('/dashboard'));
   */
  async waitForNavigation(urlPattern, timeout = this.defaultTimeout) {
    try {
      await this.page.waitForURL(urlPattern, { timeout });
    } catch (error) {
      throw new Error(
        `❌ Navigation failed: Expected "${urlPattern}", got "${this.page.url()}"`,
      );
    }
  }

  /**
   * Wait for page to load completely
   * Options: 'load', 'domcontentloaded', 'networkidle'
   *
   * USAGE:
   *   await this.waitForPageLoad('networkidle'); // Best for SPAs
   *   await this.waitForPageLoad('domcontentloaded'); // Faster
   */
  async waitForPageLoad(state = 'networkidle') {
    await this.page.waitForLoadState(state);
  }

  // ============================================
  // 2️⃣ SMART INTERACTIONS - Reliable user actions
  // ============================================

  /**
   * Smart fill: Waits for element, clears it, then fills with value
   * @param {string|Locator} selector
   * @param {string} value
   * @param {object} options - Additional options
   *
   * USAGE:
   *   await this.fillField('[name="username"]', 'admin', { delay: 100 });
   */
  async fillField(selector, value, options = {}) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector; // Locator instance if passed directly

    await this.waitForElement(locator);

    // Clear existing value first
    await locator.clear();

    // Fill with new value
    await locator.fill(value, { delay: options.delay || 0 });
  }

  /**
   * Smart click: Waits, scrolls into view, then clicks
   * Includes retry logic for flaky elements
   * @param {string|Locator} selector
   * @param {object} options - { retries: 3, delay: 100 }
   *
   * USAGE:
   *   await this.clickButton('[data-testid="submit"]');
   *   await this.clickButton(this.createButton, { retries: 5 });
   */
  async clickButton(selector, options = {}) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    const maxRetries = options.retries || 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.waitForElement(locator, this.shortTimeout);
        await locator.scrollIntoViewIfNeeded();

        // Wait a bit before clicking (helps with double-click issues)
        if (options.delay) {
          await this.page.waitForTimeout(options.delay);
        }

        await locator.click();
        return; // Success!
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          // Wait before retry
          await this.page.waitForTimeout(300);
        }
      }
    }

    throw new Error(
      `❌ Failed to click element after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Smart select: For dropdown/select elements
   * @param {string|Locator} selector
   * @param {string|object} option - Option value or { label: 'text' }
   *
   * USAGE:
   *   await this.selectFromDropdown('[name="category"]', 'Army');
   *   await this.selectFromDropdown(this.roleSelect, { label: 'Admin' });
   */
  async selectFromDropdown(selector, option) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    await this.waitForElement(locator);

    if (typeof option === 'string') {
      // Select by value
      await locator.selectOption(option);
    } else if (option.label) {
      // Select by visible text
      await locator.selectOption({ label: option.label });
    }
  }

  /**
   * Smart double-click (for edit scenarios)
   * @param {string|Locator} selector
   *
   * USAGE:
   *   await this.doubleClick('[data-role="editable-cell"]');
   */
  async doubleClick(selector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    await this.waitForElement(locator);
    await locator.scrollIntoViewIfNeeded();
    await locator.dblclick();
  }

  /**
   * Hover over element (for tooltips, menus)
   * @param {string|Locator} selector
   *
   * USAGE:
   *   await this.hoverElement('[data-testid="info-icon"]');
   */
  async hoverElement(selector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    await this.waitForElement(locator);
    await locator.hover();
  }

  /**
   * Press keyboard key
   * @param {string} key - 'Enter', 'Tab', 'Escape', etc.
   *
   * USAGE:
   *   await this.pressKey('Escape'); // Close modal
   *   await this.pressKey('Enter');  // Submit form
   */
  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  // ============================================
  // 3️⃣ ASSERTION HELPERS - Common checks
  // ============================================

  /**
   * Get element text content
   * @param {string|Locator} selector
   * @returns {Promise<string>} Text content
   *
   * USAGE:
   *   const title = await this.getElementText('h1');
   */
  async getElementText(selector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    await this.waitForElement(locator);
    return await locator.textContent();
  }

  /**
   * Get input/form field value
   * @param {string|Locator} selector
   * @returns {Promise<string>} Input value
   *
   * USAGE:
   *   const value = await this.getInputValue('[name="username"]');
   */
  async getInputValue(selector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    await this.waitForElement(locator);
    return await locator.inputValue();
  }

  /**
   * Count elements matching selector
   * @param {string|Locator} selector
   * @returns {Promise<number>} Element count
   *
   * USAGE:
   *   const rowCount = await this.getElementCount('tr[data-row]');
   */
  async getElementCount(selector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    return await locator.count();
  }

  /**
   * Check if element exists in DOM
   * @param {string|Locator} selector
   * @returns {Promise<boolean>}
   *
   * USAGE:
   *   if (await this.elementExists('[data-testid="error-message"]')) { }
   */
  async elementExists(selector) {
    const locator =
      typeof selector === 'string' ? this.page.locator(selector) : selector;

    try {
      return (await locator.count()) > 0;
    } catch {
      return false;
    }
  }

  // ============================================
  // 4️⃣ ERROR HANDLING & DEBUGGING
  // ============================================

  /**
   * Execute action with automatic error handling & screenshots
   * Catches errors, takes screenshot, then rethrows
   * @param {function} action - Async function to execute
   * @param {string} actionName - Description of action for error message
   *
   * USAGE:
   *   await this.withErrorHandling(
   *     async () => await this.fillField('[name="email"]', 'test@test.com'),
   *     'Fill email field'
   *   );
   */
  async withErrorHandling(action, actionName) {
    try {
      return await action();
    } catch (error) {
      // Take screenshot for debugging
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `test-results/failure-${timestamp}.png`;

      try {
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        console.error(`📸 Screenshot saved: ${screenshotPath}`);
      } catch (screenshotError) {
        console.error(`Failed to save screenshot: ${screenshotError.message}`);
      }

      throw new Error(
        `❌ Action failed: "${actionName}"\n` +
          `   Error: ${error.message}\n` +
          `   URL: ${this.page.url()}`,
      );
    }
  }

  /**
   * Take debug screenshot
   * @param {string} name - Screenshot name/description
   *
   * USAGE:
   *   await this.takeScreenshot('after-form-submit');
   *   // Creates: test-results/debug-after-form-submit.png
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `test-results/debug-${name}-${timestamp}.png`;
    await this.page.screenshot({ path, fullPage: true });
    console.log(`📸 Screenshot: ${path}`);
  }

  // ============================================
  // 5️⃣ LEGACY METHODS (Keep for backward compatibility)
  // ============================================

  async goto(url) {
    await this.page.goto(url);
  }

  async fill(selector, value) {
    // Backwards compatibility - use fillField() in new code
    await this.fillField(selector, value);
  }

  async click(selector) {
    // Backwards compatibility - use clickButton() in new code
    await this.clickButton(selector);
  }

  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async waitForLoad() {
    await this.waitForPageLoad('networkidle');
  }
}

module.exports = BasePage;
