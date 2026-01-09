/**
 * Extracts text from image using server-side OCR API
 * Configured for Arabic text with optimized settings
 * 
 * @param imageBlob - Image blob to extract text from
 * @returns Extracted text string
 * @throws Error if OCR extraction fails
 */
export async function extractTextFromImage(imageBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob);
    
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OCR API error:', response.status, errorData);
      throw new Error(`OCR extraction failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw error;
  }
}

/**
 * Extracts Egyptian National ID (14 digits) from text
 * 
 * Egyptian National ID format:
 * - 14 digits total
 * - First digit: century (2 = 1900s, 3 = 2000s)
 * - Next 6 digits: birth date (YYMMDD)
 * - Next 2 digits: governorate code
 * - Next 4 digits: sequence number
 * - Last digit: checksum
 * 
 * @param text - OCR extracted text
 * @returns National ID string or undefined if not found or invalid
 */
export function extractNationalID(text: string): string | undefined {
  const match = text.match(/\b\d{14}\b/);
  if (!match) return undefined;
  
  const id = match[0];
  
  // Basic validation: first digit should be 2 or 3 (century)
  const century = parseInt(id[0]);
  if (century !== 2 && century !== 3) {
    console.warn('Invalid National ID format: century digit must be 2 or 3');
    return undefined;
  }
  
  return id;
}

/**
 * Extracts name from Arabic text
 * 
 * Configurable thresholds:
 * - MIN_NAME_LENGTH: 10 characters (typical Arabic name minimum)
 * - MIN_WORD_COUNT: 3 words (first, middle, last name)
 * - Pattern: Arabic Unicode range (U+0600 to U+06FF) plus spaces
 * 
 * @param text - OCR extracted text
 * @returns Name string or undefined if not found
 */
export function extractName(text: string): string | undefined {
  const MIN_NAME_LENGTH = 10;
  const MIN_WORD_COUNT = 3;
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find first line with 3+ Arabic words (likely the name)
  const nameMatch = lines.find(line => {
    const arabicOnly = new RegExp(`^[\\u0600-\\u06FF\\s]{${MIN_NAME_LENGTH},}$`);
    const wordCount = line.split(/\s+/).length;
    return arabicOnly.test(line) && wordCount >= MIN_WORD_COUNT;
  });
  
  return nameMatch;
}
