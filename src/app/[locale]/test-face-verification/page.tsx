/**
 * Face Verification Test Page
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5 Phase 2: Testing
 */

'use client';

import { useState } from 'react';
import { Container, Typography, Paper, Box, Alert } from '@mui/material';
import FaceVerification from '@/components/FaceVerification';

/**
 *
 */
export default function TestFaceVerificationPage() {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ similarity: number } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIdFile(file);
      setResult(null);
    }
  };

  const handleVerificationComplete = (similarity: number) => {
    setResult({ similarity });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom>
        Face Verification Test
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Step 1: Upload ID Photo
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ marginBottom: 16 }}
        />
      </Paper>

      {idFile && (
        <Box sx={{ mb: 3 }}>
          <FaceVerification
            idImageFile={idFile}
            onVerificationComplete={handleVerificationComplete}
            locale="en"
          />
        </Box>
      )}

      {result && (
        <Alert severity="success">
          Face verified! Similarity: {(result.similarity * 100).toFixed(1)}%
        </Alert>
      )}
    </Container>
  );
}
