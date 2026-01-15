// OCR processor component using Tesseract.js
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
  LinearProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { createWorker } from 'tesseract.js';

interface OCRResult {
  name: string;
  nationalId: string;
  birthDate: string;
  confidence: number;
}

interface OCRProcessorProps {
  imageData: string;
  onComplete: (result: OCRResult) => void;
  language?: 'en' | 'ar';
}

/**
 * OCR processor component using Tesseract.js
 * Extracts: name, national ID, birth date from Egyptian ID
 * Uses Web Worker for non-blocking processing
 * Displays confidence scores
 */
export default function OCRProcessor({
  imageData,
  onComplete,
  language = 'en',
}: OCRProcessorProps) {
  const [processing, setProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isArabic = language === 'ar';

  useEffect(() => {
    processImage();
  }, [imageData]);

  const processImage = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Create Tesseract worker
      const worker = await createWorker('eng+ara', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Perform OCR
      const {
        data: { text, confidence },
      } = await worker.recognize(imageData);

      await worker.terminate();

      // Parse Egyptian ID data
      const extractedData = parseEgyptianID(text);

      if (extractedData) {
        const ocrResult: OCRResult = {
          ...extractedData,
          confidence: Math.round(confidence),
        };
        setResult(ocrResult);
        onComplete(ocrResult);
      } else {
        throw new Error('Failed to extract ID data');
      }
    } catch (err: any) {
      console.error('OCR error:', err);
      setError(
        isArabic
          ? 'فشل قراءة البطاقة. يرجى إدخال البيانات يدوياً.'
          : 'Failed to read ID. Please enter data manually.',
      );
    } finally {
      setProcessing(false);
    }
  };

  // Parse Egyptian National ID text
  const parseEgyptianID = (
    text: string,
  ): { name: string; nationalId: string; birthDate: string } | null => {
    try {
      // Clean text
      const cleanText = text.replace(/\s+/g, ' ').trim();

      // Extract National ID (14 digits)
      const idMatch = cleanText.match(/\b\d{14}\b/);
      const nationalId = idMatch ? idMatch[0] : '';

      if (!nationalId) return null;

      // Extract birth date from National ID
      // Format: YYMMDDSSGGGC (first 6 digits = YYMMDD)
      const year = parseInt(nationalId.substring(0, 2));
      const month = nationalId.substring(2, 4);
      const day = nationalId.substring(4, 6);
      const fullYear = year > 50 ? 1900 + year : 2000 + year;
      const birthDate = `${fullYear}-${month}-${day}`;

      // Extract name (Arabic or English)
      // Look for patterns: multiple words with capital letters or Arabic characters
      const namePatterns = [
        // English name pattern (limited to 5 name parts to prevent ReDoS)
    // eslint-disable-next-line security/detect-unsafe-regex
        /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5}$/,
        // Arabic name pattern
        /[\u0600-\u06FF\s]{10,}/,
      ];

      let name = '';
      for (const pattern of namePatterns) {
        const nameMatch = cleanText.match(pattern);
        if (nameMatch) {
          name = nameMatch[0].trim();
          break;
        }
      }

      // If no name found, try to extract from lines
      if (!name) {
        const lines = cleanText.split('\n').filter((line) => line.trim().length > 5);
        // Usually name is in first few lines
        name = lines[0] || '';
      }

      return {
        name: name || 'Unknown',
        nationalId,
        birthDate,
      };
    } catch (err) {
      console.error('Parse error:', err);
      return null;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isArabic ? 'قراءة البطاقة' : 'Reading ID'}
      </Typography>

      {processing && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2">
              {isArabic ? 'جاري المعالجة...' : 'Processing...'}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {progress}%
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
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
            {isArabic
              ? 'تم قراءة البطاقة بنجاح'
              : 'ID read successfully'}
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {isArabic ? 'البيانات المستخرجة:' : 'Extracted Data:'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {isArabic ? 'الاسم:' : 'Name:'}
                </Typography>
                <Typography variant="body1">{result.name}</Typography>
              </Box>

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
                  {isArabic ? 'تاريخ الميلاد:' : 'Birth Date:'}
                </Typography>
                <Typography variant="body1">{result.birthDate}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  {isArabic ? 'دقة القراءة:' : 'Confidence:'}
                </Typography>
                <Chip
                  label={`${result.confidence}%`}
                  color={result.confidence > 80 ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {result.confidence < 80 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {isArabic
                ? 'دقة القراءة منخفضة. يرجى التحقق من البيانات.'
                : 'Low confidence. Please verify the data.'}
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}
