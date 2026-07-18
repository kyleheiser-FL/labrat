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
        localStorage.setItem('labrat_compounds_initialized', 'true');
        localStorage.setItem('labrat_logs', JSON.stringify([{
          id: 'mobile-overflow-regression-log',
          compoundId: 'mobile-overflow-regression-compound',
          compoundName: 'CJC-1295 (No DAC) + Ipamorelin',
          date: '2026-07-17',
          time: '18:01',
          doseAmount: 250,
          doseUnit: 'mcg',
          calculatedQtyText: '10 syringe units',
        }]));
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

      if (route.name === 'planner') {
        const layout = await page.evaluate(() => {
          const stats = document.querySelector('#stats-view')?.getBoundingClientRect();
          const ledger = document.querySelector('#administration-ledger-card')?.getBoundingClientRect();
          const scroller = document.querySelector('#ledger-scrolling-container')?.getBoundingClientRect();
          return {
            viewportWidth: document.documentElement.clientWidth,
            stats: stats && { left: stats.left, right: stats.right, width: stats.width },
            ledger: ledger && { left: ledger.left, right: ledger.right, width: ledger.width },
            scroller: scroller && { left: scroller.left, right: scroller.right, width: scroller.width },
          };
        });

        for (const [name, rect] of Object.entries({ stats: layout.stats, ledger: layout.ledger, scroller: layout.scroller })) {
          if (!rect || rect.left < -0.5 || rect.right > layout.viewportWidth + 0.5) {
            throw new Error(`Mobile overflow in ${name} on ${preference}/${route.name}: ${JSON.stringify(layout)}`);
          }
        }
      }

      console.log(`${preference}/${route.name} -> ${result.theme}: ${result.bodyColor} on ${result.bodyBg}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
