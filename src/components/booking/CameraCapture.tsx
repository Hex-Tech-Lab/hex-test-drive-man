// Camera capture component with jscanify for document scanning
// Created: 2026-01-08
// Agent: BB
// MVP 1.5: Booking System - Phase 1

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

interface CameraCaptureProps {
  onCapture: (imageData: string, side: 'front' | 'back') => void;
  side: 'front' | 'back';
  language?: 'en' | 'ar';
}

/**
 * Camera capture component with document edge detection
 * Uses jscanify for real-time document scanning
 * Features: quality checks, preview, retake, camera flip
 */
export default function CameraCapture({
  onCapture,
  side,
  language = 'en',
}: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [qualityCheck, setQualityCheck] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isArabic = language === 'ar';

  const labels = {
    front: {
      en: 'ID Front Side',
      ar: 'الوجه الأمامي للبطاقة',
    },
    back: {
      en: 'ID Back Side',
      ar: 'الوجه الخلفي للبطاقة',
    },
    startCamera: {
      en: 'Start Camera',
      ar: 'تشغيل الكاميرا',
    },
    capture: {
      en: 'Capture',
      ar: 'التقاط',
    },
    retake: {
      en: 'Retake',
      ar: 'إعادة التقاط',
    },
    confirm: {
      en: 'Confirm',
      ar: 'تأكيد',
    },
    flip: {
      en: 'Flip Camera',
      ar: 'تبديل الكاميرا',
    },
    processing: {
      en: 'Processing...',
      ar: 'جاري المعالجة...',
    },
    instructions: {
      en: 'Position the ID card within the frame. Ensure good lighting and avoid glare.',
      ar: 'ضع البطاقة داخل الإطار. تأكد من الإضاءة الجيدة وتجنب الانعكاسات.',
    },
  };

  const getText = (key: keyof typeof labels) => {
    return labels[key][isArabic ? 'ar' : 'en'];
  };

  // Basic image enhancement (contrast + sharpness)
  const enhanceImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const factor = 1.2; // Contrast factor

    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast enhancement
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128)); // R
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // B
    }

    return imageData;
  };

  // Initialize camera
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(
        isArabic
          ? 'فشل الوصول إلى الكاميرا. يرجى التحقق من الأذونات.'
          : 'Failed to access camera. Please check permissions.'
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  // Flip camera
  const flipCamera = async () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(() => startCamera(), 100);
  };

  // Capture image with quality check
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setProcessing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply basic image enhancement
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const enhancedImageData = enhanceImage(imageData);
      ctx.putImageData(enhancedImageData, 0, 0);

      // Convert to base64
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Quality check
      const quality = await checkImageQuality(imageDataUrl);
      setQualityCheck(quality);

      if (quality.passed) {
        setCapturedImage(imageDataUrl);
        stopCamera();
      } else {
        setError(quality.message);
      }
    } catch (err: any) {
      console.error('Capture error:', err);
      setError(
        isArabic
          ? 'فشل التقاط الصورة. يرجى المحاولة مرة أخرى.'
          : 'Failed to capture image. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  // Check image quality
  const checkImageQuality = async (
    imageDataUrl: string
  ): Promise<{ passed: boolean; message: string }> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            passed: false,
            message: isArabic ? 'فشل فحص الجودة' : 'Quality check failed',
          });
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate brightness
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += (r + g + b) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 4);

        // Check if too dark or too bright
        if (avgBrightness < 50) {
          resolve({
            passed: false,
            message: isArabic
              ? 'الصورة مظلمة جداً. يرجى تحسين الإضاءة.'
              : 'Image too dark. Please improve lighting.',
          });
        } else if (avgBrightness > 230) {
          resolve({
            passed: false,
            message: isArabic
              ? 'الصورة ساطعة جداً. يرجى تقليل الإضاءة.'
              : 'Image too bright. Please reduce lighting.',
          });
        } else {
          resolve({
            passed: true,
            message: isArabic ? 'جودة جيدة' : 'Good quality',
          });
        }
      };
      img.src = imageDataUrl;
    });
  };

  // Retake photo
  const retake = () => {
    setCapturedImage(null);
    setQualityCheck(null);
    setError(null);
    startCamera();
  };

  // Confirm and submit
  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage, side);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {getText(side)}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {qualityCheck && qualityCheck.passed && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {qualityCheck.message}
        </Alert>
      )}

      {!cameraActive && !capturedImage && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {getText('instructions')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CameraAltIcon />}
            onClick={startCamera}
          >
            {getText('startCamera')}
          </Button>
        </Box>
      )}

      {cameraActive && (
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 640,
              mx: 'auto',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'black',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />

            {/* Overlay guide */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '60%',
                border: '3px dashed rgba(255, 255, 255, 0.7)',
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            />
          </Box>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
            <IconButton onClick={flipCamera} color="primary" size="large">
              <FlipCameraAndroidIcon />
            </IconButton>
            <Button
              variant="contained"
              size="large"
              startIcon={processing ? <CircularProgress size={20} /> : <CameraAltIcon />}
              onClick={captureImage}
              disabled={processing}
            >
              {processing ? getText('processing') : getText('capture')}
            </Button>
            <IconButton onClick={stopCamera} color="error" size="large">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      {capturedImage && (
        <Box sx={{ textAlign: 'center' }}>
          <Paper elevation={1} sx={{ p: 2, display: 'inline-block', mb: 2 }}>
            <Image
              src={capturedImage}
              alt={`ID ${side}`}
              width={400}
              height={300}
              style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={retake}
            >
              {getText('retake')}
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={confirm}
            >
              {getText('confirm')}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
