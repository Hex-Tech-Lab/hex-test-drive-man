'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Alert, Grid, Snackbar } from '@mui/material';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import { ScanSlotButton } from '@/components/ScanSlotButton';
import { ScanModal } from '@/components/ScanModal';
import type { ScanResult } from '@/services/ocr/ocrService';

type DocField = 'idFront' | 'idBack' | 'licenseFront' | 'licenseBack';

export default function DocumentUploadStep() {
  const { t } = useTranslation();

  const idFront = useBookingWizardStore((s) => s.idFront);
  const idBack = useBookingWizardStore((s) => s.idBack);
  const licenseFront = useBookingWizardStore((s) => s.licenseFront);
  const licenseBack = useBookingWizardStore((s) => s.licenseBack);

  const scanDocument = useBookingWizardStore((s) => s.scanDocument);
  const resetDocument = useBookingWizardStore((s) => s.resetDocument);

  // Fix #1: Compute allValid from primitives, not via function call in selector
  // This prevents stale state and unnecessary re-renders (Zustand best practice)
  const allValid = useMemo(() => {
    return [idFront, idBack, licenseFront, licenseBack].every(doc => doc?.valid === true);
  }, [idFront, idBack, licenseFront, licenseBack]);

  // Fix #4: Prevent duplicate scans during async operation
  const [isScanning, setIsScanning] = useState(false);

  // Fix #5: Error snackbar state (using MUI Snackbar, project pattern)
  const [errorSnackbar, setErrorSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  });

  // Use string IDs for state management
  const [activeSlotId, setActiveSlotId] = useState<'id-front' | 'id-back' | 'license-front' | 'license-back' | null>(null);

  // Type-safe document field map
  const docFieldMap: Record<string, ScanResult | null> = {
    idFront,
    idBack,
    licenseFront,
    licenseBack
  };

  const slots = [
    { id: 'id-front', type: 'id', side: 'front', label: t('wizard.idFront'), status: idFront },
    { id: 'id-back', type: 'id', side: 'back', label: t('wizard.idBack'), status: idBack },
    { id: 'license-front', type: 'license', side: 'front', label: t('wizard.licenseFront'), status: licenseFront },
    { id: 'license-back', type: 'license', side: 'back', label: t('wizard.licenseBack'), status: licenseBack }
  ] as const;

  // Helper to get document field key from type and side
  const getDocFieldKey = (type: 'id' | 'license', side: 'front' | 'back'): DocField => {
    return `${type}${side.charAt(0).toUpperCase() + side.slice(1)}` as DocField;
  };

  // Fix #4: Async guard prevents duplicate scans from rapid taps
  // Fix #5: Surface errors to user via snackbar
  const handleCapture = async (blob: Blob) => {
    if (!activeSlotId || isScanning) return;

    const slot = slots.find(s => s.id === activeSlotId);
    if (!slot) return;

    setIsScanning(true);
    try {
      // Fix #3: Revoke existing blob URL before creating new one (memory leak prevention)
      const fieldKey = getDocFieldKey(slot.type, slot.side);
      const existingDoc = docFieldMap[fieldKey];
      if (existingDoc?.imageUrl) {
        resetDocument(fieldKey);
      }

      const result = await scanDocument(blob, slot.type, slot.side);

      if (!result.success) {
        // Fix #5: Surface error to user
        setErrorSnackbar({
          open: true,
          message: result.error || t('wizard.scanFailed')
        });
      }

      setActiveSlotId(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSnackbarClose = () => {
    setErrorSnackbar(prev => ({ ...prev, open: false }));
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

      {/* Fix #5: Error notification snackbar */}
      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {errorSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
