/**
 * Smart Scanner Hook - OpenCV.js Edge Detection & Auto-Capture
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5: Smart Document Capture
 * 
 * Features:
 * - Loads OpenCV.js from CDN (WASM)
 * - Real-time edge detection (Canny)
 * - Document shape detection (4 corners)
 * - Auto-capture on stable frame (10 frames)
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface DocumentShape {
  contour: number[][];
  area: number;
  isValid: boolean;
}

interface UseSmartScannerOptions {
  onCapture?: (imageData: string) => void;
  stabilityFrames?: number;
  minDocumentArea?: number;
}

interface UseSmartScannerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  isStable: boolean;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  manualCapture: () => void;
}

/**
 * Hook for smart document scanning with OpenCV.js
 * Automatically detects and captures document when stable
 */
export function useSmartScanner({
  onCapture,
  stabilityFrames = 10,
  minDocumentArea = 50000
}: UseSmartScannerOptions = {}): UseSmartScannerReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stableFramesRef = useRef<number>(0);
  const lastShapeRef = useRef<DocumentShape | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvLoaded, setCvLoaded] = useState(false);

  // Load OpenCV.js from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if ((window as any).cv) {
      setCvLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;

    script.onload = () => {
      // Wait for cv to be ready
      const checkCV = setInterval(() => {
        if ((window as any).cv && (window as any).cv.Mat) {
          clearInterval(checkCV);
          setCvLoaded(true);
        }
      }, 100);
    };

    script.onerror = () => {
      setError('Failed to load OpenCV.js');
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  /**
   * Detect document shape using edge detection and contour finding
   */
  const detectDocumentShape = useCallback((
    src: any,
    cv: any
  ): DocumentShape | null => {
    try {
      // Convert to grayscale
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Apply Gaussian blur
      const blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

      // Edge detection (Canny)
      const edges = new cv.Mat();
      cv.Canny(blurred, edges, 50, 150);

      // Find contours
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(
        edges,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      // Find largest contour with 4 corners
      let bestContour: any = null;
      let maxArea = minDocumentArea;

      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);

        if (area > maxArea) {
          // Approximate polygon
          const peri = cv.arcLength(contour, true);
          const approx = new cv.Mat();
          cv.approxPolyDP(contour, approx, 0.02 * peri, true);

          // Check if it has 4 corners (document shape)
          if (approx.rows === 4) {
            bestContour = approx;
            maxArea = area;
          } else {
            approx.delete();
          }
        }
      }

      // Cleanup
      gray.delete();
      blurred.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();

      if (bestContour) {
        // Extract corner points
        const corners: number[][] = [];
        for (let i = 0; i < 4; i++) {
          corners.push([
            bestContour.data32S[i * 2],
            bestContour.data32S[i * 2 + 1]
          ]);
        }

        return {
          contour: corners,
          area: maxArea,
          isValid: true
        };
      }

      return null;
    } catch (err) {
      console.error('Document detection error:', err);
      return null;
    }
  }, [minDocumentArea]);

  /**
   * Draw overlay on detected document
   */
  const drawOverlay = useCallback((
    canvas: HTMLCanvasElement,
    shape: DocumentShape | null,
    isStable: boolean
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (shape && shape.isValid) {
      // Draw polyline
      ctx.beginPath();
      ctx.moveTo(shape.contour[0][0], shape.contour[0][1]);
      for (let i = 1; i < shape.contour.length; i++) {
        ctx.lineTo(shape.contour[i][0], shape.contour[i][1]);
      }
      ctx.closePath();

      // Style based on stability
      ctx.strokeStyle = isStable ? '#00ff00' : '#ffff00';
      ctx.lineWidth = isStable ? 4 : 2;
      ctx.stroke();

      // Fill with semi-transparent green when stable
      if (isStable) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.fill();
      }
    }
  }, []);

  /**
   * Check if shape is stable (similar to previous frame)
   */
  const isShapeStable = useCallback((
    current: DocumentShape | null,
    previous: DocumentShape | null
  ): boolean => {
    if (!current || !previous) return false;

    // Compare area (within 10% tolerance)
    const areaDiff = Math.abs(current.area - previous.area) / previous.area;
    if (areaDiff > 0.1) return false;

    // Compare corner positions (within 20px tolerance)
    for (let i = 0; i < 4; i++) {
      const dx = Math.abs(current.contour[i][0] - previous.contour[i][0]);
      const dy = Math.abs(current.contour[i][1] - previous.contour[i][1]);
      if (dx > 20 || dy > 20) return false;
    }

    return true;
  }, []);

  /**
   * Process video frame
   */
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cvLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const cv = (window as any).cv;

    if (!cv || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      // Set canvas size to match video
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Create Mat from video
      const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      src.data.set(imageData.data);

      // Detect document shape
      const shape = detectDocumentShape(src, cv);

      // Check stability
      const stable = isShapeStable(shape, lastShapeRef.current);

      if (stable) {
        stableFramesRef.current++;
        
        if (stableFramesRef.current >= stabilityFrames) {
          setIsStable(true);
          
          // Auto-capture after stability threshold
          if (onCapture && shape) {
            // Capture the frame
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = canvas.width;
            captureCanvas.height = canvas.height;
            const captureCtx = captureCanvas.getContext('2d');
            if (captureCtx) {
              captureCtx.drawImage(video, 0, 0);
              const imageData = captureCanvas.toDataURL('image/jpeg', 0.95);
              onCapture(imageData);
            }
          }
        }
      } else {
        stableFramesRef.current = 0;
        setIsStable(false);
      }

      // Draw overlay
      drawOverlay(canvas, shape, stableFramesRef.current >= stabilityFrames);

      // Store current shape
      lastShapeRef.current = shape;

      // Cleanup
      src.delete();
    } catch (err) {
      console.error('Frame processing error:', err);
    }

    // Continue processing
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [cvLoaded, detectDocumentShape, isShapeStable, drawOverlay, stabilityFrames, onCapture]);

  /**
   * Start camera and scanning
   */
  const startScanning = useCallback(async () => {
    try {
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsReady(true);

        // Start processing frames
        processFrame();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(err.message || 'Failed to access camera');
    }
  }, [processFrame]);

  /**
   * Stop scanning and release camera
   */
  const stopScanning = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Reset video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
    setIsStable(false);
    stableFramesRef.current = 0;
    lastShapeRef.current = null;
  }, []);

  /**
   * Manual capture (bypass auto-capture)
   */
  const manualCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !onCapture) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      onCapture(imageData);
    }
  }, [onCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    videoRef,
    canvasRef,
    isReady,
    isStable,
    error,
    startScanning,
    stopScanning,
    manualCapture
  };
}
