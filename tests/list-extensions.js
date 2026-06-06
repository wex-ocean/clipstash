const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = await browser.newPage();
  await page.goto('chrome://extensions');
  await page.waitForTimeout(3000);
  console.log('title=', await page.title());
  console.log('body=', await page.locator('body').innerText());
  console.log('html=', (await page.content()).slice(0, 4000));
  await browser.close();
})();
