/**
 * Face Verification Component
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Face Matching
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  CameraAlt,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
} from '@mui/icons-material';
import {
  loadFaceModels,
  extractFaceFromFile,
  captureFaceFromVideo,
  getUserMediaStream,
  stopMediaStream,
  calculateSimilarity,
} from '@/lib/faceDetection';

interface FaceVerificationProps {
  idImageFile: File | null;
  onVerificationComplete: (similarity: number) => void;
  onSkip?: () => void;
  locale: string;
}

const translations = {
  en: {
    title: 'Face Verification',
    subtitle: 'Take a selfie to verify your identity',
    loading: 'Loading face detection models...',
    extracting: 'Extracting face from ID...',
    cameraAccess: 'Requesting camera access...',
    captureSelfie: 'Capture Selfie',
    retake: 'Retake',
    verify: 'Verify Match',
    skip: 'Skip (Optional)',
    noFaceInId: 'No face detected in ID photo. Please upload a clear ID photo.',
    noFaceInSelfie: 'No face detected in selfie. Please try again.',
    cameraError: 'Camera access denied or not available.',
    matchSuccess: 'Face verified successfully!',
    matchFailed: 'Faces do not match. Please try again.',
    similarity: 'Match confidence',
    threshold: 'Required: 85%',
  },
  ar: {
    title: 'التحقق من الوجه',
    subtitle: 'التقط صورة شخصية للتحقق من هويتك',
    loading: 'جاري تحميل نماذج كشف الوجه...',
    extracting: 'جاري استخراج الوجه من البطاقة...',
    cameraAccess: 'جاري طلب الوصول للكاميرا...',
    captureSelfie: 'التقط صورة',
    retake: 'إعادة التقاط',
    verify: 'تحقق من التطابق',
    skip: 'تخطي (اختياري)',
    noFaceInId: 'لم يتم اكتشاف وجه في صورة البطاقة. يرجى تحميل صورة واضحة.',
    noFaceInSelfie: 'لم يتم اكتشاف وجه في الصورة الشخصية. يرجى المحاولة مرة أخرى.',
    cameraError: 'تم رفض الوصول للكاميرا أو غير متاح.',
    matchSuccess: 'تم التحقق من الوجه بنجاح!',
    matchFailed: 'الوجوه غير متطابقة. يرجى المحاولة مرة أخرى.',
    similarity: 'نسبة التطابق',
    threshold: 'المطلوب: 85%',
  },
};

export default function FaceVerification({
  idImageFile,
  onVerificationComplete,
  onSkip,
  locale,
}: FaceVerificationProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idFaceDescriptor, setIdFaceDescriptor] = useState<Float32Array | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieDescriptor, setSelfieDescriptor] = useState<Float32Array | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load models and extract face from ID
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load face detection models
        await loadFaceModels();

        // Extract face from ID image
        if (idImageFile) {
          const { descriptor } = await extractFaceFromFile(idImageFile);

          if (!descriptor) {
            setError(t.noFaceInId);
            setLoading(false);
            return;
          }

          setIdFaceDescriptor(descriptor);
        }

        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        setLoading(false);
      }
    };

    initialize();
  }, [idImageFile, t.noFaceInId]);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await getUserMediaStream();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(t.cameraError);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  // Capture selfie
  const captureSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setError(null);

      // Draw video frame to canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);

      // Detect face in captured image
      const descriptor = await captureFaceFromVideo(video);

      if (!descriptor) {
        setError(t.noFaceInSelfie);
        return;
      }

      setSelfieDescriptor(descriptor);
      setSelfieCaptured(true);
      stopCamera();
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture selfie');
    }
  };

  // Retake selfie
  const retakeSelfie = () => {
    setSelfieCaptured(false);
    setSelfieDescriptor(null);
    setSimilarity(null);
    startCamera();
  };

  // Verify faces match
  const verifyMatch = async () => {
    if (!idFaceDescriptor || !selfieDescriptor) return;

    try {
      setVerifying(true);
      setError(null);

      // Calculate similarity
      const matchScore = calculateSimilarity(idFaceDescriptor, selfieDescriptor);
      setSimilarity(matchScore);

      // Check if match meets threshold
      if (matchScore >= 0.85) {
        onVerificationComplete(matchScore);
      } else {
        setError(t.matchFailed);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify faces');
    } finally {
      setVerifying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t.loading}</Typography>
      </Box>
    );
  }

  if (error && !idFaceDescriptor) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t.subtitle}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Video/Canvas Display */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          mx: 'auto',
          mb: 3,
          aspectRatio: '4/3',
          bgcolor: 'grey.900',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cameraActive && !selfieCaptured ? 'block' : 'none',
          }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: selfieCaptured ? 'block' : 'none',
          }}
        />
        {!cameraActive && !selfieCaptured && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <CameraAlt sx={{ fontSize: 64, color: 'grey.600' }} />
          </Box>
        )}
      </Box>

      {/* Similarity Score */}
      {similarity !== null && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2">{t.similarity}</Typography>
            <Typography variant="body2" fontWeight="bold">
              {(similarity * 100).toFixed(1)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={similarity * 100}
            color={similarity >= 0.85 ? 'success' : 'error'}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {t.threshold}
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Stack spacing={2}>
        {!cameraActive && !selfieCaptured && (
          <Button
            variant="contained"
            size="large"
            startIcon={<CameraAlt />}
            onClick={startCamera}
            fullWidth
          >
            {t.captureSelfie}
          </Button>
        )}

        {cameraActive && !selfieCaptured && (
          <Button
            variant="contained"
            size="large"
            startIcon={<CameraAlt />}
            onClick={captureSelfie}
            fullWidth
          >
            {t.captureSelfie}
          </Button>
        )}

        {selfieCaptured && !similarity && (
          <>
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={verifyMatch}
              disabled={verifying}
              fullWidth
            >
              {verifying ? 'Verifying...' : t.verify}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Refresh />}
              onClick={retakeSelfie}
              fullWidth
            >
              {t.retake}
            </Button>
          </>
        )}

        {similarity !== null && similarity < 0.85 && (
          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={retakeSelfie}
            fullWidth
          >
            {t.retake}
          </Button>
        )}

        {onSkip && (
          <Button variant="text" onClick={onSkip} fullWidth>
            {t.skip}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
