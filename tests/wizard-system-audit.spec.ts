import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Comprehensive system audit of the booking wizard flow
 * Tests entire flow from catalog → vehicle card → wizard → each step
 *
 * Purpose: Identify ALL regression points in the system
 * Date: 2026-01-12
 * Agent: BB
 */

// Screenshot helper
async function saveScreenshot(page: Page, name: string) {
  const screenshotsDir = path.join(__dirname, '../test-results/wizard-audit');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  await page.screenshot({
    path: path.join(screenshotsDir, `${name}.png`),
    fullPage: true
  });
}

// Network request logger
function setupNetworkLogging(page: Page, logFile: string) {
  const logs: any[] = [];

  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('/api/')) {
      logs.push({
        type: 'REQUEST',
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
      });
    }
  });

  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('/api/')) {
      logs.push({
        type: 'RESPONSE',
        timestamp: new Date().toISOString(),
        status: response.status(),
        url: response.url(),
      });
    }
  });

  page.on('console', msg => {
    logs.push({
      type: 'CONSOLE',
      timestamp: new Date().toISOString(),
      level: msg.type(),
      text: msg.text(),
    });
  });

  page.on('pageerror', error => {
    logs.push({
      type: 'ERROR',
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
    });
  });

  // Save logs at end of test
  test.afterEach(async () => {
    const logDir = path.join(__dirname, '../test-results/wizard-audit');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(logDir, logFile),
      JSON.stringify(logs, null, 2)
    );
  });
}

