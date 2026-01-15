'use client';

import { useRef, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useTranslation } from 'react-i18next';
import { ScanResult } from '@/services/ocr/ocrService';

interface ScanSlotViewProps {
  label: string;
  status: ScanResult | null;
  onScan: (image: Blob) => void;
}

export const ScanSlotView = ({ label, status, onScan }: ScanSlotViewProps) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    // Camera setup 16:9
    const startCamera = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { aspectRatio: 16/9 } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
        }
    };

    startCamera();
      
    return () => {
      // Cleanup stream
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (!canvasRef.current || !videoRef.current) return;
    canvasRef.current.width = 640;
    canvasRef.current.height = 360;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 360);
        canvasRef.current.toBlob(blob => {
            if (blob) onScan(blob);
        }, 'image/jpeg', 0.8);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>{label}</Typography>
        <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: 'black', mb: 1, overflow: 'hidden', borderRadius: 1 }}>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
            />
        </Box>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <Button onClick={capture} variant="contained" fullWidth size="small">{t('wizard.capture')}</Button>
        {status && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={status.imageUrl} width={80} height={45} style={{ borderRadius: 4, objectFit: 'cover', border: '1px solid #eee' }} alt="Scan" />
            {status.valid ? <CheckCircleIcon color="success" fontSize="small" /> : <ErrorIcon color="error" fontSize="small" />}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
