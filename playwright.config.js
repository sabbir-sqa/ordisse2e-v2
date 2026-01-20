// playwright.config.js
require('dotenv').config();

module.exports = {
  testDir: './tests',
  timeout: parseInt(process.env.TIMEOUT) || 60000, // Default timeout for each test | can be overridden by TIMEOUT env variable
  retries: parseInt(process.env.RETRIES) || 0, // Reduced retries for faster feedback | set to 0 for debugging
  workers: parseInt(process.env.WORKERS) || 1, // Number of parallel workers for test execution | set to 1 for debugging

  // Global setup - runs once before all tests
  globalSetup: require.resolve('./tests/setup/global-setup.js'), // handles shared auth caching

  use: {
    baseURL: process.env.BASE_URL || 'https://192.168.10.30:700', // Default base URL
    headless: process.env.HEADLESS === 'false', // Run tests in headless mode based on env variable | default: false
    screenshot: process.env.SCREENSHOT_MODE || 'only-on-failure', // Capture screenshots on failure | 'on', 'off', 'only-on-failure'
    video: process.env.VIDEO_MODE || 'retain-on-failure', // Record videos on failure
    trace: 'on-first-retry', // Collect trace on first retry | 'retain-on-failure'
    ignoreHTTPSErrors: true, // Ignore HTTPS errors for self-signed certificates | useful for local testing
    // Use saved auth state for all tests
    storageState: 'playwright/.auth/user.json',
  },

  reporter: [
    ['html', { outputFolder: process.env.REPORT_PATH || 'reports/html' }],
    ['list'],
  ],

  outputDir: './reports/test-results',
};
