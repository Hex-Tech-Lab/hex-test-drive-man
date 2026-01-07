// National ID upload component with Egyptian ID validation
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Image from 'next/image';

interface IDUploadProps {
  onUploadComplete: (nationalId: string, imageUrl: string) => void;
  language?: 'en' | 'ar';
}

/**
 * Component for uploading National ID with Egyptian format validation
 * Validates 14-digit Egyptian National ID format
 * Accepts: image/jpeg, image/png (max 5MB)
 */
export default function IDUpload({ onUploadComplete, language = 'en' }: IDUploadProps) {
  const [nationalId, setNationalId] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isArabic = language === 'ar';

  // Validate Egyptian National ID (14 digits)
  const validateNationalId = (id: string): boolean => {
    const regex = /^\d{14}$/;
    return regex.test(id);
  };

  const handleNationalIdChange = (value: string) => {
    setNationalId(value);
    
    if (value && !validateNationalId(value)) {
      setIdError(
        isArabic
          ? 'الرقم القومي يجب أن يكون 14 رقماً'
          : 'National ID must be 14 digits'
      );
    } else {
      setIdError(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      setUploadError(
        isArabic
          ? 'يرجى اختيار صورة بصيغة JPG أو PNG'
          : 'Please select a JPG or PNG image'
      );
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError(
        isArabic
          ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت'
          : 'File size must be less than 5MB'
      );
      return;
    }

    setFile(selectedFile);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !nationalId || idError) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nationalId', nationalId);

      // Upload to API endpoint
      const response = await fetch('/api/upload-id', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Call parent callback with results
      onUploadComplete(nationalId, data.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(
        isArabic
          ? 'فشل رفع الصورة. يرجى المحاولة مرة أخرى'
          : 'Failed to upload image. Please try again'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isArabic ? 'رفع البطاقة الشخصية' : 'Upload National ID'}
      </Typography>

      {/* National ID Input */}
      <TextField
        fullWidth
        label={isArabic ? 'الرقم القومي' : 'National ID Number'}
        value={nationalId}
        onChange={(e) => handleNationalIdChange(e.target.value)}
        error={!!idError}
        helperText={idError || (isArabic ? '14 رقماً' : '14 digits')}
        placeholder={isArabic ? '12345678901234' : '12345678901234'}
        inputProps={{ maxLength: 14 }}
        sx={{ mb: 3 }}
        dir={isArabic ? 'rtl' : 'ltr'}
      />

      {/* File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        fullWidth
        sx={{ mb: 2 }}
      >
        {isArabic ? 'اختر صورة البطاقة' : 'Select ID Image'}
      </Button>

      {/* Preview */}
      {preview && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Paper elevation={1} sx={{ p: 2, display: 'inline-block' }}>
            <Image
              src={preview}
              alt="ID Preview"
              width={300}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </Paper>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {file?.name}
          </Typography>
        </Box>
      )}

      {/* Upload Error */}
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {/* Upload Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleUpload}
        disabled={!file || !nationalId || !!idError || uploading}
        startIcon={uploading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
      >
        {uploading
          ? (isArabic ? 'جاري الرفع...' : 'Uploading...')
          : (isArabic ? 'تأكيد الرفع' : 'Confirm Upload')}
      </Button>
    </Paper>
  );
}
