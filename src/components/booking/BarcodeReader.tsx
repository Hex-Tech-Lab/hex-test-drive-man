// Barcode reader component for Egyptian ID back side
// Created: 2026-01-08
// Agent: BB
// MVP 1.5: Booking System - Phase 1

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

interface BarcodeData {
  nationalId: string;
  name: string;
  birthDate: string;
  rawData: string;
}

interface BarcodeReaderProps {
  imageData: string;
  ocrData?: {
    nationalId: string;
    name: string;
    birthDate: string;
  };
  onComplete: (data: BarcodeData, verified: boolean) => void;
  language?: 'en' | 'ar';
}

/**
 * Barcode reader component for Egyptian ID
 * Uses BarcodeDetector API (primary) with ZXing fallback
 * Reads PDF417 barcode from ID back
 * Cross-verifies with OCR data
 */
export default function BarcodeReader({
  imageData,
  ocrData,
  onComplete,
  language = 'en',
}: BarcodeReaderProps) {
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<BarcodeData | null>(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState<string[]>([]);

  const isArabic = language === 'ar';

  useEffect(() => {
    readBarcode();
  }, [imageData]);

  const readBarcode = async () => {
    try {
      setProcessing(true);
      setError(null);

      let barcodeData: BarcodeData | null = null;

      // Try BarcodeDetector API first (if available)
      if ('BarcodeDetector' in window) {
        barcodeData = await readWithBarcodeDetector();
      }

      // Fallback to ZXing if BarcodeDetector failed or unavailable
      if (!barcodeData) {
        barcodeData = await readWithZXing();
      }

      if (barcodeData) {
        setResult(barcodeData);

        // Cross-verify with OCR data if available
        if (ocrData) {
          const isVerified = verifyData(barcodeData, ocrData);
          setVerified(isVerified);
        } else {
          setVerified(true);
        }

        onComplete(barcodeData, verified);
      } else {
        throw new Error('Failed to read barcode');
      }
    } catch (err: any) {
      console.error('Barcode reading error:', err);
      setError(
        isArabic
          ? 'فشل قراءة الباركود. يرجى التأكد من وضوح الصورة.'
          : 'Failed to read barcode. Please ensure image is clear.',
      );
    } finally {
      setProcessing(false);
    }
  };

  // Read barcode using BarcodeDetector API
  const readWithBarcodeDetector = async (): Promise<BarcodeData | null> => {
    try {
      // @ts-ignore - BarcodeDetector is experimental
      const barcodeDetector = new BarcodeDetector({
        formats: ['pdf417', 'qr_code'],
      });

      // Convert base64 to blob
      const blob = await fetch(imageData).then((r) => r.blob());
      const imageBitmap = await createImageBitmap(blob);

      const barcodes = await barcodeDetector.detect(imageBitmap);

      if (barcodes.length > 0) {
        const rawData = barcodes[0].rawValue;
        return parseBarcodeData(rawData);
      }

      return null;
    } catch (err) {
      console.error('BarcodeDetector error:', err);
      return null;
    }
  };

  // Read barcode using ZXing (fallback)
  const readWithZXing = async (): Promise<BarcodeData | null> => {
    try {
      const zbar = await import('@undecaf/zbar-wasm');

      // Convert base64 to ImageData
      const img = document.createElement('img');
      img.src = imageData;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return null;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // @ts-ignore - zbar-wasm types are incomplete
      const symbols = await zbar.scanImageData(imgData);

      if (symbols && symbols.length > 0) {
        const rawData = symbols[0].decode();
        return parseBarcodeData(rawData);
      }

      return null;
    } catch (err) {
      console.error('ZXing error:', err);
      return null;
    }
  };

  // Parse Egyptian ID barcode data
  const parseBarcodeData = (rawData: string): BarcodeData | null => {
    try {
      // Egyptian ID PDF417 format (simplified parsing)
      // Format varies, but typically contains: ID number, name, birth date
      
      // Extract National ID (14 digits)
      const idMatch = rawData.match(/\b\d{14}\b/);
      const nationalId = idMatch ? idMatch[0] : '';

      if (!nationalId) return null;

      // Extract birth date from National ID
      const year = parseInt(nationalId.substring(0, 2));
      const month = nationalId.substring(2, 4);
      const day = nationalId.substring(4, 6);
      const fullYear = year > 50 ? 1900 + year : 2000 + year;
      const birthDate = `${fullYear}-${month}-${day}`;

      // Extract name (look for text patterns)
      const lines = rawData.split(/[\n\r]+/);
      let name = '';
      
      for (const line of lines) {
        // Look for name patterns (multiple words, Arabic or English)
        if (
          line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5}$/) ||
          line.match(/^[\u0600-\u06FF\s]{10,}$/)
        ) {
          name = line.trim();
          break;
        }
      }

      return {
        nationalId,
        name: name || 'Unknown',
        birthDate,
        rawData,
      };
    } catch (err) {
      console.error('Parse error:', err);
      return null;
    }
  };

  // Verify barcode data against OCR data
  const verifyData = (
    barcodeData: BarcodeData,
    ocrData: { nationalId: string; name: string; birthDate: string },
  ): boolean => {
    const mismatches: string[] = [];

    // Check National ID
    if (barcodeData.nationalId !== ocrData.nationalId) {
      mismatches.push(
        isArabic ? 'الرقم القومي غير متطابق' : 'National ID mismatch',
      );
    }

    // Check birth date
    if (barcodeData.birthDate !== ocrData.birthDate) {
      mismatches.push(
        isArabic ? 'تاريخ الميلاد غير متطابق' : 'Birth date mismatch',
      );
    }

    // Name comparison (fuzzy match due to OCR errors)
    const nameSimilarity = calculateSimilarity(
      barcodeData.name.toLowerCase(),
      ocrData.name.toLowerCase(),
    );

    if (nameSimilarity < 0.7) {
      mismatches.push(isArabic ? 'الاسم غير متطابق' : 'Name mismatch');
    }

    setMismatch(mismatches);
    return mismatches.length === 0;
  };

  // Calculate string similarity (Levenshtein distance)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <QrCodeScannerIcon sx={{ mr: 1 }} />
        {isArabic ? 'قراءة الباركود' : 'Reading Barcode'}
      </Typography>

      {processing && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body2">
            {isArabic ? 'جاري قراءة الباركود...' : 'Reading barcode...'}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" icon={<WarningIcon />}>
          {error}
        </Alert>
      )}

      {result && !processing && (
        <Box>
          <Alert
            severity={verified ? 'success' : 'warning'}
            icon={verified ? <CheckCircleIcon /> : <WarningIcon />}
            sx={{ mb: 2 }}
          >
            {verified
              ? isArabic
                ? 'تم التحقق من البيانات بنجاح'
                : 'Data verified successfully'
              : isArabic
                ? 'تحذير: البيانات غير متطابقة'
                : 'Warning: Data mismatch detected'}
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {isArabic ? 'بيانات الباركود:' : 'Barcode Data:'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {isArabic ? 'الرقم القومي:' : 'National ID:'}
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {result.nationalId}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {isArabic ? 'الاسم:' : 'Name:'}
                </Typography>
                <Typography variant="body1">{result.name}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {isArabic ? 'تاريخ الميلاد:' : 'Birth Date:'}
                </Typography>
                <Typography variant="body1">{result.birthDate}</Typography>
              </Box>
            </Box>
          </Box>

          {mismatch.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {isArabic ? 'عدم تطابق في:' : 'Mismatches in:'}
              </Typography>
              {mismatch.map((item, index) => (
                <Chip key={index} label={item} size="small" sx={{ mr: 1, mb: 1 }} />
              ))}
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}
