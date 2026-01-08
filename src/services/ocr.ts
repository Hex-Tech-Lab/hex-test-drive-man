import { createWorker } from 'tesseract.js';

let worker: any = null;

export async function extractTextFromImage(imageBlob: Blob): Promise<string> {
  if (!worker) {
    worker = await createWorker('ara');
    console.log('[OCR] Tesseract.js worker initialized for Arabic');
  }

  const startTime = Date.now();
  
  // Recognize text from image
  const { data: { text } } = await worker.recognize(imageBlob);
  const duration = Date.now() - startTime;
  
  console.log(`[OCR] Extraction completed in ${duration}ms`);
  return text;
}

export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
    console.log('[OCR] Worker terminated');
  }
}
