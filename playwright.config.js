//playwright.config.js
const fs = require('fs');
const path = require('path');
const { defineConfig } = require('@playwright/test');

//Load env - fallback if dotenv is not used directly
require('dotenv').config();

const baseURL = process.env.BASE_URL || 'http://localhost:4200';
const headless = process.env.HEADLESS !== 'false';
const timeout = parseInt(process.env.TIMEOUT) || 60_000;
