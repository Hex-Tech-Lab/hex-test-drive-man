interface ScanResult {
  valid: boolean;
  extracted: { name?: string; idNumber?: string; licenseNumber?: string };
  imageUrl: string;
  confidence: number;
}

interface ScanSlot {
  front: ScanResult | null;
  back: ScanResult | null;
}

class OCRService {
  async scanImage(imageBlob: Blob, type: 'id' | 'license', side: 'front' | 'back'): Promise<ScanResult> {
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('type', type);
    formData.append('side', side);

    // In a real app, this calls the API. For demo/mock:
    // We can call the API, but we also want to ensure the preview works.
    const response = await fetch('/api/ocr/scan', { method: 'POST', body: formData });

    // Fix #2: Handle rate limit errors with clear message
    if (response.status === 429) {
      const errorData = await response.json();
      throw new Error(`Rate limit exceeded. Please wait ${errorData.retryAfter || 60} seconds before trying again.`);
    }

    if (!response.ok) {
      throw new Error(`OCR scan failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Inject local preview URL for immediate feedback
    return {
      ...result,
      imageUrl: URL.createObjectURL(imageBlob)
    };
  }
  
  validateAllSlots(slots: Record<'id'|'license', ScanSlot>): boolean {
    return ['id', 'license'].every(typeKey => {
      const type = typeKey as 'id' | 'license';
      const slot = slots[type];
      return slot.front?.valid && slot.back?.valid;
    });
  }
}

export const ocrService = new OCRService();
export type { ScanResult, ScanSlot };
