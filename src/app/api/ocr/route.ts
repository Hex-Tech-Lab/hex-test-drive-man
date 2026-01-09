import { NextRequest, NextResponse } from 'next/server';
import { extractNationalID, extractName } from '@/services/ocr';

/**
 * OCR API endpoint for extracting text from ID card images
 * Currently returns mock data - will be implemented with Tesseract.js or cloud OCR
 * 
 * POST /api/ocr
 * Body: FormData with 'image' field (Blob)
 * Returns: { text: string, nationalId?: string, name?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageField = formData.get('image');
    
    // Validate that image is actually a Blob
    if (!imageField || !(imageField instanceof Blob)) {
      return NextResponse.json(
        { error: 'Invalid image: must be a Blob' },
        { status: 400 }
      );
    }
    
    const image = imageField as Blob;
    
    // TODO: Implement actual OCR using Tesseract.js or cloud OCR service
    // For now, return mock data to unblock development
    
    // Mock extracted text (Egyptian National ID format)
    const mockText = `
      جمهورية مصر العربية
      بطاقة تحقيق شخصية
      محمد أحمد علي
      12345678901234
      تاريخ الميلاد: 1990/01/15
    `;
    
    // Extract National ID and name using service functions
    const nationalId = extractNationalID(mockText);
    const name = extractName(mockText);
    
    return NextResponse.json({
      text: mockText,
      nationalId,
      name,
      warning: 'Mock OCR data - actual implementation pending'
    });
    
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    );
  }
}
