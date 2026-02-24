# ORDISS E2E Test Automation

Comprehensive end-to-end test framework for the ORDISS web application. The project uses Playwright and follows the Page Object Model (POM) to keep tests maintainable and resilient.

**This README** provides the full context any developer or AI agent needs to run, extend, and maintain the test suite.

**Quick links**

- [package.json](package.json)
- [playwright.config.js](playwright.config.js)
- [tests/setup/global-setup.js](tests/setup/global-setup.js)
- [pages/](pages)
- [tests/](tests)
- [utils/](utils)

**Prerequisites**

- Node.js 16+ and npm
- Network access to `BASE_URL` (configured via environment)

Environment variables (most used)

- `BASE_URL` — application URL (e.g. https://main.ordiss.dev.thinkventory.com)
- `VALID_USERNAME`, `VALID_PASSWORD` — credentials used in tests
- `SUPERADMIN_USERNAME`, `SUPERADMIN_PASSWORD` — used by global setup
- `TIMEOUT`, `RETRIES`, `WORKERS` — Playwright numeric overrides
- `HEADLESS` — set to `false` to run tests with visible browsers
- `SCREENSHOT_MODE`, `VIDEO_MODE`, `REPORT_PATH`

Install

```bash
npm install
```

Run examples

```bash
npm test                # headless
npm run test:headed    # run with visible browser
npm run test:ui        # Playwright interactive UI
npm run report         # open last HTML report
```

Project layout

- `pages/` — Page objects (POM). Core base behaviors in `pages/base.page.js`.
- `tests/` — Test specs. Global setup in `tests/setup/global-setup.js` (one-time auth caching).
- `utils/` — helpers (`csv-reader.js`, `form-helper.js`, etc.).
- `test-data/` — CSV and fixture files used by data-driven tests.
- `playwright.config.js` — configuration, reporters, `storageState`.

Core patterns & conventions

- Page objects: extend `pages/base.page.js` and export with `module.exports = ClassName`.
- Tests: use CommonJS `require()` and Playwright's `test`/`expect` APIs.
- Selectors: prefer `getByRole`, `getByLabel`, and semantic locators to reduce flakiness.
- Error handling: use `withErrorHandling()` in `pages/base.page.js` to auto-capture screenshots.

Global authentication

- `tests/setup/global-setup.js` logs in once and saves `playwright/.auth/user.json`. The file is reused for subsequent runs (refreshed if older than 1 hour).

How to add a feature test (developer / AI agent checklist)

1. Add test data to `test-data/` (CSV/JSON) if needed.
2. Add or update a `pages/<feature>/...` page object that extends `pages/base.page.js`.
3. Create a spec in `tests/<feature>/...` following existing patterns.
4. Run the spec locally, iterate until stable.
5. Commit and open a PR with test run evidence.

AI agent execution guidance

- Steps an agent should follow to implement tests or changes:
  - run `npm install` and `npm test` to establish baseline health
  - add page object and spec following POM & naming conventions
  - add test-data files when tests are data-driven
  - run focused tests and then the suite to confirm stability
  - provide a short changelog and test report with the PR

Troubleshooting

- To force re-authentication, remove `playwright/.auth/user.json` and re-run tests:

```bash
rm -f playwright/.auth/user.json
npm test
```

- If HTTPS certs block navigation, `ignoreHTTPSErrors: true` is set in config.

Security

- Never commit credentials. Use CI secret stores and environment variables.

Next actions I can take for you

- Archive old docs into `docs/ARCHIVE/` and preserve them (recommended).
- Run the full test suite and collect the HTML report.
- Add a CONTRIBUTING.md or developer guide extracted from archived docs.

Framework: Playwright 1.48.0
