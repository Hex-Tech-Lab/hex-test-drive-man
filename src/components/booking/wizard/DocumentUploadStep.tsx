'use client';

import { useState } from 'react';
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
        Upload Identity Documents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please capture clear photos of your National ID and Driver&apos;s
        License
      </Typography>

      <Grid container spacing={3}>
        {/* National ID */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                National ID
              </Typography>

              {!documents.nationalId && !scanningNationalId && (
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  onClick={() => setScanningNationalId(true)}
                >
                  Capture National ID
                </Button>
              )}

              {scanningNationalId && (
                <Box>
                  <SmartScanner
                    mode="front"
                    onScanComplete={handleNationalIdScan}
                    language="en"
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningNationalId(false)}
                    sx={{ mt: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}

              {documents.nationalId && !scanningNationalId && (
                <Box>
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    National ID captured
                  </Alert>
                  {documents.extractedData.nationalIdNumber && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ID: {documents.extractedData.nationalIdNumber}
                    </Typography>
                  )}
                  {documents.extractedData.name && (
                    <Typography variant="body2">
                      Name: {documents.extractedData.name}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningNationalId(true)}
                    sx={{ mt: 2 }}
                  >
                    Retake
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
                Driver&apos;s License
              </Typography>

              {!documents.driversLicense && !scanningLicense && (
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  onClick={() => setScanningLicense(true)}
                >
                  Capture Driver&apos;s License
                </Button>
              )}

              {scanningLicense && (
                <Box>
                  <SmartScanner
                    mode="front"
                    onScanComplete={handleLicenseScan}
                    language="en"
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningLicense(false)}
                    sx={{ mt: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}

              {documents.driversLicense && !scanningLicense && (
                <Box>
                  <Alert severity="success" icon={<CheckCircleIcon />}>
                    Driver&apos;s License captured
                  </Alert>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setScanningLicense(true)}
                    sx={{ mt: 2 }}
                  >
                    Retake
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {documents.nationalId && documents.driversLicense && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Both documents uploaded successfully. Click Next to proceed.
        </Alert>
      )}
    </Box>
  );
}
