/**
 * OCR API Endpoint - Server-side text extraction
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5: Smart Document Capture
 * 
 * This endpoint handles OCR processing server-side to avoid
 * bundling Node.js dependencies in the browser.
 * 
 * Future: Integrate with Scribe.js or cloud OCR service
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ocr
 * Extract text from image using OCR
 */
export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual OCR processing
    // Options:
    // 1. Use Scribe.js server-side (requires worker setup)
    // 2. Use cloud OCR service (Google Vision, AWS Textract, Azure)
    // 3. Use Tesseract.js server-side
    
    // For now, return mock data to unblock development
    // This should be replaced with actual OCR implementation
    const mockResult = {
      nationalId: undefined, // Will be extracted from image
      name: undefined, // Will be extracted from image
      licenseNo: undefined, // Will be extracted from image
      text: '', // Full extracted text
      confidence: 0
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    );
  }
}
