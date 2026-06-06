const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const extPath = path.resolve(__dirname, '../build/chrome-mv3-prod');
  const userDataDir = path.resolve(__dirname, '../.playwright-user-data');
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless: false,
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
      '--no-sandbox'
    ]
  });

  const page = await context.newPage();
  await page.goto('chrome://extensions');
  await page.waitForTimeout(5000);
  const html = await page.content();
  console.log('contains Clipstash?', html.includes('Clipstash'));
  console.log('contains extension-id?', html.includes('chrome-extension://'));
  console.log('len', html.length);
  await page.waitForTimeout(10000);
  await context.close();
})();
