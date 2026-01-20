// utils/logger.js
/**
 * Logger Utility
 *
 * 📚 PURPOSE:
 * Provides structured logging for debugging test execution.
 * Helps track test flow and troubleshoot failures.
 *
 * 🎯 WHEN TO USE:
 * - Log important test steps
 * - Debug page object methods
 * - Track user interactions
 * - Record API calls/responses
 *
 * 💡 EXAMPLE:
 * const logger = require('../utils/logger');
 * logger.info('Creating new unit');
 * logger.debug('Clicked create button');
 * logger.error('Form validation failed', error);
 *
 * NEW MEMBERS:
 * - Use appropriate log level for each situation
 * - Logs appear in test output
 * - Helpful for CI/CD pipeline debugging
 */

class Logger {
  /**
   * Log levels: DEBUG < INFO < WARN < ERROR
   * Filter: Only show logs at current level and above
   */
  static LEVELS = {
    DEBUG: { level: 0, color: '\x1b[36m', name: 'DEBUG' }, // Cyan
    INFO: { level: 1, color: '\x1b[32m', name: 'INFO' }, // Green
    WARN: { level: 2, color: '\x1b[33m', name: 'WARN' }, // Yellow
    ERROR: { level: 3, color: '\x1b[31m', name: 'ERROR' }, // Red
  };

  constructor(testName = 'Test', minLevel = 'DEBUG') {
    this.testName = testName;
    this.minLevel = Logger.LEVELS[minLevel];
    this.startTime = Date.now();
  }

  /**
   * Get elapsed time since logger creation
   * @returns {string} Formatted time (e.g., "2.5s")
   */
  getElapsedTime() {
    const elapsed = Date.now() - this.startTime;
    return `${(elapsed / 1000).toFixed(1)}s`;
  }

  /**
   * Format log message
   * @private
   */
  format(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const elapsed = this.getElapsedTime();
    const reset = '\x1b[0m';

    let output = `${level.color}[${level.name}]${reset} `;
    output += `[${elapsed}] `;
    output += `[${this.testName}] `;
    output += `${message}`;

    if (data) {
      output += `\n     Data: ${this.formatData(data)}`;
    }

    return output;
  }

  /**
   * Format data for logging
   * @private
   */
  formatData(data) {
    if (typeof data === 'string') {
      return data;
    }

    if (data instanceof Error) {
      return `${data.name}: ${data.message}`;
    }

    if (typeof data === 'object') {
      try {
        return JSON.stringify(data, null, 2).substring(0, 200);
      } catch {
        return String(data);
      }
    }

    return String(data);
  }

  /**
   * Check if should log at this level
   * @private
   */
  shouldLog(level) {
    return level.level >= this.minLevel.level;
  }

  // ============================================
  // Logging Methods
  // ============================================

  /**
   * Debug level (least important)
   * Use for detailed diagnostic info
   *
   * USAGE:
   *   logger.debug('Element found at selector');
   *   logger.debug('Locator', { selector: '[name="email"]', visible: true });
   */
  debug(message, data = null) {
    if (!this.shouldLog(Logger.LEVELS.DEBUG)) return;

    const formatted = this.format(Logger.LEVELS.DEBUG, message, data);
    console.log(formatted);
  }

  /**
   * Info level (normal importance)
   * Use for important test steps
   *
   * USAGE:
   *   logger.info('Navigated to unit list page');
   *   logger.info('Filled form fields');
   *   logger.info('Submitted form successfully');
   */
  info(message, data = null) {
    if (!this.shouldLog(Logger.LEVELS.INFO)) return;

    const formatted = this.format(Logger.LEVELS.INFO, message, data);
    console.log(formatted);
  }

  /**
   * Warn level (warning)
   * Use for unexpected but recoverable situations
   *
   * USAGE:
   *   logger.warn('Element not found, retrying');
   *   logger.warn('Slow response from server');
   *   logger.warn('Timeout waiting for element');
   */
  warn(message, data = null) {
    if (!this.shouldLog(Logger.LEVELS.WARN)) return;

    const formatted = this.format(Logger.LEVELS.WARN, message, data);
    console.warn(formatted);
  }

  /**
   * Error level (most important)
   * Use for failures and exceptions
   *
   * USAGE:
   *   logger.error('Form validation failed', validationError);
   *   logger.error('Test failed', error);
   *   logger.error('Page not accessible', { status: 404 });
   */
  error(message, data = null) {
    if (!this.shouldLog(Logger.LEVELS.ERROR)) return;

    const formatted = this.format(Logger.LEVELS.ERROR, message, data);
    console.error(formatted);
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Log test step (formatted for clarity)
   *
   * USAGE:
   *   logger.step('1. Navigate to units page');
   *   logger.step('2. Search for engineering units');
   *   logger.step('3. Verify search results');
   */
  step(stepName) {
    this.info(`\n📍 ${stepName}`);
  }

  /**
   * Log action taken
   *
   * USAGE:
   *   logger.action('Click', 'Create Unit button');
   *   logger.action('Fill', 'Name field with "Engineering"');
   *   logger.action('Select', 'Category dropdown as "Army"');
   */
  action(action, description) {
    this.info(`✅ ${action}: ${description}`);
  }

  /**
   * Log assertion/verification
   *
   * USAGE:
   *   logger.assert('Unit found in list');
   *   logger.assert('Error message displayed');
   *   logger.assert('5 rows returned');
   */
  assert(assertion) {
    this.info(`🔍 Assert: ${assertion}`);
  }

  /**
   * Log test result
   *
   * USAGE:
   *   logger.passed('Test completed successfully');
   *   logger.failed('Test failed due to timeout');
   */
  passed(message = 'Test passed') {
    this.info(`✨ ${message}`);
  }

  failed(message = 'Test failed') {
    this.error(`❌ ${message}`);
  }

  /**
   * Log performance measurement
   *
   * USAGE:
   *   logger.performance('Page load', 500); // 500ms
   *   logger.performance('Search query', 200);
   */
  performance(operation, durationMs) {
    if (durationMs > 1000) {
      // Slow - use warn
      this.warn(`⏱️  ${operation}: ${durationMs}ms (slow)`);
    } else {
      // Normal - use info
      this.info(`⏱️  ${operation}: ${durationMs}ms`);
    }
  }

  /**
   * Log data received from API/page
   *
   * USAGE:
   *   logger.data('Unit list', units);
   *   logger.data('Form values', { name: 'Engineering', category: 'Army' });
   */
  data(label, value) {
    this.debug(`📊 ${label}:`, value);
  }

  /**
   * Create section separator in logs
   *
   * USAGE:
   *   logger.section('FORM VALIDATION TESTS');
   */
  section(title) {
    const line = '═'.repeat(50);
    console.log(`\n${line}`);
    console.log(`  ${title}`);
    console.log(`${line}\n`);
  }

  /**
   * Clear logs / reset timer
   */
  reset(newTestName = null) {
    if (newTestName) {
      this.testName = newTestName;
    }
    this.startTime = Date.now();
  }
}

module.exports = Logger;
