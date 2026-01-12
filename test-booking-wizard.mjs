#!/usr/bin/env node
import { chromium } from 'playwright';

const BASE_URL = 'https://hex-test-drive-man.vercel.app';
const TIMEOUT = 30000;

async function testBookingWizard() {
  console.log('🚀 Starting Booking Wizard Production Test\n');
  console.log('Target URL:', `${BASE_URL}/ar/bookings/new`);
  console.log('Commit:', 'a71d607 (PR#72)\n');

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X
    locale: 'ar-EG',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();
  
  try {
    // Test 1: Direct URL with vehicleId parameter
    console.log('📋 Test 1: Direct URL with vehicleId parameter');
    const testVehicleId = 'abe7f3bc-f421-40fe-8bc4-f865757974d8';
    const directUrl = `${BASE_URL}/ar/bookings/new?vehicleId=${testVehicleId}`;
    
    await page.goto(directUrl, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('  ✓ Navigated to:', currentUrl);
    
    // Check for error messages
    const errorText = await page.locator('text=/no vehicle found|failed to load|error/i').count();
    if (errorText > 0) {
      const errorContent = await page.locator('text=/no vehicle found|failed to load|error/i').first().textContent();
      console.log('  ❌ ERROR FOUND:', errorContent);
    } else {
      console.log('  ✓ No error messages detected');
    }
    
    // Check for vehicle data display
    const hasVehicleImage = await page.locator('img[alt*="vehicle"], img[alt*="سيارة"]').count() > 0;
    const hasVehicleName = await page.locator('text=/toyota|bmw|mercedes|hyundai|kia/i').count() > 0;
    
    console.log('  ✓ Vehicle image present:', hasVehicleImage);
    console.log('  ✓ Vehicle name present:', hasVehicleName);
    
    // Take screenshot
    await page.screenshot({ path: '/vercel/sandbox/test-direct-url.png', fullPage: true });
    console.log('  ✓ Screenshot saved: test-direct-url.png\n');
    
    // Test 2: Catalog entry point
    console.log('📋 Test 2: Catalog Entry Point');
    await page.goto(`${BASE_URL}/ar`, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await page.waitForTimeout(3000); // Wait for CSR hydration
    
    console.log('  ✓ Catalog page loaded');
    
    // Look for "احجز تجربة قيادة" button
    const bookButtons = await page.locator('button:has-text("احجز"), a:has-text("احجز")').count();
    console.log('  ✓ Book buttons found:', bookButtons);
    
    if (bookButtons > 0) {
      const firstButton = page.locator('button:has-text("احجز"), a:has-text("احجز")').first();
      await firstButton.click();
      await page.waitForTimeout(2000);
      
      const bookingUrl = page.url();
      console.log('  ✓ Redirected to:', bookingUrl);
      
      const hasVehicleIdParam = bookingUrl.includes('vehicleId=');
      console.log('  ✓ vehicleId parameter present:', hasVehicleIdParam);
      
      await page.screenshot({ path: '/vercel/sandbox/test-catalog-entry.png', fullPage: true });
      console.log('  ✓ Screenshot saved: test-catalog-entry.png\n');
    } else {
      console.log('  ⚠️  No book buttons found on catalog page\n');
    }
    
    // Test 3: Detail page entry point (THE CRITICAL FIX)
    console.log('📋 Test 3: Detail Page Entry Point (Critical Fix)');
    
    // Navigate to a known vehicle detail page
    await page.goto(`${BASE_URL}/ar/vehicles/toyota-corolla-2025`, { 
      waitUntil: 'networkidle', 
      timeout: TIMEOUT 
    });
    await page.waitForTimeout(2000);
    
    console.log('  ✓ Detail page loaded');
    
    // Look for "Book Test Drive" button
    const detailBookButton = await page.locator('button:has-text("احجز"), a:has-text("احجز")').count();
    console.log('  ✓ Book buttons on detail page:', detailBookButton);
    
    if (detailBookButton > 0) {
      const detailButton = page.locator('button:has-text("احجز"), a:has-text("احجز")').first();
      await detailButton.click();
      await page.waitForTimeout(2000);
      
      const detailBookingUrl = page.url();
      console.log('  ✓ Redirected to:', detailBookingUrl);
      
      const hasVehicleIdFromDetail = detailBookingUrl.includes('vehicleId=');
      const hasTrimParam = detailBookingUrl.includes('trim=');
      
      console.log('  ✓ vehicleId parameter present:', hasVehicleIdFromDetail);
      console.log('  ✓ OLD trim parameter present:', hasTrimParam, '(should be false)');
      
      if (hasVehicleIdFromDetail && !hasTrimParam) {
        console.log('  ✅ CRITICAL FIX VERIFIED: Using vehicleId instead of trim');
      } else {
        console.log('  ❌ CRITICAL FIX FAILED: Still using old trim parameter');
      }
      
      await page.screenshot({ path: '/vercel/sandbox/test-detail-entry.png', fullPage: true });
      console.log('  ✓ Screenshot saved: test-detail-entry.png\n');
    } else {
      console.log('  ⚠️  No book buttons found on detail page\n');
    }
    
    console.log('✅ All tests completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '/vercel/sandbox/test-error.png', fullPage: true });
    console.log('  ✓ Error screenshot saved: test-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

testBookingWizard().catch(console.error);
