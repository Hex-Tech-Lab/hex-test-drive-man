#!/usr/bin/env node
/**
 * E2E OTP Test Automation
 * Tests: Booking creation → OTP send → Verification → DB state
 * Agent: CC/CCW autonomous execution
 */

import { chromium } from 'playwright';
import fetch from 'node-fetch';

const CONFIG = {
  deploymentUrl: process.env.VERCEL_URL || 'https://hex-test-drive-man-git-ccw-fix-dupl-10f4e1-techhypexps-projects.vercel.app',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  testPhone: '+201559225800',
  testName: 'E2E Test User',
};

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);
const report = { steps: [], errors: [], bookingId: null };

async function testBookingFlow() {
  log('🚀 Starting E2E OTP Test...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Step 1: Navigate to homepage
    log('Step 1: Navigate to homepage');
    await page.goto(CONFIG.deploymentUrl);
    await page.waitForLoadState('networkidle');
    report.steps.push({ step: 1, status: 'pass', msg: 'Homepage loaded' });

    // Step 2: Find and click first vehicle
    log('Step 2: Find vehicle and open booking modal');
    const bookButton = await page.locator('button:has-text("Book Test Drive"), button:has-text("احجز")').first();
    await bookButton.click();
    await page.waitForTimeout(1000);
    report.steps.push({ step: 2, status: 'pass', msg: 'Booking modal opened' });

    // Step 3: Fill form
    log('Step 3: Fill booking form');
    await page.fill('input[name="name"], input[placeholder*="Name"], input[placeholder*="الاسم"]', CONFIG.testName);
    await page.fill('input[name="phone"], input[type="tel"]', CONFIG.testPhone);

    // Select tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateStr);

    report.steps.push({ step: 3, status: 'pass', msg: 'Form filled' });

    // Step 4: Intercept API calls
    log('Step 4: Submit booking and capture response');
    let bookingResponse = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/bookings') && response.request().method() === 'POST') {
        bookingResponse = await response.json().catch(() => null);
        log(`API Response: ${JSON.stringify(bookingResponse)}`);
      }
    });

    await page.click('button[type="submit"]:has-text("Submit"), button:has-text("إرسال")');
    await page.waitForTimeout(3000); // Wait for API call

    if (!bookingResponse) {
      throw new Error('No booking API response captured');
    }

    if (bookingResponse.id) {
      report.bookingId = bookingResponse.id;
      report.steps.push({ step: 4, status: 'pass', msg: `Booking created: ${bookingResponse.id}` });
    } else {
      throw new Error(`Booking failed: ${JSON.stringify(bookingResponse)}`);
    }

    // Step 5: Verify redirect to OTP page
    log('Step 5: Verify redirect to OTP verification');
    await page.waitForURL(/\/bookings\/.*\/verify/, { timeout: 5000 });
    const currentUrl = page.url();

    if (currentUrl.includes('undefined')) {
      throw new Error(`Invalid redirect: ${currentUrl} - Booking ID is undefined`);
    }

    report.steps.push({ step: 5, status: 'pass', msg: `Redirected to: ${currentUrl}` });

    // Step 6: Check database state
    log('Step 6: Query database for booking and SMS records');
    const dbCheck = await checkDatabase(report.bookingId);
    report.steps.push({ step: 6, status: dbCheck.success ? 'pass' : 'fail', msg: dbCheck.msg, data: dbCheck.data });

    // Step 7: Verify SMS count (should be exactly 1)
    if (dbCheck.data?.smsCount !== 1) {
      report.errors.push(`Expected 1 SMS, got ${dbCheck.data?.smsCount}`);
    }

  } catch (error) {
    log(`❌ Error: ${error.message}`);
    report.errors.push(error.message);

    // Screenshot on error
    const screenshot = await page.screenshot({ fullPage: true });
    await require('fs').promises.writeFile('error-screenshot.png', screenshot);
    log('Screenshot saved: error-screenshot.png');
  } finally {
    await browser.close();
  }
}

async function checkDatabase(bookingId) {
  if (!bookingId) return { success: false, msg: 'No booking ID to check' };

  try {
    // Check booking
    const bookingRes = await fetch(
      `${CONFIG.supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}&select=*`,
      { headers: { apikey: CONFIG.supabaseKey } }
    );
    const bookings = await bookingRes.json();

    // Check SMS verifications
    const smsRes = await fetch(
      `${CONFIG.supabaseUrl}/rest/v1/sms_verifications?booking_id=eq.${bookingId}&select=*`,
      { headers: { apikey: CONFIG.supabaseKey } }
    );
    const smsRecords = await smsRes.json();

    return {
      success: true,
      msg: `DB check complete: ${bookings.length} booking(s), ${smsRecords.length} SMS record(s)`,
      data: {
        booking: bookings[0],
        smsCount: smsRecords.length,
        smsRecords,
      }
    };
  } catch (error) {
    return { success: false, msg: `DB query failed: ${error.message}` };
  }
}

async function generateReport() {
  const passed = report.steps.filter(s => s.status === 'pass').length;
  const failed = report.steps.filter(s => s.status === 'fail').length;

  const summary = {
    timestamp: new Date().toISOString(),
    deployment: CONFIG.deploymentUrl,
    bookingId: report.bookingId,
    totalSteps: report.steps.length,
    passed,
    failed,
    errors: report.errors,
    verdict: report.errors.length === 0 ? '✅ PASS' : '❌ FAIL',
  };

  log('\n📊 Test Report:');
  log(JSON.stringify(summary, null, 2));

  // Write to file
  await require('fs').promises.writeFile(
    'E2E_TEST_REPORT.json',
    JSON.stringify({ summary, steps: report.steps }, null, 2)
  );

  log('Report saved: E2E_TEST_REPORT.json');

  return summary.verdict === '✅ PASS' ? 0 : 1;
}

// Execute
(async () => {
  await testBookingFlow();
  const exitCode = await generateReport();
  process.exit(exitCode);
})();
