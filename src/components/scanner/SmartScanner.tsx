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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const isArabic = language === 'ar';

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const initWithRetry = async () => {
      while (retryCount < maxRetries) {
        try {
          await startCamera();
          return; // Success
        } catch (err) {
          retryCount++;
          console.warn(`Camera init attempt ${retryCount}/${maxRetries} failed:`, err);
          
          if (retryCount < maxRetries) {
            // Wait 1 second before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // Final failure
            setError('Camera initialization failed after 3 attempts');
          }
        }
      }
    };
    
    initWithRetry();
    
    return () => stopCamera();
  }, []);

  /**
   * Initializes camera stream with rear camera preference
   */
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
        },
      });
      
      if (!videoRef.current) return;
      
      videoRef.current.srcObject = stream;
      
      // CRITICAL: Wait for video metadata before playing
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return reject(new Error('Video element lost'));
        
        videoRef.current.onloadedmetadata = () => {
          resolve();
        };
        
        videoRef.current.onerror = () => {
          reject(new Error('Video metadata load failed'));
        };
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Video metadata timeout')), 5000);
      });
      
      // Play video with error handling
      try {
        await videoRef.current.play();
      } catch (playError) {
        console.error('Video play failed:', playError);
        throw new Error('Autoplay blocked - tap to enable camera');
      }
      
      // Only start processing after video is ready
      processFrames();
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      setError(err.message || 'Camera access denied');
    }
  }

  /**
   * Stops camera stream and cleans up animation frame
   */
  function stopCamera() {
    // Cancel animation frame first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop all media tracks
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind, track.label);
      });
      videoRef.current.srcObject = null;
    }
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

    /**
     *
     */
    function processFrame() {
      if (!video || !canvas || !ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const shouldCapture = detectIDCard(imageData);
      if (shouldCapture && !isCapturing && countdown === null) {
        setIsCapturing(true);
        let count = 3;
        setCountdown(count);
        
        const timer = setInterval(() => {
          count--;
          if (count > 0) {
            setCountdown(count);
          } else {
            clearInterval(timer);
            setCountdown(null);
            canvas.toBlob(async (blob) => {
              if (blob) {
                await handleCapture(blob);
                setIsCapturing(false);
              }
            }, 'image/jpeg', 0.9);
          }
        }, 1000);
        
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
        data: extractedData,
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

      {countdown !== null && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: 120,
              fontWeight: 900,
              color: '#00ff00',
              textShadow: '0 0 30px #00ff00, 0 0 60px #00ff00',
            }}
          >
            {countdown}
          </Typography>
        </Box>
      )}
      
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
          border: state === 'detecting' ? '3px solid #4caf50' : '1px solid #ccc',
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
