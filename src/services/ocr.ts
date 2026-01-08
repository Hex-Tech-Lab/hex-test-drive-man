/**
 * Extracts text from image using server-side OCR API
 * Configured for Arabic text with optimized settings
 * 
 * @param imageBlob - Image blob to extract text from
 * @returns Extracted text string
 */
export async function extractTextFromImage(imageBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('image', imageBlob);
  
  const response = await fetch('/api/ocr', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('OCR extraction failed');
  }
  
  const data = await response.json();
  return data.text || '';
}

/**
 * Extracts Egyptian National ID (14 digits) from text
 * 
 * @param text - OCR extracted text
 * @returns National ID string or undefined
 */
export function extractNationalID(text: string): string | undefined {
  const match = text.match(/\b\d{14}\b/);
  return match ? match[0] : undefined;
}

/**
 * Extracts name from Arabic text
 * Looks for lines with 3+ Arabic words
 * 
 * @param text - OCR extracted text
 * @returns Name string or undefined
 */
export function extractName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find first line with 3+ Arabic words (likely the name)
  const nameMatch = lines.find(line => {
    const arabicOnly = /^[\u0600-\u06FF\s]{10,}$/;
    const wordCount = line.split(/\s+/).length;
    return arabicOnly.test(line) && wordCount >= 3;
  });
  
  return nameMatch;
}
