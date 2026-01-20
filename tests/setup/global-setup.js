// tests/setup/global-setup.js
/**
 * Global Setup - Runs once before all tests
 * Handles authentication and saves state for reuse
 *
 * ✅ Why this pattern?
 * - Reduces test execution time: Login once, reuse across all tests
 * - Caches auth for 1 hour, reducing server load
 * - Follows Playwright best practices
 * - Tests focus on feature testing, not auth flow
 */
require('dotenv').config();
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function globalSetup() {
  const authFile = 'playwright/.auth/user.json';

  // Check if auth file already exists and is recent (less than 1 hour old)
  if (fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile);
    const ageInMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;

    if (ageInMinutes < 60) {
      console.log(
        '✓ Using existing authentication (age: ' +
          Math.round(ageInMinutes) +
          ' minutes)',
      );
      return;
    }
  }

  console.log('🔐 Performing authentication...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    const baseUrl = process.env.BASE_URL || 'https://192.168.10.30:700';
    const username = process.env.SUPERADMIN_USERNAME || 'main.superadmin';
    const password = process.env.SUPERADMIN_PASSWORD || 'Ordiss@SA';

    // Navigate to landing page
    await page.goto(`${baseUrl}/landing`);
    await page.waitForLoadState('domcontentloaded');

    // Click Log In and select ORDISS Main
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Log in' })
      .click();
    await page.getByRole('menuitem', { name: 'ORDISS Main' }).click();
    await page.waitForURL('**/login', { timeout: 10000 });

    // Login
    await page.getByRole('textbox', { name: 'Enter user ID' }).fill(username);
    await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();

    // Wait for successful login
    await page.waitForURL((url) => !url.toString().includes('/login'), {
      timeout: 30000,
    });

    // Wait for page to settle after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Ensure directory exists
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Save authentication state
    await context.storageState({ path: authFile });
    console.log('✓ Authentication successful - state saved');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
