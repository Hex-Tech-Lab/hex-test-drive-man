import { useState, useEffect, useRef } from 'react';

const OPENCV_CDN_PRIORITY = [
  'https://cdn.jsdelivr.net/npm/@opencv/opencv@4.10.0/opencv.js',
  'https://cdnjs.cloudflare.com/ajax/libs/opencv.js/4.10.0/opencv.js',
  'https://unpkg.com/@opencv/opencv@4.10.0/opencv.js'
];

type ScannerLevel = 1 | 2 | 3 | 4;
type ScannerState = 'loading' | 'ready' | 'detecting' | 'locked' | 'error';

// Detection thresholds
const MIN_CARD_AREA = 5000;
const MIN_ASPECT_RATIO = 1.3;
const MAX_ASPECT_RATIO = 1.9;
const STABLE_FRAME_THRESHOLD = 10;
const DETECTION_TIMEOUT = 30000;
const CANNY_THRESHOLD_1 = 50;
const CANNY_THRESHOLD_2 = 150;

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
  const stateRef = useRef<ScannerState>('loading');

  // Sync state ref with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
    
    // Cleanup: remove OpenCV script on unmount
    return () => {
      const scripts = document.querySelectorAll('script[src*="opencv"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  /**
   * Attempts to load OpenCV.js from multiple CDN sources with fallback
   * 
   * @returns Promise that resolves when OpenCV is loaded
   */
  async function loadOpenCVWithFallback() {
    for (const url of OPENCV_CDN_PRIORITY) {
      try {
        console.log(`Attempting to load OpenCV from: ${url}`);
        await loadScript(url, 3000);
        console.log(`Successfully loaded OpenCV from: ${url}`);
        return;
      } catch (error) {
        console.warn(`Failed to load OpenCV from ${url}:`, error);
        // Try next CDN
      }
    }
    console.error('All OpenCV CDNs failed');
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
   * Magic numbers explained:
   * - Canny thresholds (50, 150): Standard edge detection values for ID cards
   * - Area threshold (5000): Minimum pixels for ID card at 720p
   * - Aspect ratio (1.3-1.9): Egyptian ID card is 1.586 (85.6mm x 54mm) with tolerance
   * - Stable frames (10): Ensures card is steady before capture
   * - Timeout (30s): Fallback to manual capture if auto-detection fails
   * 
   * @param imageData - Canvas ImageData to analyze
   * @returns True if card detected and locked, false otherwise
   */
  function detectIDCard(imageData: ImageData): boolean {
    if (!cvRef.current || level < 2) return false;
    const cv = cvRef.current;
    
    // Wrap OpenCV operations in try-catch to handle errors gracefully
    let src, gray, edges, contours, hierarchy;
    
    try {
      src = cv.matFromImageData(imageData);
      gray = new cv.Mat();
      edges = new cv.Mat();
      contours = new cv.MatVector();
      hierarchy = new cv.Mat();

      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.Canny(gray, edges, CANNY_THRESHOLD_1, CANNY_THRESHOLD_2);
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let foundCard = false;
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        const rect = cv.boundingRect(contour);
        const aspectRatio = rect.width / rect.height;
        
        // Egyptian ID card aspect ratio: ~1.586 (85.6mm x 54mm)
        if (area > MIN_CARD_AREA && aspectRatio > MIN_ASPECT_RATIO && aspectRatio < MAX_ASPECT_RATIO) {
          foundCard = true;
          stableFrameCount.current++;
          break;
        }
      }

      if (!foundCard) stableFrameCount.current = 0;

      const elapsedTime = Date.now() - startTimeRef.current;
      
      // Lock after stable frames or timeout
      if (stableFrameCount.current >= STABLE_FRAME_THRESHOLD || elapsedTime > DETECTION_TIMEOUT) {
        if (stateRef.current !== 'locked') {
          setState('locked');
          
          // Haptic feedback
          if ('vibrate' in navigator) navigator.vibrate(200);
          
          // Audio feedback (Arabic)
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('ثابت');
            utterance.lang = 'ar-EG';
            speechSynthesis.speak(utterance);
          }
        }
        return true;
      }

      if (foundCard && stateRef.current !== 'detecting') {
        setState('detecting');
      }
      return false;
    } catch (error) {
      console.error('OpenCV detection error:', error);
      // Gracefully degrade to level 1 on OpenCV errors
      setLevel(1);
      setState('ready');
      return false;
    } finally {
      // Clean up OpenCV matrices to prevent memory leaks
      if (src) src.delete();
      if (gray) gray.delete();
      if (edges) edges.delete();
      if (contours) contours.delete();
      if (hierarchy) hierarchy.delete();
    }
  }

  return { level, state, detectIDCard };
}
