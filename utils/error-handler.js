// utils/error-handler.js
/**
 * Error Handler Utility
 *
 * 📚 PURPOSE:
 * Provides error handling, recovery, and diagnostic capabilities.
 *
 * 🎯 FEATURES:
 * - Automatic screenshot/video capture on error
 * - Detailed error messages with context
 * - Error recovery strategies
 * - Debug information collection
 */

const Logger = require('./logger');
const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor(page, testName = 'Test') {
    this.page = page;
    this.logger = new Logger(testName);
    this.screenshotDir = 'test-results/screenshots';
    this.logsDir = 'test-results/logs';
    this.ensureDirectories();
  }

  /**
   * Ensure output directories exist
   * @private
   */
  ensureDirectories() {
    [this.screenshotDir, this.logsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate unique timestamp for files
   * @private
   */
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Capture screenshot for debugging
   * @param {string} name - Screenshot name/description
   * @returns {Promise<string>} Path to saved screenshot
   *
   * USAGE:
   *   const path = await errorHandler.captureScreenshot('form-validation-error');
   */
  async captureScreenshot(name) {
    try {
      const filename = `${name}-${this.getTimestamp()}.png`;
      const filepath = path.join(this.screenshotDir, filename);

      await this.page.screenshot({ path: filepath, fullPage: true });
      this.logger.info(`📸 Screenshot saved: ${filepath}`);

      return filepath;
    } catch (error) {
      this.logger.error('Failed to capture screenshot', error);
      return null;
    }
  }

  /**
   * Collect page diagnostics for debugging
   * @returns {Promise<object>} Diagnostic information
   *
   * Collects:
   * - Current URL
   * - Page title
   * - Console logs
   * - Network errors
   * - DOM content snippet
   */
  async collectDiagnostics() {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        url: this.page.url(),
        title: await this.page.title(),
        readyState: await this.page.evaluate(() => document.readyState),
      };

      // Get page heading/main content
      const heading = await this.page.evaluate(() => {
        return document.querySelector('h1, h2, [role="heading"]')?.textContent;
      });
      diagnostics.pageHeading = heading;

      // Get any error messages visible
      const errors = await this.page.evaluate(() => {
        const errorElements = document.querySelectorAll(
          '[role="alert"], .error, .mat-error',
        );
        return Array.from(errorElements)
          .map((el) => el.textContent)
          .filter(Boolean);
      });
      diagnostics.visibleErrors = errors;

      return diagnostics;
    } catch (error) {
      this.logger.error('Failed to collect diagnostics', error);
      return {};
    }
  }

  /**
   * Log comprehensive error with context
   * @param {string} actionDescription - What was being attempted
   * @param {Error} error - The error that occurred
   * @param {object} context - Additional context info
   *
   * USAGE:
   *   try {
   *     await formPage.submit();
   *   } catch (error) {
   *     await errorHandler.logError('Submit form', error, {
   *       formData: { name: 'Test' }
   *     });
   *     throw error;
   *   }
   */
  async logError(actionDescription, error, context = {}) {
    this.logger.error(`Failed: ${actionDescription}`, error);

    // Capture screenshot
    const screenshotPath = await this.captureScreenshot(
      actionDescription.replace(/\s+/g, '-').toLowerCase(),
    );

    // Collect diagnostics
    const diagnostics = await this.collectDiagnostics();

    // Log context
    if (Object.keys(context).length > 0) {
      this.logger.debug('Error context:', context);
    }

    // Log diagnostics
    this.logger.debug('Page diagnostics:', diagnostics);

    // Create error report
    const report = {
      action: actionDescription,
      error: {
        message: error.message,
        stack: error.stack,
      },
      context,
      diagnostics,
      screenshot: screenshotPath,
      timestamp: new Date().toISOString(),
    };

    // Save error report
    this.saveErrorReport(report);

    return report;
  }

  /**
   * Save detailed error report to file
   * @private
   */
  saveErrorReport(report) {
    try {
      const filename = `error-${this.getTimestamp()}.json`;
      const filepath = path.join(this.logsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      this.logger.info(`📋 Error report saved: ${filepath}`);
    } catch (error) {
      this.logger.error('Failed to save error report', error);
    }
  }

  /**
   * Handle element not found error with retry
   * @param {string} selector - Element selector
   * @param {number} maxRetries - Max retry attempts
   * @param {function} action - Function to execute
   *
   * USAGE:
   *   await errorHandler.handleNotFound(
   *     '[name="submit"]',
   *     3,
   *     async () => await page.click('[name="submit"]')
   *   );
   */
  async handleNotFound(selector, maxRetries = 3, action) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${maxRetries}`);
        return await action();
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(
            `Element not found after ${maxRetries} retries: ${selector}`,
            error,
          );
          throw error;
        }

        this.logger.warn(`Retry ${attempt}/${maxRetries}: ${error.message}`);
        await this.page.waitForTimeout(300 * attempt); // Exponential backoff
      }
    }
  }

  /**
   * Handle timeout error with alternative strategy
   * @param {function} primaryAction - First attempt
   * @param {function} fallbackAction - Fallback if timeout
   *
   * USAGE:
   *   await errorHandler.handleTimeout(
   *     async () => await page.click('[name="button"]'),
   *     async () => await page.press('Enter')
   *   );
   */
  async handleTimeout(primaryAction, fallbackAction) {
    try {
      return await primaryAction();
    } catch (error) {
      if (error.message.includes('timeout')) {
        this.logger.warn('Timeout detected, trying fallback strategy');
        return await fallbackAction();
      }
      throw error;
    }
  }

  /**
   * Handle network error with retry
   * @param {function} action - Async action that may fail due to network
   * @param {number} maxRetries - Max retry attempts
   * @param {number} delay - Delay between retries (ms)
   *
   * USAGE:
   *   const result = await errorHandler.handleNetworkError(
   *     async () => await formPage.submit(),
   *     3,
   *     500
   *   );
   */
  async handleNetworkError(action, maxRetries = 3, delay = 500) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Network attempt ${attempt}/${maxRetries}`);
        return await action();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          this.logger.error(
            `Network operation failed after ${maxRetries} attempts`,
          );
          throw error;
        }

        this.logger.warn(
          `Network error on attempt ${attempt}, retrying in ${delay}ms...`,
        );
        await this.page.waitForTimeout(delay);
      }
    }

    throw lastError;
  }

  /**
   * Wait for error message to appear
   * @param {string} errorText - Expected error message
   * @param {number} timeout - Max wait time
   *
   * USAGE:
   *   await errorHandler.waitForErrorMessage('Email already exists', 5000);
   */
  async waitForErrorMessage(errorText, timeout = 5000) {
    const errorLocator = this.page.locator(
      '[role="alert"], .error-message, .mat-error',
    );

    try {
      await errorLocator.waitFor({ state: 'visible', timeout });
      const message = await errorLocator.textContent();

      if (message?.includes(errorText)) {
        this.logger.info(`✓ Expected error found: ${errorText}`);
        return message;
      } else {
        throw new Error(
          `Error message found but text doesn't match. Got: ${message}`,
        );
      }
    } catch (error) {
      await this.captureScreenshot('error-message-not-found');
      throw new Error(
        `Expected error message not found: "${errorText}"\n` +
          `Timeout: ${timeout}ms`,
      );
    }
  }

  /**
   * Verify page accessibility after error
   * Checks for main content, navigation, etc.
   *
   * @returns {Promise<boolean>} True if page accessible
   */
  async verifyPageAccessible() {
    try {
      // Check page responded
      const title = await this.page.title();
      if (!title) {
        this.logger.warn('Page title is empty');
        return false;
      }

      // Check no global error
      const html = await this.page.evaluate(
        () => document.documentElement.innerHTML,
      );
      if (html.includes('error') && html.includes('500')) {
        this.logger.error('Found server error on page');
        return false;
      }

      this.logger.info('Page is accessible');
      return true;
    } catch (error) {
      this.logger.error('Failed to verify page accessibility', error);
      return false;
    }
  }

  /**
   * Create error summary for test report
   * @param {Error} testError - Error from test
   * @returns {object} Summary object
   */
  createSummary(testError) {
    return {
      passed: false,
      error: testError.message,
      stack: testError.stack,
      timestamp: new Date().toISOString(),
      duration: this.getDuration(),
    };
  }

  /**
   * Get elapsed time since handler creation
   */
  getDuration() {
    // Uses logger's elapsed time tracking
    return this.logger.getElapsedTime();
  }
}

module.exports = ErrorHandler;
