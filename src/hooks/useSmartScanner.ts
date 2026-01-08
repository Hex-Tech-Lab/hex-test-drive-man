import { useState, useEffect, useRef } from 'react';

const OPENCV_CDN_PRIORITY = [
  'https://cdn.jsdelivr.net/npm/@opencv/opencv@4.10.0/opencv.js',
  'https://cdnjs.cloudflare.com/ajax/libs/opencv.js/4.10.0/opencv.js',
  'https://unpkg.com/@opencv/opencv@4.10.0/opencv.js'
];

type ScannerLevel = 1 | 2 | 3 | 4;
type ScannerState = 'loading' | 'ready' | 'detecting' | 'locked' | 'error';

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
        console.log('[Scanner] OpenCV loaded, Level 2 active');
      })
      .catch(() => {
        console.warn('[Scanner] OpenCV unavailable, staying at Level 1');
        setState('ready');
      });
  }, []);

  async function loadOpenCVWithFallback() {
    for (const url of OPENCV_CDN_PRIORITY) {
      try {
        await loadScript(url, 3000);
        return;
      } catch (err) {
        console.warn(`Failed to load OpenCV from ${url}`);
      }
    }
    throw new Error('All OpenCV CDNs failed');
  }

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

        if (area > 5000 && aspectRatio > 1.3 && aspectRatio < 1.9) {
          foundCard = true;
          stableFrameCount.current++;
          break;
        }
      }

      if (!foundCard) {
        stableFrameCount.current = 0;
      }

      const elapsedTime = Date.now() - startTimeRef.current;
      if (stableFrameCount.current >= 10 || elapsedTime > 30000) {
        setState('locked');
        triggerHapticFeedback();
        speakArabic('ثابت');
        return true;
      }

      if (foundCard) {
        setState('detecting');
      }

      return false;
    } finally {
      src.delete();
      gray.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();
    }
  }

  function triggerHapticFeedback() {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
      setLevel(prev => Math.max(prev, 4) as ScannerLevel);
    }
  }

  function speakArabic(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-EG';
      speechSynthesis.speak(utterance);
    }
  }

  return { level, state, detectIDCard };
}
