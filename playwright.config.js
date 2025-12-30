//playwright.config.js
const fs = require('fs');
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');
const { trace } = require('console');

//Load env - fallback if dotenv is not used directly
require('dotenv').config();

const baseURL = process.env.BASE_URL || 'http://localhost:4200';
const headless = process.env.HEADLESS !== 'false';
const timeout = parseInt(process.env.TIMEOUT) || 60_000;

// Ensure auth directory exists
const authDir = path.join(__dirname, 'playwright/.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

module.exports = {
  testDir: './tests',
  timeout: timeout,
  retries: parseInt(process.env.RETRIES) || 2,
  workers: process.env.WORKERS || '50%', //Smart parallelism
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFolder: 'reports/test-results.json' }],
    //Later: ['allure-playwright'] - We'll add Allure soon
  ],
  use: {
    baseURL: baseURL,
    headless: headless,
    viewport: { width: 1280, height: 720 },
    ignoreHttpsErrors: true, // Critical for internal SSL/self-signed
    screenshot: process.env.SCREENSHOT_MODE || 'only-on-failure',
    video: process.env.VIDEO_MODE || 'retain-on-failure',
    trace: 'on-first-retry', // Great for CI debugging

    // Reuse auth state from setup
    storageState: './playwright/.auth/user.json',
  },

  /* Projects: Setup runs once, others depend on it */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/, //Only run setup files
      use: {
        storageState: undefined, //No auth reuse for setup
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    // Add later: firefox, webkit, mobile, etc.
  ],

  // Folder where output (traces, videos, screenshots) will be saved
  outputDir: 'test-results/',
};

const { devices } = require('@playwright/test');
