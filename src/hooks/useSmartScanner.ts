import { useState, useEffect, useRef } from 'react';

const OPENCV_CDN_PRIORITY = [
  'https://cdn.jsdelivr.net/npm/@opencv/opencv@4.10.0/opencv.js',
  'https://cdnjs.cloudflare.com/ajax/libs/opencv.js/4.10.0/opencv.js',
  'https://unpkg.com/@opencv/opencv@4.10.0/opencv.js'
];

type ScannerLevel = 1 | 2 | 3 | 4;
type ScannerState = 'loading' | 'ready' | 'detecting' | 'locked' | 'error';

/**
 * Progressive smart scanner hook with OpenCV.js integration
 * Implements 4-level progressive enhancement for ID card detection
 * 
 * @returns Scanner state, level, and detection function
 */
export function useSmartScanner() {
  const [level, setLevel] = useState<ScannerLevel>(1);
  const [state, setState] = useState<ScannerState>('loading');
  const cvRef = useRef<any>(null);
  const stableFrameCount = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    loadOpenCVWithFallback()
      .then(() => {
        cvRef.current = (window as any).cv;
        setLevel(2);
        setState('ready');
      })
      .catch(() => {
        // Fallback to level 1 (manual capture only)
        setState('ready');
      });
  }, []);

  /**
   * Attempts to load OpenCV.js from multiple CDN sources with fallback
   * 
   * @returns Promise that resolves when OpenCV is loaded
   */
  async function loadOpenCVWithFallback() {
    for (const url of OPENCV_CDN_PRIORITY) {
      try {
        await loadScript(url, 3000);
        return;
      } catch {
        // Try next CDN
      }
    }
    throw new Error('All CDNs failed');
  }

  /**
   * Loads a script with timeout
   * 
   * @param url - Script URL to load
   * @param timeout - Timeout in milliseconds
   * @returns Promise that resolves when script loads
   */
  function loadScript(url: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      const timer = setTimeout(() => { 
        script.remove(); 
        reject(new Error('Timeout')); 
      }, timeout);
      script.onload = () => { 
        clearTimeout(timer); 
        resolve(); 
      };
      script.onerror = () => { 
        clearTimeout(timer); 
        reject(new Error('Load failed')); 
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Detects ID card in image using OpenCV edge detection and contour analysis
   * 
   * @param imageData - Canvas ImageData to analyze
   * @returns True if card detected and locked, false otherwise
   */
  function detectIDCard(imageData: ImageData): boolean {
    if (!cvRef.current || level < 2) return false;
    const cv = cvRef.current;
    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    try {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.Canny(gray, edges, 50, 150);
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let foundCard = false;
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        const rect = cv.boundingRect(contour);
        const aspectRatio = rect.width / rect.height;
        
        // Egyptian ID card aspect ratio: ~1.586 (85.6mm x 54mm)
        if (area > 5000 && aspectRatio > 1.3 && aspectRatio < 1.9) {
          foundCard = true;
          stableFrameCount.current++;
          break;
        }
      }

      if (!foundCard) stableFrameCount.current = 0;

      const elapsedTime = Date.now() - startTimeRef.current;
      
      // Lock after 10 stable frames or 30 seconds timeout
      if (stableFrameCount.current >= 10 || elapsedTime > 30000) {
        setState('locked');
        
        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(200);
        
        // Audio feedback (Arabic)
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('ثابت');
          utterance.lang = 'ar-EG';
          speechSynthesis.speak(utterance);
        }
        
        return true;
      }

      if (foundCard) setState('detecting');
      return false;
    } finally {
      src.delete();
      gray.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();
    }
  }

  return { level, state, detectIDCard };
}
