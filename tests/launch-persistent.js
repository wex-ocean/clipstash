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
  console.log('title', await page.title());
  await page.waitForTimeout(5000);
  console.log('body', await page.locator('body').innerText());
  console.log('html', (await page.content()).slice(0, 5000));
  await page.waitForTimeout(10000);
  await context.close();
})();
