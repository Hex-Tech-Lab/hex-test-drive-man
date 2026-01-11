/**
 * Face detection and matching utilities using face-api.js
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Face Matching
 */

import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models from public directory
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Failed to load face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
}

/**
 * Detect face in an image and extract descriptor
 */
export async function detectFace(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    return detection.descriptor;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

/**
 * Calculate similarity between two face descriptors
 * Returns a value between 0 and 1 (1 = identical, 0 = completely different)
 */
export function calculateSimilarity(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  // Convert distance to similarity score (0-1 range)
  // Typical face match threshold is around 0.6 distance
  // We invert and normalize to get similarity percentage
  const similarity = Math.max(0, 1 - distance / 0.6);
  return Math.min(1, similarity);
}

/**
 * Check if two faces match with a given threshold
 */
export function facesMatch(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold: number = 0.85
): boolean {
  const similarity = calculateSimilarity(descriptor1, descriptor2);
  return similarity >= threshold;
}

/**
 * Extract face from image file and return descriptor
 */
export async function extractFaceFromFile(file: File): Promise<{
  descriptor: Float32Array | null;
  imageUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = async () => {
          const descriptor = await detectFace(img);
          resolve({
            descriptor,
            imageUrl: e.target?.result as string,
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Capture face from video stream
 */
export async function captureFaceFromVideo(
  video: HTMLVideoElement
): Promise<Float32Array | null> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0);

  return await detectFace(canvas);
}

/**
 * Get user media stream for camera access
 */
export async function getUserMediaStream(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
      audio: false,
    });

    return stream;
  } catch (error) {
    console.error('Camera access error:', error);
    throw new Error('Camera access denied or not available');
  }
}

/**
 * Stop media stream
 */
export function stopMediaStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
