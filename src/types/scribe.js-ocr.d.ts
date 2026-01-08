/**
 * Type declarations for scribe.js-ocr
 * Created: 2026-01-08
 * Agent: BB
 */

declare module 'scribe.js-ocr' {
  export interface RecognitionResult {
    data: {
      text: string;
      confidence: number;
      words: Array<{
        text: string;
        confidence: number;
        bbox: {
          x0: number;
          y0: number;
          x1: number;
          y1: number;
        };
      }>;
    };
  }

  export interface Worker {
    recognize(image: Blob | string): Promise<RecognitionResult>;
    terminate(): Promise<void>;
  }

  export function createWorker(lang: string): Promise<Worker>;
}
