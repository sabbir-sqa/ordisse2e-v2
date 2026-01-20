# ORDISS E2E Test Automation

Modern Playwright automation framework for ORDISS application testing.

##  Quick Start

\\\ash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env: BASE_URL, credentials

# 3. Run
npm test                    # All tests (headless)
npm run test:headed        # With browser visible
npm run report             # View results
\\\

**Time**: 30-40 min first run | 5-10 min subsequent

##  Documentation

| Document | Content |
|----------|---------|
| [docs/SETUP.md](./docs/SETUP.md) | Complete setup & guide |
| [docs/REFERENCE.md](./docs/REFERENCE.md) | Commands & troubleshooting |
| [DOCS_ARCHIVE.md](./DOCS_ARCHIVE.md) | Archived detailed docs |

##  Project Structure

\\\
pages/                Page Objects (POM)
tests/                Test Specifications
utils/                Utility Functions
test-data/            Test Data
docs/                 Documentation
\\\

##  Key Features

 Page Object Model (POM)  
 Semantic Locators (resilient)  
 One-time Authentication (10-15x faster)  
 Smart Waits (not hard timeouts)  
 Environment Configuration  
 Error Handling & Screenshots  
 HTML Reporting  

##  Test Suite

| Test | Status |
|------|--------|
| Login |  Complete |
| Unit Type CRUD |  Complete |
| Others |  Placeholder |

##  Commands

\\\ash
npm test                    # Run all tests
npm run test:headed        # With browser
npm run test:debug         # With debugger
npm run test:ui            # Interactive UI
npm run report             # View report

# Environment-specific
npm run test:local         # Localhost
npm run test:dev           # Dev server
npm run test:staging       # Staging
\\\

##  Troubleshooting

**Connection timeout?**
\\\ash
ping 192.168.10.30
curl -k https://192.168.10.30:700
\\\

**Auth issues?**
\\\ash
rm playwright/.auth/user.json
npm test  # Will re-authenticate
\\\

**Slow tests?**
Edit \.env\: \WORKERS=8\

See [docs/REFERENCE.md](./docs/REFERENCE.md) for complete troubleshooting.

##  Learn More

- [Complete Setup Guide](./docs/SETUP.md)
- [Command Reference](./docs/REFERENCE.md)
- [Playwright Docs](https://playwright.dev)

---

**Framework**: Playwright 1.48.0 | **Status**:  Production Ready
