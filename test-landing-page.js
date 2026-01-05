import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to landing page...');
  await page.goto('http://localhost:3000/en/landing', { waitUntil: 'networkidle' });
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/tmp/landing-page-hero.png', fullPage: false });
  
  console.log('Scrolling to process section...');
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/landing-page-process.png', fullPage: false });
  
  console.log('Scrolling to testimonials...');
  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/landing-page-testimonials.png', fullPage: false });
  
  console.log('Taking full page screenshot...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/landing-page-full.png', fullPage: true });
  
  console.log('Testing Arabic version...');
  await page.goto('http://localhost:3000/ar/landing', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/landing-page-arabic.png', fullPage: false });
  
  console.log('Screenshots saved successfully!');
  await browser.close();
})();
