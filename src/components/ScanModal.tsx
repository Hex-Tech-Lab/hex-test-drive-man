'use client';

import { useRef, useEffect, useState } from 'react';
import { Modal, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  slot: string;
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export const ScanModal = ({ slot, onCapture, onClose }: Props) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',  // BACK CAMERA ONLY
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setLoading(false);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError(t('common.error'));
        setLoading(false);
      }
    };
    
    startCamera();
    
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [slot, t]);

  const capture = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        if (blob) onCapture(blob);
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'black', zIndex: 1300 }}>
        {loading && <Box sx={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}
        
        {error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'white', gap: 2 }}>
            <Typography variant="h6">{error}</Typography>
            <Button onClick={onClose} variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
              {t('common.cancel')}
            </Button>
          </Box>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: loading ? 'none' : 'block' }} 
            />
            
            {/* Overlay Guide */}
            <Box sx={{ 
              position: 'absolute', top: '20%', left: '10%', right: '10%', bottom: '30%', 
              border: '2px solid white', borderRadius: 2, pointerEvents: 'none',
              boxShadow: '0 0 0 100vmax rgba(0,0,0,0.5)' // Dim outside
            }} />

            <Box sx={{ position: 'absolute', bottom: 50, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 2, p: 2 }}>
              <Button onClick={onClose} variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={capture} variant="contained" size="large" sx={{ minWidth: 120 }} disabled={loading}>
                {t('wizard.capture')}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};