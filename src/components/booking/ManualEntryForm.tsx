// Manual entry form for booking data
// Created: 2026-01-08
// Agent: BB
// MVP 1.5: Booking System - Phase 1

'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ManualEntryData {
  name: string;
  nationalId: string;
  birthDate: string;
  phone: string;
}

interface ManualEntryFormProps {
  initialData?: Partial<ManualEntryData>;
  onSubmit: (data: ManualEntryData) => void;
  language?: 'en' | 'ar';
}

/**
 * Manual entry form for booking data
 * Full fallback when OCR/barcode fails
 * Egyptian ID validation (14 digits)
 * Phone validation (Egyptian format)
 */
export default function ManualEntryForm({
  initialData,
  onSubmit,
  language = 'en',
}: ManualEntryFormProps) {
  const [formData, setFormData] = useState<ManualEntryData>({
    name: initialData?.name || '',
    nationalId: initialData?.nationalId || '',
    birthDate: initialData?.birthDate || '',
    phone: initialData?.phone || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ManualEntryData, string>>>({});
  const [birthDateObj, setBirthDateObj] = useState<Date | null>(
    initialData?.birthDate ? new Date(initialData.birthDate) : null,
  );

  const isArabic = language === 'ar';

  const labels = {
    title: {
      en: 'Enter Your Information',
      ar: 'أدخل بياناتك',
    },
    name: {
      en: 'Full Name',
      ar: 'الاسم الكامل',
    },
    nationalId: {
      en: 'National ID',
      ar: 'الرقم القومي',
    },
    birthDate: {
      en: 'Birth Date',
      ar: 'تاريخ الميلاد',
    },
    phone: {
      en: 'Phone Number',
      ar: 'رقم الهاتف',
    },
    submit: {
      en: 'Continue',
      ar: 'متابعة',
    },
  };

  const getText = (key: keyof typeof labels) => {
    return labels[key][isArabic ? 'ar' : 'en'];
  };

  // Validate Egyptian National ID
  const validateNationalId = (id: string): string | null => {
    if (!id) {
      return isArabic ? 'الرقم القومي مطلوب' : 'National ID is required';
    }

    if (!/^\d{14}$/.test(id)) {
      return isArabic
        ? 'الرقم القومي يجب أن يكون 14 رقماً'
        : 'National ID must be 14 digits';
    }

    // Validate date part (first 6 digits: YYMMDD)
    const year = parseInt(id.substring(0, 2));
    const month = parseInt(id.substring(2, 4));
    const day = parseInt(id.substring(4, 6));

    if (month < 1 || month > 12) {
      return isArabic ? 'الرقم القومي غير صحيح' : 'Invalid National ID';
    }

    if (day < 1 || day > 31) {
      return isArabic ? 'الرقم القومي غير صحيح' : 'Invalid National ID';
    }

    return null;
  };

  // Validate Egyptian phone number
  const validatePhone = (phone: string): string | null => {
    if (!phone) {
      return isArabic ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    // Egyptian phone: 01XXXXXXXXX (11 digits starting with 01)
    if (!/^01[0-9]{9}$/.test(phone)) {
      return isArabic
        ? 'رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقماً'
        : 'Phone must start with 01 and be 11 digits';
    }

    return null;
  };

  // Validate name
  const validateName = (name: string): string | null => {
    if (!name || name.trim().length < 3) {
      return isArabic
        ? 'الاسم يجب أن يكون 3 أحرف على الأقل'
        : 'Name must be at least 3 characters';
    }

    return null;
  };

  // Validate birth date
  const validateBirthDate = (date: string): string | null => {
    if (!date) {
      return isArabic ? 'تاريخ الميلاد مطلوب' : 'Birth date is required';
    }

    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 18) {
      return isArabic
        ? 'يجب أن يكون عمرك 18 سنة على الأقل'
        : 'You must be at least 18 years old';
    }

    if (age > 100) {
      return isArabic ? 'تاريخ الميلاد غير صحيح' : 'Invalid birth date';
    }

    return null;
  };

  // Handle field change
  const handleChange = (field: keyof ManualEntryData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Handle birth date change
  const handleBirthDateChange = (date: Date | null) => {
    setBirthDateObj(date);
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      handleChange('birthDate', dateStr);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    const newErrors: Partial<Record<keyof ManualEntryData, string>> = {};

    // Validate all fields
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const idError = validateNationalId(formData.nationalId);
    if (idError) newErrors.nationalId = idError;

    const birthDateError = validateBirthDate(formData.birthDate);
    if (birthDateError) newErrors.birthDate = birthDateError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <EditIcon sx={{ mr: 1 }} />
        {getText('title')}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {isArabic
          ? 'يرجى إدخال بياناتك بدقة. سيتم استخدامها للتحقق من هويتك.'
          : 'Please enter your information accurately. It will be used to verify your identity.'}
      </Alert>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={getText('name')}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder={isArabic ? 'أحمد محمد علي' : 'Ahmed Mohamed Ali'}
              dir={isArabic ? 'rtl' : 'ltr'}
            />
          </Grid>

          {/* National ID */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={getText('nationalId')}
              value={formData.nationalId}
              onChange={(e) => handleChange('nationalId', e.target.value)}
              error={!!errors.nationalId}
              helperText={errors.nationalId || (isArabic ? '14 رقماً' : '14 digits')}
              placeholder="12345678901234"
              inputProps={{ maxLength: 14 }}
              dir="ltr"
            />
          </Grid>

          {/* Birth Date */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label={getText('birthDate')}
              value={birthDateObj}
              onChange={handleBirthDateChange}
              maxDate={new Date()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.birthDate,
                  helperText: errors.birthDate,
                },
              }}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={getText('phone')}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone || (isArabic ? '01XXXXXXXXX' : '01XXXXXXXXX')}
              placeholder="01012345678"
              inputProps={{ maxLength: 11 }}
              dir="ltr"
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={handleSubmit}
            >
              {getText('submit')}
            </Button>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Paper>
  );
}
