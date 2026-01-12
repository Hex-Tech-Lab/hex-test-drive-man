import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Comprehensive system audit of the booking wizard flow
 * Tests entire flow from catalog → vehicle card → wizard → each step
 *
 * Purpose: Identify ALL regression points in the system
 * Date: 2026-01-12
 * Agent: BB
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '../test-results/wizard-audit-v2');

test.describe('Booking Wizard System Audit V2', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('FULL SYSTEM AUDIT: Catalog → Wizard Flow', async ({ page }) => {
    const networkLogs: any[] = [];
    const consoleLogs: any[] = [];

    // Capture network activity
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('/api/')) {
        networkLogs.push({
          type: 'REQUEST',
          timestamp: new Date().toISOString(),
          method: request.method(),
          url: request.url(),
        });
      }
    });

    page.on('response', async response => {
      if (response.url().includes('supabase') || response.url().includes('/api/')) {
        let body = '(binary)';
        try {
          body = await response.text();
        } catch {}
        networkLogs.push({
          type: 'RESPONSE',
          timestamp: new Date().toISOString(),
          status: response.status(),
          url: response.url(),
          body: body.substring(0, 500),
        });
      }
    });

    page.on('console', msg => {
      consoleLogs.push({
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: msg.text(),
      });
    });

    page.on('pageerror', error => {
      consoleLogs.push({
        timestamp: new Date().toISOString(),
        type: 'ERROR',
        message: error.message,
        stack: error.stack,
      });
    });

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     COMPREHENSIVE BOOKING WIZARD SYSTEM AUDIT                 ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════════════════════════
    // STAGE 1: CATALOG PAGE
    // ═══════════════════════════════════════════════════════════════
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 1: CATALOG PAGE LOAD                                  │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, '01-catalog-loaded.png'), fullPage: true });

    const vehicleCards = await page.locator('.MuiCard-root').count();
    console.log(`✓ Vehicle cards found: ${vehicleCards}`);
    expect(vehicleCards).toBeGreaterThan(0);

    const bookButtons = await page.getByText(/احجز تجربة قيادة|Book Test Drive/i).count();
    console.log(`✓ Booking buttons found: ${bookButtons}`);
    expect(bookButtons).toBeGreaterThan(0);

    const images = await page.locator('img').count();
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => !img.complete || img.naturalHeight === 0).length;
    });
    console.log(`✓ Images: ${images} total, ${brokenImages} broken`);

    // ═══════════════════════════════════════════════════════════════
    // STAGE 2: VEHICLE CARD INSPECTION
    // ═══════════════════════════════════════════════════════════════
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 2: VEHICLE CARD INSPECTION                            │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    const firstCard = page.locator('.MuiCard-root').first();
    const firstBookButton = firstCard.getByText(/احجز تجربة قيادة|Book Test Drive/i);

    // Get the Link component wrapping the button
    const bookingHref = await firstBookButton.evaluate(el => {
      const link = el.closest('a') || el.querySelector('a');
      return link ? link.getAttribute('href') : null;
    });

    console.log(`✓ Booking link href: ${bookingHref}`);

    if (bookingHref) {
      expect(bookingHref).toMatch(/\/bookings\/new\?vehicleId=/);
      const url = new URL(bookingHref, 'http://localhost:3000');
      const vehicleId = url.searchParams.get('vehicleId');
      console.log(`✓ Vehicle ID: ${vehicleId}`);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(vehicleId).toMatch(uuidRegex);
      console.log(`✓ UUID format valid`);
    }

    await page.screenshot({ path: path.join(screenshotsDir, '02-before-click.png'), fullPage: true });

    // ═══════════════════════════════════════════════════════════════
    // STAGE 3: NAVIGATION TO WIZARD
    // ═══════════════════════════════════════════════════════════════
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 3: NAVIGATION TO WIZARD                                │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    // Click the button
    await firstBookButton.click();
    console.log('✓ Clicked booking button');

    // Wait for navigation
    await page.waitForURL(/\/bookings\/new\?vehicleId=/, { timeout: 10000 });
    const wizardUrl = page.url();
    console.log(`✓ Navigated to: ${wizardUrl}`);

    // Extract vehicleId from URL
    const url = new URL(wizardUrl);
    const vehicleIdParam = url.searchParams.get('vehicleId');
    console.log(`✓ vehicleId parameter: ${vehicleIdParam}`);

    await page.waitForTimeout(3000); // Wait for wizard to load
    await page.screenshot({ path: path.join(screenshotsDir, '03-wizard-loaded.png'), fullPage: true });

    // ═══════════════════════════════════════════════════════════════
    // STAGE 4: WIZARD PAGE ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 4: WIZARD PAGE ANALYSIS                                │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    // Check for errors
    const errorAlerts = await page.locator('[class*="MuiAlert-root"]').allTextContents();
    if (errorAlerts.length > 0) {
      console.log('⚠️  ERROR ALERTS FOUND:');
      errorAlerts.forEach((msg, i) => {
        console.log(`  ${i + 1}. ${msg}`);
      });
    } else {
      console.log('✓ No error alerts');
    }

    // Check for "No vehicle found" error
    const noVehicleError = await page.getByText(/No vehicle|vehicle not found/i).count();
    if (noVehicleError > 0) {
      console.log('❌ CRITICAL: "No vehicle found" error DETECTED');
      await page.screenshot({ path: path.join(screenshotsDir, '03-wizard-ERROR.png'), fullPage: true });
    } else {
      console.log('✓ No "No vehicle found" error');
    }

    // Check page content
    const pageText = await page.textContent('body');
    console.log(`\n📄 Page content preview (first 500 chars):`);
    console.log(pageText?.substring(0, 500).replace(/\s+/g, ' ') + '...\n');

    // Check for vehicle card
    const vehicleCards2 = await page.locator('.MuiCard-root').count();
    console.log(`✓ Vehicle cards on wizard: ${vehicleCards2}`);

    if (vehicleCards2 > 0) {
      const cardText = await page.locator('.MuiCard-root').first().textContent();
      console.log(`✓ Vehicle card text: ${cardText?.substring(0, 100)}...`);
    }

    // Check for form fields
    const dateFields = await page.locator('input[type="date"]').count();
    const selectFields = await page.locator('select, [role="combobox"]').count();
    const textFields = await page.locator('input[type="text"], .MuiTextField-root input').count();

    console.log(`✓ Form fields - Date: ${dateFields}, Selects: ${selectFields}, Text: ${textFields}`);

    // Check for stepper
    const stepper = await page.locator('.MuiStepper-root').count();
    if (stepper > 0) {
      const steps = await page.locator('.MuiStep-root').count();
      const activeStep = await page.locator('.Mui-active').count();
      console.log(`✓ Stepper found: ${steps} steps, active step index: ${activeStep}`);
    } else {
      console.log('⚠️  Stepper not found');
    }

    // Check buttons
    const nextButton = await page.getByRole('button', { name: /Next|التالي/i }).count();
    const backButton = await page.getByRole('button', { name: /Back|رجوع/i }).count();
    const cancelButton = await page.getByRole('button', { name: /Cancel|إلغاء/i }).count();

    console.log(`✓ Buttons - Next: ${nextButton}, Back: ${backButton}, Cancel: ${cancelButton}`);

    // ═══════════════════════════════════════════════════════════════
    // STAGE 5: SUPABASE NETWORK ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 5: SUPABASE NETWORK ANALYSIS                           │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    const supabaseRequests = networkLogs.filter(log =>
      log.type === 'REQUEST' && log.url.includes('vehicle_trims')
    );
    const supabaseResponses = networkLogs.filter(log =>
      log.type === 'RESPONSE' && log.url.includes('vehicle_trims')
    );

    console.log(`✓ Supabase vehicle_trims requests: ${supabaseRequests.length}`);
    console.log(`✓ Supabase vehicle_trims responses: ${supabaseResponses.length}`);

    if (supabaseRequests.length > 0) {
      console.log('\n📡 Supabase Requests:');
      supabaseRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url.substring(0, 100)}...`);
      });
    }

    if (supabaseResponses.length > 0) {
      console.log('\n📥 Supabase Responses:');
      supabaseResponses.forEach((res, i) => {
        console.log(`  ${i + 1}. Status ${res.status}`);
        console.log(`      URL: ${res.url.substring(0, 100)}...`);
        console.log(`      Body preview: ${res.body.substring(0, 150)}...`);
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // STAGE 6: LOCALSTORAGE STATE
    // ═══════════════════════════════════════════════════════════════
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 6: LOCALSTORAGE STATE                                  │');
    console.log('└─────────────────────────────────────────────────────────────┘');

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

    console.log(`✓ LocalStorage keys: ${Object.keys(localStorageData).join(', ')}`);

    const wizardStore = localStorageData['booking-wizard-storage'];
    if (wizardStore) {
      console.log('\n✓ Booking wizard store found:');
      console.log(`  Step: ${wizardStore.state?.step}`);
      console.log(`  Vehicle ID: ${wizardStore.state?.vehicleId}`);
      console.log(`  Full state:`, JSON.stringify(wizardStore, null, 2));
    } else {
      console.log('\n❌ Booking wizard store NOT found in localStorage');
    }

    // ═══════════════════════════════════════════════════════════════
    // STAGE 7: CONSOLE LOGS & ERRORS
    // ═══════════════════════════════════════════════════════════════
    console.log('\n┌─────────────────────────────────────────────────────────────┐');
    console.log('│ STAGE 7: CONSOLE LOGS & ERRORS                               │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    const errors = consoleLogs.filter(log => log.type === 'error' || log.type === 'ERROR');
    const warnings = consoleLogs.filter(log => log.type === 'warning');

    console.log(`✓ Console errors: ${errors.length}`);
    console.log(`✓ Console warnings: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. [${err.timestamp}] ${err.message || err.text}`);
        if (err.stack) {
          console.log(`      Stack: ${err.stack.substring(0, 200)}...`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS FOUND:');
      warnings.slice(0, 5).forEach((warn, i) => {
        console.log(`  ${i + 1}. [${warn.timestamp}] ${warn.text.substring(0, 100)}`);
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // SAVE ALL LOGS
    // ═══════════════════════════════════════════════════════════════
    fs.writeFileSync(
      path.join(screenshotsDir, 'network-logs.json'),
      JSON.stringify(networkLogs, null, 2)
    );
    fs.writeFileSync(
      path.join(screenshotsDir, 'console-logs.json'),
      JSON.stringify(consoleLogs, null, 2)
    );
    fs.writeFileSync(
      path.join(screenshotsDir, 'localstorage.json'),
      JSON.stringify(localStorageData, null, 2)
    );

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║ AUDIT COMPLETE - Results saved to test-results/wizard-audit-v2 ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Final assertion - wizard should load without critical errors
    expect(noVehicleError).toBe(0);
  });
});
