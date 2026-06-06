import path from 'node:path'
import { expect, test, chromium } from '@playwright/test'

const extensionPath = path.resolve(__dirname, '../build/chrome-mv3-prod')
const userDataDir = path.resolve(__dirname, '../.playwright-profile')

test('Clipstash smoke test', async () => {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox'
    ]
  })

  try {
    const serviceWorker = await context.waitForEvent('serviceworker', { timeout: 30000 })
    const extensionId = new URL(serviceWorker.url()).hostname
    const popupUrl = `chrome-extension://${extensionId}/popup.html`

    const page = await context.newPage()

    await page.goto('https://example.com', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      const textarea = document.createElement('textarea')
      textarea.value = 'Clipstash smoke test copied text'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
    })

    const popup = await context.newPage()
    await popup.goto(popupUrl, { waitUntil: 'domcontentloaded' })

    await expect(popup.getByText('Clipstash smoke test copied text')).toBeVisible({ timeout: 30000 })

    await popup.getByPlaceholder('Search clipboard history...').fill('smoke test')
    await expect(popup.getByText('Clipstash smoke test copied text')).toBeVisible()

    await popup.getByRole('button', { name: /copy again/i }).click()
    await expect(popup.getByText('Copied to clipboard')).toBeVisible({ timeout: 30000 })

    await popup.getByRole('button', { name: /pin/i }).click()
    await expect(popup.getByText('Pinned')).toBeVisible()

    await popup.getByRole('button', { name: /delete/i }).click()
    await expect(popup.getByText('No clipboard history yet. Copy any text to start.')).toBeVisible({ timeout: 30000 })
  } finally {
    await context.close()
  }
})