test.describe('Booking Wizard System Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('AUDIT 1: Catalog page loads and displays vehicles', async ({ page }) => {
    setupNetworkLogging(page, 'audit1-catalog-network.json');

    console.log('=== AUDIT 1: Catalog Page ===');

    // Navigate to Arabic catalog
    await page.goto('http://localhost:3000/ar/vehicles');
    await page.waitForLoadState('networkidle');

    await saveScreenshot(page, '01-catalog-loaded');

    // Check for vehicle cards
    const vehicleCards = await page.locator('[data-testid="vehicle-card"], .MuiCard-root').count();
    console.log(`Found ${vehicleCards} vehicle cards`);
    expect(vehicleCards).toBeGreaterThan(0);

    // Check for "Book Test Drive" buttons
    const bookButtons = await page.getByText(/احجز تجربة قيادة|Book Test Drive/i).count();
    console.log(`Found ${bookButtons} booking buttons`);
    expect(bookButtons).toBeGreaterThan(0);

    // Check for images
    const images = await page.locator('img').count();
    console.log(`Found ${images} images on catalog`);

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.complete || img.naturalHeight === 0).length;
    });
    console.log(`Broken images: ${brokenImages}`);

    console.log('✅ AUDIT 1 COMPLETE\n');
  });

  test('AUDIT 2: Click vehicle card and verify booking button URL', async ({ page }) => {
    setupNetworkLogging(page, 'audit2-card-click-network.json');

    console.log('=== AUDIT 2: Vehicle Card Click ===');

    await page.goto('http://localhost:3000/ar/vehicles');
    await page.waitForLoadState('networkidle');

    // Find first "Book Test Drive" button
    const firstBookButton = page.getByText(/احجز تجربة قيادة|Book Test Drive/i).first();

    // Get the href attribute before clicking
    const bookingLink = await firstBookButton.evaluate(el => {
      // Check if button is a Link component
      const link = el.closest('a');
      return link ? link.href : null;
    });

    console.log(`Booking button href: ${bookingLink}`);

    // Verify URL format
    if (bookingLink) {
      expect(bookingLink).toMatch(/\/bookings\/new\?vehicleId=/);

      // Extract vehicleId
      const url = new URL(bookingLink);
      const vehicleId = url.searchParams.get('vehicleId');
      console.log(`Vehicle ID: ${vehicleId}`);

      // Verify UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(vehicleId).toMatch(uuidRegex);
    }

    await saveScreenshot(page, '02-before-booking-click');

    console.log('✅ AUDIT 2 COMPLETE\n');
  });

  test('AUDIT 3: Navigate to wizard and verify vehicle loads', async ({ page }) => {
    setupNetworkLogging(page, 'audit3-wizard-load-network.json');

    console.log('=== AUDIT 3: Wizard Navigation ===');

    await page.goto('http://localhost:3000/ar/vehicles');
    await page.waitForLoadState('networkidle');

    // Click first booking button
    const firstBookButton = page.getByText(/احجز تجربة قيادة|Book Test Drive/i).first();
    await firstBookButton.click();

    // Wait for navigation
    await page.waitForURL(/\/bookings\/new\?vehicleId=/);
    const currentUrl = page.url();
    console.log(`Navigated to: ${currentUrl}`);

    await saveScreenshot(page, '03-wizard-loaded');

    // Wait for wizard to load
    await page.waitForTimeout(2000);

    // Check for error messages
    const errorMessages = await page.locator('[class*="MuiAlert-root"], [role="alert"]').allTextContents();
    if (errorMessages.length > 0) {
      console.log('⚠️  ERROR MESSAGES FOUND:');
      errorMessages.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));
    } else {
      console.log('✓ No error messages found');
    }

    // Check for "No vehicle found" error
    const noVehicleError = await page.getByText(/No vehicle|vehicle not found/i).count();
    if (noVehicleError > 0) {
      console.log('❌ "No vehicle found" error DETECTED');
      expect(noVehicleError).toBe(0);
    } else {
      console.log('✓ No "No vehicle found" error');
    }

    // Check for vehicle display card
    const vehicleCard = await page.locator('.MuiCard-root').first();
    const hasVehicleCard = await vehicleCard.count() > 0;
    console.log(`Vehicle card present: ${hasVehicleCard}`);

    if (hasVehicleCard) {
      const vehicleText = await vehicleCard.textContent();
      console.log(`Vehicle card text: ${vehicleText?.substring(0, 100)}...`);
    }

    // Check for date/time/venue fields
    const dateField = await page.locator('input[type="date"]').count();
    const timeField = await page.locator('[role="combobox"], select, input[label*="Time"]').count();
    const venueField = await page.locator('[role="combobox"], select, input[label*="Venue"]').count();

    console.log(`Form fields - Date: ${dateField}, Time: ${timeField}, Venue: ${venueField}`);

    // Check for stepper
    const stepper = await page.locator('.MuiStepper-root').count();
    console.log(`Stepper present: ${stepper > 0}`);

    if (stepper > 0) {
      const steps = await page.locator('.MuiStep-root').count();
      console.log(`Number of steps: ${steps}`);
    }

    await saveScreenshot(page, '03-wizard-detailed');

    console.log('✅ AUDIT 3 COMPLETE\n');
  });

  test('AUDIT 4: Check Supabase query for vehicle data', async ({ page }) => {
    const networkLogs: any[] = [];

    console.log('=== AUDIT 4: Supabase Query Analysis ===');

    // Capture Supabase requests
    page.on('request', request => {
      if (request.url().includes('supabase.co')) {
        networkLogs.push({
          type: 'REQUEST',
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
        });
      }
    });

    page.on('response', async response => {
      if (response.url().includes('supabase.co')) {
        const body = await response.text().catch(() => '(binary data)');
        networkLogs.push({
          type: 'RESPONSE',
          status: response.status(),
          statusText: response.statusText(),
          url: response.url(),
          body: body.substring(0, 500),
        });
      }
    });

    await page.goto('http://localhost:3000/ar/vehicles');
    await page.waitForLoadState('networkidle');

    const firstBookButton = page.getByText(/احجز تجربة قيادة|Book Test Drive/i).first();
    await firstBookButton.click();

    await page.waitForURL(/\/bookings\/new\?vehicleId=/);
    await page.waitForTimeout(3000);

    // Extract vehicleId from URL
    const url = new URL(page.url());
    const vehicleId = url.searchParams.get('vehicleId');
    console.log(`Vehicle ID from URL: ${vehicleId}`);

    // Find Supabase queries for this vehicle
    const vehicleQueries = networkLogs.filter(log =>
      log.url && log.url.includes('vehicle_trims')
    );

    console.log(`\nFound ${vehicleQueries.length} Supabase vehicle_trims queries:`);
    vehicleQueries.forEach((query, i) => {
      console.log(`\n  Query ${i + 1}:`);
      console.log(`    Method: ${query.method}`);
      console.log(`    URL: ${query.url}`);
      if (query.status) {
        console.log(`    Status: ${query.status} ${query.statusText}`);
        console.log(`    Response preview: ${query.body?.substring(0, 200)}...`);
      }
    });

    // Save full network logs
    const logDir = path.join(__dirname, '../test-results/wizard-audit');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(logDir, 'audit4-supabase-network.json'),
      JSON.stringify(networkLogs, null, 2)
    );

    console.log('\n✅ AUDIT 4 COMPLETE\n');
  });

  test('AUDIT 5: Test wizard step progression', async ({ page }) => {
    setupNetworkLogging(page, 'audit5-wizard-steps-network.json');

    console.log('=== AUDIT 5: Wizard Step Progression ===');

    await page.goto('http://localhost:3000/ar/vehicles');
    await page.waitForLoadState('networkidle');

    const firstBookButton = page.getByText(/احجز تجربة قيادة|Book Test Drive/i).first();
    await firstBookButton.click();

    await page.waitForURL(/\/bookings\/new\?vehicleId=/);
    await page.waitForTimeout(2000);

    await saveScreenshot(page, '05-step1-initial');

    // Check if vehicle loaded
    const hasError = await page.getByText(/No vehicle|vehicle not found/i).count() > 0;
    if (hasError) {
      console.log('❌ Cannot proceed - vehicle not loaded');
      await saveScreenshot(page, '05-step1-error');
      return;
    }

    // Fill Step 1 fields
    console.log('Filling Step 1 fields...');

    const dateField = page.locator('input[type="date"]').first();
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const dateValue = today.toISOString().split('T')[0];
    await dateField.fill(dateValue);
    console.log(`  ✓ Date filled: ${dateValue}`);

    // Try to find time field
    const timeFields = await page.locator('input, select').all();
    console.log(`  Found ${timeFields.length} input/select fields`);

    for (const field of timeFields) {
      const label = await field.evaluate(el => {
        const parent = el.closest('.MuiFormControl-root');
        const labelEl = parent?.querySelector('label');
        return labelEl?.textContent || '';
      });
      console.log(`  Field label: "${label}"`);
    }

    await saveScreenshot(page, '05-step1-filled');

    // Check Next button state
    const nextButton = page.getByRole('button', { name: /Next|التالي/i });
    const isDisabled = await nextButton.isDisabled();
    console.log(`Next button disabled: ${isDisabled}`);

    if (!isDisabled) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      await saveScreenshot(page, '05-step2-loaded');
      console.log('✓ Progressed to Step 2');
    } else {
      console.log('⚠️  Next button still disabled after filling fields');
    }

    console.log('✅ AUDIT 5 COMPLETE\n');
  });

  test('AUDIT 6: Check localStorage state', async ({ page }) => {
    console.log('=== AUDIT 6: LocalStorage State ===');

    await page.goto('http://localhost:3000/ar/vehicles');
    await page.waitForLoadState('networkidle');

    const firstBookButton = page.getByText(/احجز تجربة قيادة|Book Test Drive/i).first();
    await firstBookButton.click();

    await page.waitForURL(/\/bookings\/new\?vehicleId=/);
    await page.waitForTimeout(2000);

    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      const data: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || '{}');
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      return data;
    });

    console.log('\nLocalStorage contents:');
    Object.keys(localStorageData).forEach(key => {
      console.log(`\n  ${key}:`);
      console.log(`    ${JSON.stringify(localStorageData[key], null, 2)}`);
    });

    // Check Zustand booking wizard store
    const wizardStore = localStorageData['booking-wizard-storage'];
    if (wizardStore) {
      console.log('\n✓ Booking wizard store found:');
      console.log(`    Step: ${wizardStore.state?.step}`);
      console.log(`    Vehicle ID: ${wizardStore.state?.vehicleId}`);
    } else {
      console.log('\n⚠️  Booking wizard store NOT found in localStorage');
    }

    // Save to file
    const logDir = path.join(__dirname, '../test-results/wizard-audit');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(logDir, 'audit6-localstorage.json'),
      JSON.stringify(localStorageData, null, 2)
    );

    console.log('✅ AUDIT 6 COMPLETE\n');
  });
});
