'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Alert, Grid } from '@mui/material';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import { ScanSlotButton } from '@/components/ScanSlotButton';
import { ScanModal } from '@/components/ScanModal';

export default function DocumentUploadStep() {
  const { t } = useTranslation();
  
  const idFront = useBookingWizardStore((s) => s.idFront);
  const idBack = useBookingWizardStore((s) => s.idBack);
  const licenseFront = useBookingWizardStore((s) => s.licenseFront);
  const licenseBack = useBookingWizardStore((s) => s.licenseBack);
  
  const scanDocument = useBookingWizardStore((s) => s.scanDocument);
  const allValid = useBookingWizardStore((s) => s.allDocumentsValid());

  // Use string IDs for state management
  const [activeSlotId, setActiveSlotId] = useState<'id-front' | 'id-back' | 'license-front' | 'license-back' | null>(null);

  const slots = [
    { id: 'id-front', type: 'id', side: 'front', label: t('wizard.idFront'), status: idFront },
    { id: 'id-back', type: 'id', side: 'back', label: t('wizard.idBack'), status: idBack },
    { id: 'license-front', type: 'license', side: 'front', label: t('wizard.licenseFront'), status: licenseFront },
    { id: 'license-back', type: 'license', side: 'back', label: t('wizard.licenseBack'), status: licenseBack }
  ] as const;

  const handleCapture = (blob: Blob) => {
    if (!activeSlotId) return;
    
    const slot = slots.find(s => s.id === activeSlotId);
    if (slot) {
      scanDocument(blob, slot.type, slot.side);
      setActiveSlotId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{t('wizard.uploadTitle')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t('wizard.uploadDesc')}</Typography>

      <Grid container spacing={2}>
        {slots.map((slot) => (
          <Grid item xs={6} key={slot.id}>
            <ScanSlotButton
              slot={{ id: slot.id, label: slot.label }}
              active={activeSlotId === slot.id}
              status={slot.status}
              onActivate={() => setActiveSlotId(slot.id)}
            />
          </Grid>
        ))}
      </Grid>

      {activeSlotId && (
        <ScanModal 
          slot={activeSlotId}
          onCapture={handleCapture}
          onClose={() => setActiveSlotId(null)}
        />
      )}

      <Box sx={{ mt: 3 }}>
        <Alert severity={allValid ? 'success' : 'warning'}>
          {allValid ? t('wizard.readyToProceed') : t('wizard.completeAllScans')}
        </Alert>
      </Box>
    </Box>
  );
}