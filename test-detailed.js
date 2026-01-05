import { chromium } from 'playwright';

(async () => {
  console.log('Starting detailed browser tests...\n');
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Navigate to home page
  await page.goto('https://getmytestdrive.com/en', { waitUntil: 'networkidle' });
  
  console.log('=== PRIORITY 1: Mercedes Filter ===');
  // Check if Mercedes appears in brand filters
  const mercedesInFilter = await page.locator('text=/Mercedes-Benz/i').first();
  const mercedesCount = await mercedesInFilter.count();
  console.log(`✓ Mercedes-Benz in filters: ${mercedesCount > 0 ? 'FOUND' : 'MISSING'}`);
  
  // Click Mercedes filter if exists
  if (mercedesCount > 0) {
    await mercedesInFilter.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/vercel/sandbox/screenshot-mercedes-filter.png' });
    
    // Count vehicles displayed
    const vehicleCards = await page.locator('[data-testid*="vehicle"], .MuiCard-root').count();
    console.log(`  Vehicles displayed after filter: ${vehicleCards}`);
  }
  
  // Reset filters
  await page.goto('https://getmytestdrive.com/en', { waitUntil: 'networkidle' });
  
  console.log('\n=== PRIORITY 2: Search Features ===');
  
  // Find search input
  const searchInput = await page.locator('input[placeholder*="Search"], input[type="text"]').first();
  const searchExists = await searchInput.count() > 0;
  console.log(`✓ Search input: ${searchExists ? 'FOUND' : 'MISSING'}`);
  
  if (searchExists) {
    // Type in search
    await searchInput.fill('Corolla');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/vercel/sandbox/screenshot-search-filled.png' });
    
    // Check for autocomplete dropdown
    const autocomplete = await page.locator('[role="listbox"], .MuiAutocomplete-popper, [class*="autocomplete"]').first();
    const autocompleteExists = await autocomplete.count() > 0;
    console.log(`  Autocomplete dropdown: ${autocompleteExists ? 'FOUND' : 'MISSING'}`);
    
    // Check for clear button (multiple possible selectors)
    const clearSelectors = [
      'button[aria-label*="clear"]',
      'button[title*="Clear"]',
      'svg[data-testid="ClearIcon"]',
      'button:has(svg[data-testid="ClearIcon"])',
      '[class*="clearIndicator"]',
      'button[class*="MuiAutocomplete-clearIndicator"]'
    ];
    
    let clearFound = false;
    for (const selector of clearSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        clearFound = true;
        console.log(`  Clear button: FOUND (${selector})`);
        break;
      }
    }
    if (!clearFound) {
      console.log(`  Clear button: MISSING ❌`);
    }
  }
  
  console.log('\n=== PRIORITY 3: UX Issues ===');
  
  // Test 1: "Test Drive Platform" clickability
  const platformText = await page.locator('text=/Test Drive Platform/i').first();
  const platformExists = await platformText.count() > 0;
  console.log(`✓ "Test Drive Platform" text: ${platformExists ? 'FOUND' : 'MISSING'}`);
  
  if (platformExists) {
    const isClickable = await platformText.evaluate(el => {
      const parent = el.closest('a, button');
      return parent !== null;
    });
    console.log(`  Is clickable (wrapped in link): ${isClickable ? 'YES ✓' : 'NO ❌'}`);
    
    if (isClickable) {
      await platformText.click();
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      console.log(`  Clicked, current URL: ${currentUrl}`);
    }
  }
  
  // Test 2: Language switch behavior
  await page.goto('https://getmytestdrive.com/en', { waitUntil: 'networkidle' });
  console.log('\n  Testing language switch...');
  
  const langButton = await page.locator('button:has-text("AR"), button:has-text("ع")').first();
  const langExists = await langButton.count() > 0;
  console.log(`  Language button: ${langExists ? 'FOUND' : 'MISSING'}`);
  
  if (langExists) {
    const urlBefore = page.url();
    await langButton.click();
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    
    console.log(`  URL before: ${urlBefore}`);
    console.log(`  URL after: ${urlAfter}`);
    console.log(`  Language switched: ${urlBefore !== urlAfter ? 'YES' : 'NO (client-side only)'}`);
    
    await page.screenshot({ path: '/vercel/sandbox/screenshot-arabic.png' });
  }
  
  // Test 3: Haval logo 404 check
  await page.goto('https://getmytestdrive.com/en', { waitUntil: 'networkidle' });
  console.log('\n  Checking for broken images...');
  
  const images = await page.locator('img').all();
  let brokenImages = [];
  
  for (let i = 0; i < Math.min(images.length, 50); i++) {
    const img = images[i];
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt');
    
    if (src) {
      const isLoaded = await img.evaluate(el => el.complete && el.naturalHeight !== 0);
      if (!isLoaded) {
        brokenImages.push({ src, alt });
      }
    }
  }
  
  console.log(`  Total images checked: ${Math.min(images.length, 50)}`);
  console.log(`  Broken images: ${brokenImages.length}`);
  
  if (brokenImages.length > 0) {
    console.log('  Broken image details:');
    brokenImages.forEach(img => {
      console.log(`    - ${img.alt || 'No alt'}: ${img.src}`);
    });
  }
  
  console.log('\n=== PRIORITY 4: Landing Pages ===');
  const landingRoutes = [
    '/en/landing-v1',
    '/en/landing-v2', 
    '/en/landing-versions'
  ];
  
  for (const route of landingRoutes) {
    try {
      const response = await page.goto(`https://getmytestdrive.com${route}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });
      console.log(`  ${route}: ${response.status()} ${response.status() === 404 ? '❌ NOT FOUND' : '✓'}`);
    } catch (error) {
      console.log(`  ${route}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n=== ADDITIONAL: Cascading Filters Test ===');
  await page.goto('https://getmytestdrive.com/en', { waitUntil: 'networkidle' });
  
  // Select a brand
  const brandFilter = await page.locator('text=/Toyota/i').first();
  if (await brandFilter.count() > 0) {
    await brandFilter.click();
    await page.waitForTimeout(1500);
    
    // Check if other filters update
    const categoryFilters = await page.locator('[data-testid*="category"], text=/SUV|Sedan|Hatchback/i').count();
    console.log(`  Category filters available: ${categoryFilters}`);
    
    await page.screenshot({ path: '/vercel/sandbox/screenshot-cascading-filters.png' });
  }
  
  console.log('\n=== Tests Complete ===\n');
  await browser.close();
})();
