/**
 * Document and Face Verification Page
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Face Matching
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Upload, CameraAlt } from '@mui/icons-material';
import FaceVerification from '@/components/FaceVerification';
import {
  registerServiceWorker,
  preCacheModels,
  isOffline,
  checkStorageQuota,
  formatBytes,
} from '@/lib/serviceWorker';
import { createAppError, getUserErrorMessage, logError } from '@/lib/errorHandling';

const steps = ['Upload ID', 'Face Verification', 'Complete'];

export default function DocumentVerifyPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const locale = (params.locale as string) || 'en';

  const [activeStep, setActiveStep] = useState(0);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  // Initialize service worker and check storage
  useEffect(() => {
    const init = async () => {
      try {
        // Register service worker
        await registerServiceWorker();

        // Pre-cache face detection models
        await preCacheModels();

        // Check storage quota
        const quota = await checkStorageQuota();
        if (quota.percentage > 80) {
          setStorageWarning(true);
        }

        // Check offline status
        setOffline(isOffline());

        // Listen for online/offline events
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    init();
  }, []);

  // Handle ID file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIdFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setIdPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload ID
  const handleUploadID = async () => {
    if (!idFile) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', idFile);
      formData.append('bookingId', bookingId);

      const response = await fetch('/api/upload-id', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      // Move to face verification step
      setActiveStep(1);
    } catch (err) {
      const appError = createAppError(err);
      setError(getUserErrorMessage(err, locale));
      logError(appError, { bookingId, step: 'upload-id' });
    } finally {
      setUploading(false);
    }
  };

  // Handle face verification complete
  const handleFaceVerificationComplete = async (similarity: number) => {
    try {
      setError(null);

      // Save verification result
      const response = await fetch(`/api/bookings/${bookingId}/face-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ similarity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification failed');
      }

      // Move to complete step
      setActiveStep(2);

      // Redirect to OTP verification after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/bookings/${bookingId}/verify`);
      }, 2000);
    } catch (err) {
      const appError = createAppError(err);
      setError(getUserErrorMessage(err, locale));
      logError(appError, { bookingId, step: 'face-verify', similarity });
    }
  };

  // Handle skip face verification
  const handleSkipFaceVerification = () => {
    router.push(`/${locale}/bookings/${bookingId}/verify`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Offline Warning */}
      {offline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are offline. Some features may not work properly.
        </Alert>
      )}

      {/* Storage Warning */}
      {storageWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Storage space is running low. Please free up space to ensure smooth operation.
        </Alert>
      )}

      {/* Stepper */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step 0: Upload ID */}
      {activeStep === 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Upload National ID
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please upload a clear photo of your National ID
          </Typography>

          {/* File Input */}
          <Box sx={{ mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="id-file-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="id-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                fullWidth
                size="large"
              >
                Select ID Photo
              </Button>
            </label>
          </Box>

          {/* Preview */}
          {idPreview && (
            <Box
              sx={{
                mb: 3,
                textAlign: 'center',
              }}
            >
              <img
                src={idPreview}
                alt="ID Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 400,
                  borderRadius: 8,
                }}
              />
            </Box>
          )}

          {/* Upload Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleUploadID}
            disabled={!idFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
          >
            {uploading ? 'Uploading...' : 'Upload & Continue'}
          </Button>
        </Paper>
      )}

      {/* Step 1: Face Verification */}
      {activeStep === 1 && (
        <FaceVerification
          idImageFile={idFile}
          onVerificationComplete={handleFaceVerificationComplete}
          onSkip={handleSkipFaceVerification}
          locale={locale}
        />
      )}

      {/* Step 2: Complete */}
      {activeStep === 2 && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Verification Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Redirecting to OTP verification...
          </Typography>
          <CircularProgress />
        </Paper>
      )}
    </Container>
  );
}
