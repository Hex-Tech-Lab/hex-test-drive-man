'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import { ScanSlotView } from '@/components/ScanSlotView';

/**
 * Document upload step (Step 2)
 * Captures 4 document slots: ID Front/Back, License Front/Back
 * Uses live camera preview and OCR validation
 */
export default function DocumentUploadStep() {
  const { t } = useTranslation();
  
  // Subscribe to store state
  const idFront = useBookingWizardStore((s) => s.idFront);
  const idBack = useBookingWizardStore((s) => s.idBack);
  const licenseFront = useBookingWizardStore((s) => s.licenseFront);
  const licenseBack = useBookingWizardStore((s) => s.licenseBack);
  
  const scanDocument = useBookingWizardStore((s) => s.scanDocument);
  const allValid = useBookingWizardStore((s) => s.allDocumentsValid());

  const slots = [
    { type: 'id', side: 'front', label: t('wizard.idFront'), status: idFront },
    { type: 'id', side: 'back', label: t('wizard.idBack'), status: idBack },
    { type: 'license', side: 'front', label: t('wizard.licenseFront'), status: licenseFront },
    { type: 'license', side: 'back', label: t('wizard.licenseBack'), status: licenseBack }
  ] as const;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('wizard.uploadTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('wizard.uploadDesc')}
      </Typography>

      <Grid container spacing={2}>
        {slots.map(({ type, side, label, status }) => (
          <Grid item xs={12} sm={6} key={`${type}-${side}`}>
            <ScanSlotView
              label={label}
              status={status}
              onScan={(image) => scanDocument(image, type, side)}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Alert severity={allValid ? 'success' : 'warning'}>
          {allValid ? t('wizard.readyToProceed') : t('wizard.completeAllScans')}
        </Alert>
      </Box>
    </Box>
  );
}
