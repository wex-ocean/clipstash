const { chromium } = require('@playwright/test');

(async () => {
  const extPath = require('path').resolve(__dirname, '../build/chrome-mv3-prod');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.goto('chrome://extensions');
  console.log('title', await page.title());
  await page.waitForTimeout(5000);
  console.log('body', await page.locator('body').innerText());
  await browser.close();
})();
