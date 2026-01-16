'use client';

import { Card, CardContent, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { ScanResult } from '@/services/ocr/ocrService';

interface Props {
  slot: { id: string; label: string };
  active: boolean;
  status: ScanResult | null;
  onActivate: () => void;
}

export const ScanSlotButton = ({ slot, active, status, onActivate }: Props) => (
  <Card 
    onClick={onActivate} 
    sx={{ 
      opacity: active ? 1 : 0.9, 
      cursor: 'pointer', 
      height: '100%', 
      border: active ? '2px solid #1976d2' : '1px solid #eee',
      transition: 'all 0.2s'
    }}
  >
    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
      <Typography variant="subtitle2" gutterBottom align="center" noWrap>{slot.label}</Typography>
      {status?.imageUrl ? (
        <img src={status.imageUrl} width={80} height={45} style={{ borderRadius: 4, objectFit: 'cover', marginBottom: 8 }} alt="Scan" />
      ) : (
        <CameraAltIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
      )}
      {status ? (
        status.valid ? <CheckCircleIcon color="success" fontSize="small" /> : <ErrorIcon color="error" fontSize="small" />
      ) : (
        <Typography variant="caption" color="text.secondary">Tap to Scan</Typography>
      )}
    </CardContent>
  </Card>
);
