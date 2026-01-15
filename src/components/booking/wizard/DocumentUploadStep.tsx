'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useBookingWizardStore } from '@/stores/useBookingWizardStore';
import { SmartScanner } from '@/components/scanner/SmartScanner';

/**
 * Document upload step (Step 2)
 * Captures National ID and Driver's License using SmartScanner
 * Extracts data via OCR for confirmation step
 */
export default function DocumentUploadStep() {
  const { t, i18n } = useTranslation();
  // Use primitive selectors
  const documents = useBookingWizardStore((s) => s.documents);
  const setDocuments = useBookingWizardStore((s) => s.setDocuments);

  const [scanningNationalId, setScanningNationalId] = useState(false);
  const [scanningLicense, setScanningLicense] = useState(false);

  /**
   * Convert base64 data URL to File object
   */
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  /**
   * Handle National ID scan completion
   */
  const handleNationalIdScan = (result: {
    imageData: string;
    data: { nationalId?: string; name?: string };
  }) => {
    const file = dataURLtoFile(result.imageData, 'national-id.jpg');
    setDocuments({
      nationalId: file,
      extractedData: {
        ...documents.extractedData,
        nationalIdNumber: result.data.nationalId || null,
        name: result.data.name || null,
      },
    });
    setScanningNationalId(false);
  };

  /**
   * Handle Driver's License scan completion
   */
  const handleLicenseScan = (result: {
    imageData: string;
    data: { nationalId?: string; name?: string };
  }) => {
    const file = dataURLtoFile(result.imageData, 'drivers-license.jpg');
    setDocuments({
      driversLicense: file,
    });
    setScanningLicense(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('wizard.uploadTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('wizard.uploadDesc')}
      </Typography>

      <Grid container spacing={3}>
        {/* National ID */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('wizard.idLabel')}
              </Typography>

              {!documents.nationalId && !scanningNationalId && (
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  onClick={() => setScanningNationalId(true)}
                >
                  {t('wizard.scanID')}
                </Button>
              )}

              {scanningNationalId && (
                <Box>
                  <SmartScanner
                    mode="front"
                    onScanComplete={handleNationalIdScan}
                    language={i18n.language as 'en' | 'ar'}
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningNationalId(false)}
                    sx={{ mt: 2 }}
                  >
                    {t('common.cancel')}
                  </Button>
                </Box>
              )}

              {documents.nationalId && !scanningNationalId && (
                <Box>
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    {t('wizard.idCaptured')}
                  </Alert>
                  {documents.extractedData.nationalIdNumber && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {t('wizard.idNumberLabel')}: {documents.extractedData.nationalIdNumber}
                    </Typography>
                  )}
                  {documents.extractedData.name && (
                    <Typography variant="body2">
                      {t('wizard.nameLabel')}: {documents.extractedData.name}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningNationalId(true)}
                    sx={{ mt: 2 }}
                  >
                    {t('wizard.retake')}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Driver's License */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('wizard.licenseLabel')}
              </Typography>

              {!documents.driversLicense && !scanningLicense && (
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  onClick={() => setScanningLicense(true)}
                >
                  {t('wizard.scanLicense')}
                </Button>
              )}

              {scanningLicense && (
                <Box>
                  <SmartScanner
                    mode="front"
                    onScanComplete={handleLicenseScan}
                    language={i18n.language as 'en' | 'ar'}
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningLicense(false)}
                    sx={{ mt: 2 }}
                  >
                    {t('common.cancel')}
                  </Button>
                </Box>
              )}

              {documents.driversLicense && !scanningLicense && (
                <Box>
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    {t('wizard.licenseCaptured')}
                  </Alert>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningLicense(true)}
                    sx={{ mt: 2 }}
                  >
                    {t('wizard.retake')}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {documents.nationalId && documents.driversLicense && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {t('wizard.allUploaded')}
        </Alert>
      )}
    </Box>
  );
}