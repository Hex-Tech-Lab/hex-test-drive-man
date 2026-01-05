import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to https://getmytestdrive.com/en...');
  await page.goto('https://getmytestdrive.com/en', { waitUntil: 'networkidle' });
  
  console.log('Page loaded. Taking screenshot...');
  await page.screenshot({ path: '/vercel/sandbox/screenshot-home.png', fullPage: true });
  
  // Test 1: Check if Mercedes filter exists
  console.log('\n=== TEST 1: Mercedes Filter ===');
  const mercedesFilter = await page.locator('text=/Mercedes/i').first();
  const mercedesExists = await mercedesFilter.count() > 0;
  console.log(`Mercedes filter found: ${mercedesExists}`);
  
  // Test 2: Check search functionality
  console.log('\n=== TEST 2: Search Functionality ===');
  const searchInput = await page.locator('input[type="text"]').first();
  const searchExists = await searchInput.count() > 0;
  console.log(`Search input found: ${searchExists}`);
  
  if (searchExists) {
    await searchInput.fill('Toyota');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/vercel/sandbox/screenshot-search.png' });
    
    // Check for clear button
    const clearButton = await page.locator('button[aria-label*="clear"], button[title*="clear"], svg[data-testid*="Clear"]').first();
    const clearExists = await clearButton.count() > 0;
    console.log(`Clear button found: ${clearExists}`);
  }
  
  // Test 3: Check header elements
  console.log('\n=== TEST 3: Header Elements ===');
  const header = await page.locator('header').first();
  const headerExists = await header.count() > 0;
  console.log(`Header found: ${headerExists}`);
  
  // Check for "Test Drive Platform" text
  const platformText = await page.locator('text=/Test Drive Platform/i').first();
  const platformExists = await platformText.count() > 0;
  console.log(`"Test Drive Platform" text found: ${platformExists}`);
  
  // Test 4: Check language switcher
  console.log('\n=== TEST 4: Language Switcher ===');
  const langButton = await page.locator('button:has-text("AR"), button:has-text("EN")').first();
  const langExists = await langButton.count() > 0;
  console.log(`Language button found: ${langExists}`);
  
  // Test 5: Check for Haval logo
  console.log('\n=== TEST 5: Brand Logos ===');
  const havalLogo = await page.locator('img[alt*="Haval"], img[src*="haval"]').first();
  const havalExists = await havalLogo.count() > 0;
  console.log(`Haval logo found: ${havalExists}`);
  
  if (havalExists) {
    const havalSrc = await havalLogo.getAttribute('src');
    console.log(`Haval logo src: ${havalSrc}`);
  }
  
  // Test 6: Check for landing pages
  console.log('\n=== TEST 6: Landing Pages ===');
  const landingPages = ['/en/landing-v1', '/en/landing-v2', '/en/landing-versions'];
  
  for (const path of landingPages) {
    try {
      const response = await page.goto(`https://getmytestdrive.com${path}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      console.log(`${path}: ${response.status()}`);
    } catch (error) {
      console.log(`${path}: ERROR - ${error.message}`);
    }
  }
  
  // Test 7: Check cart drawer
  console.log('\n=== TEST 7: Cart Drawer ===');
  await page.goto('https://getmytestdrive.com/en', { waitUntil: 'networkidle' });
  const cartIcon = await page.locator('button:has(svg[data-testid="ShoppingCartIcon"])').first();
  const cartExists = await cartIcon.count() > 0;
  console.log(`Cart icon found: ${cartExists}`);
  
  if (cartExists) {
    await cartIcon.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/vercel/sandbox/screenshot-cart.png' });
    console.log('Cart drawer opened (screenshot saved)');
  }
  
  console.log('\n=== Tests Complete ===');
  await browser.close();
})();
