'use client';
import { useRef, useEffect, useState } from 'react';
import { Box, Alert, Button, Typography, CircularProgress } from '@mui/material';
import { useSmartScanner } from '@/hooks/useSmartScanner';
import { extractTextFromImage, extractNationalID, extractName } from '@/services/ocr';

interface SmartScannerProps {
  mode: 'front' | 'back';
  onScanComplete: (result: { imageData: string; data: { nationalId?: string; name?: string } }) => void;
  language?: 'en' | 'ar';
}

/**
 * Smart ID card scanner with progressive enhancement
 * Level 1: Manual capture
 * Level 2: Edge detection with OpenCV.js
 * Level 3: OCR validation (future)
 * Level 4: Face matching (future)
 * 
 * @param mode - Which side of ID to scan (front/back)
 * @param onScanComplete - Callback when scan is complete with extracted data
 * @param language - UI language (en/ar)
 */
export function SmartScanner({ mode, onScanComplete, language = 'en' }: SmartScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { level, state, detectIDCard } = useSmartScanner();
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isArabic = language === 'ar';

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  /**
   * Initializes camera stream with rear camera preference
   */
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        processFrames();
      }
    } catch (err) {
      setError('Camera access denied');
    }
  }

  /**
   * Stops camera stream and cleans up animation frame
   */
  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }

  /**
   * Processes video frames for ID card detection
   */
  function processFrames() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function processFrame() {
      if (!video || !canvas || !ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const shouldCapture = detectIDCard(imageData);
      if (shouldCapture) {
        canvas.toBlob(async (blob) => { 
          if (blob) await handleCapture(blob); 
        }, 'image/jpeg', 0.9);
        return;
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
    processFrame();
  }

  /**
   * Handles image capture and OCR extraction
   */
  async function handleCapture(blob: Blob) {
    try {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Extract text using OCR (only for front side)
      let extractedData: { nationalId?: string; name?: string } = {};
      
      if (mode === 'front') {
        try {
          const text = await extractTextFromImage(blob);
          const nationalId = extractNationalID(text);
          const name = extractName(text);
          
          if (nationalId) extractedData.nationalId = nationalId;
          if (name) extractedData.name = name;
        } catch (ocrError) {
          console.error('OCR extraction failed:', ocrError);
          // Continue without OCR data
        }
      }

      // Call completion callback
      onScanComplete({
        imageData,
        data: extractedData
      });
    } catch (error) {
      console.error('Capture processing failed:', error);
      setError('Failed to process image');
    }
  }

  /**
   * Manual capture fallback for level 1 or user override
   */
  function manualCapture() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => { 
      if (blob) await handleCapture(blob); 
    }, 'image/jpeg', 0.9);
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={() => window.location.reload()}>
          {isArabic ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </Alert>
    );
  }

  const sideLabel = mode === 'front' 
    ? (isArabic ? 'الوجه الأمامي' : 'Front Side')
    : (isArabic ? 'الوجه الخلفي' : 'Back Side');

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        {isArabic ? `مسح ${sideLabel}` : `Scan ${sideLabel}`}
      </Typography>
      
      {state === 'loading' && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            {isArabic ? 'جاري تحميل الماسح الذكي...' : 'Initializing Smart Scanner...'}
          </Typography>
        </Box>
      )}
      
      <video 
        ref={videoRef} 
        style={{ 
          width: '100%', 
          display: state === 'loading' ? 'none' : 'block',
          borderRadius: '8px',
          border: state === 'detecting' ? '3px solid #4caf50' : '1px solid #ccc'
        }} 
        playsInline 
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {isArabic ? `مستوى الماسح: ${level}/4` : `Scanner Level: ${level}/4`}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {isArabic ? `الحالة: ${state}` : `Status: ${state}`}
        </Typography>
        <Button onClick={manualCapture} variant="outlined" sx={{ mt: 1 }}>
          {isArabic ? 'التقاط يدوي' : 'Manual Capture'}
        </Button>
      </Box>
    </Box>
  );
}
