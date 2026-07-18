import puppeteer from 'puppeteer';

const baseUrl = process.env.LABRAT_SMOKE_URL || 'http://127.0.0.1:3000';
const preferences = ['system', 'clinical', 'clinical-light'];
const routes = [
  { name: 'dashboard', url: '/?tab=dashboard', selector: '#daily-dosing' },
  { name: 'planner', url: '/?tab=planner', selector: '#planner-main-container' },
  { name: 'shop', url: '/?tab=shop', selector: '#members-shop-page' },
  { name: 'settings', url: '/?tab=dashboard', selector: '#settings-hero', clickSelector: 'button[aria-label="Settings"]' },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  for (const preference of preferences) {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
      await page.evaluateOnNewDocument((selectedPreference) => {
        localStorage.setItem('labrat_theme_preference', selectedPreference);
        localStorage.setItem('labrat_ui_theme', selectedPreference === 'clinical-light' ? 'clinical-light' : 'clinical');
        localStorage.setItem('labrat_theme_selected', 'true');
        localStorage.setItem('labrat_in_app_branding', 'lr');
        localStorage.setItem('labrat_tracking_enabled', 'true');
        localStorage.setItem('labrat_experience_mode', 'expert');
        localStorage.setItem('labrat_experience_prompt_v', '3');
        localStorage.setItem('labrat_hide_shop', 'false');
      }, preference);

      await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      if (route.clickSelector) {
        await page.waitForSelector(route.clickSelector, { timeout: 15000 });
        await page.click(route.clickSelector);
      }
      await page.waitForSelector(route.selector, { timeout: 15000 });
      await new Promise((resolve) => setTimeout(resolve, 750));

      const result = await page.evaluate(() => {
        const body = getComputedStyle(document.body);
        const shell = document.querySelector('#labrat-app-shell');
        const shellStyle = shell ? getComputedStyle(shell) : null;
        return {
          preference: localStorage.getItem('labrat_theme_preference'),
          theme: document.documentElement.getAttribute('data-labrat-theme'),
          bodyColor: body.color,
          bodyBg: body.backgroundColor,
          shellBg: shellStyle?.backgroundColor || '',
          textLength: document.body.innerText.trim().length,
        };
      });

      if (result.preference !== preference) {
        throw new Error(`Expected preference ${preference}, got ${result.preference} on ${route.name}`);
      }
      if (result.theme !== 'clinical' && result.theme !== 'clinical-light') {
        throw new Error(`Expected resolved light/dark theme, got ${result.theme} on ${preference}/${route.name}`);
      }
      if (result.textLength < 50) {
        throw new Error(`Expected visible text on ${preference}/${route.name}`);
      }

      console.log(`${preference}/${route.name} -> ${result.theme}: ${result.bodyColor} on ${result.bodyBg}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
