'use client';
import { useRef, useEffect, useState } from 'react';
import { Box, Alert, Button, Typography, CircularProgress } from '@mui/material';
import { useSmartScanner } from '@/hooks/useSmartScanner';

interface SmartScannerProps {
  onCapture: (imageBlob: Blob) => void;
  side: 'front' | 'back';
}

export function SmartScanner({ onCapture, side }: SmartScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { level, state, detectIDCard } = useSmartScanner();
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

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
      console.error('[Scanner] Camera error:', err);
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }

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
        canvas.toBlob(blob => {
          if (blob) onCapture(blob);
        }, 'image/jpeg', 0.9);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    processFrame();
  }

  function manualCapture() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (blob) onCapture(blob);
    }, 'image/jpeg', 0.9);
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 640, mx: 'auto' }}>
      {state === 'loading' && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            Initializing Smart Scanner...
          </Typography>
        </Box>
      )}

      <video
        ref={videoRef}
        style={{ width: '100%', display: state === 'loading' ? 'none' : 'block' }}
        playsInline
      />
      
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Scanner Level: {level}/4 | Status: {state}
        </Typography>
        <Button onClick={manualCapture} variant="outlined" sx={{ mt: 1 }}>
          Manual Capture
        </Button>
      </Box>
    </Box>
  );
}
