import { NextRequest, NextResponse } from 'next/server';

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
    const image = formData.get('image') as Blob;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 },
      );
    }
    
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
    
    // Extract National ID (14 digits)
    const idMatch = mockText.match(/\b\d{14}\b/);
    const nationalId = idMatch ? idMatch[0] : undefined;
    
    // Extract name (simplified - first Arabic line with 3+ words)
    const lines = mockText.split('\n').map(l => l.trim()).filter(Boolean);
    const nameMatch = lines.find(line => 
      /^[\u0600-\u06FF\s]{10,}$/.test(line) && line.split(/\s+/).length >= 3,
    );
    
    return NextResponse.json({
      text: mockText,
      nationalId,
      name: nameMatch,
      warning: 'Mock OCR data - actual implementation pending',
    });
    
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 },
    );
  }
}
