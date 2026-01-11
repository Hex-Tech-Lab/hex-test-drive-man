'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material'

/**
 * Step 1: Phone verification with OTP
 * User enters phone number, receives OTP, verifies code
 *
 * Fixed: 2026-01-11 (CC) - Use API routes instead of direct smsService import
 * Reason: smsService imports Node.js crypto module which breaks client-side
 */
export default function Step1() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Send OTP to user's phone via API route
   */
  const sendOtp = async () => {
    if (!phone) return setError('Phone required')
    setLoading(true)
    setError('')
    try {
      const tempId = crypto.randomUUID()

      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          subjectId: tempId,
          subjectType: 'booking',
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'OTP failed')
        setLoading(false)
        return
      }

      localStorage.setItem('bookingTempId', tempId)
      setOtpSent(true)
    } catch (e: any) {
      setError(e.message || 'OTP failed')
    }
    setLoading(false)
  }

  /**
   * Verify OTP code and proceed to step 2 via API route
   */
  const verify = async () => {
    setLoading(true)
    const tempId = localStorage.getItem('bookingTempId') || ''
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          code: otp,
          subjectId: tempId,
        }),
      })

      const result = await response.json()

      if (!result.valid) {
        setError(result.error || 'Invalid OTP')
        setLoading(false)
        return
      }

      router.push('/bookings/step2?phone=' + encodeURIComponent(phone))
    } catch (e: any) {
      setError('Invalid OTP')
    }
    setLoading(false)
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 4, mt: 6 }}>
      <Typography variant="h4">Book Test Drive</Typography>
      <Typography mb={3}>Step 1 of 3: Phone Verification</Typography>
      {!otpSent ? (
        <>
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={sendOtp}
            disabled={!phone || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
          </Button>
        </>
      ) : (
        <>
          <TextField
            label="OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={verify}
            disabled={otp.length < 6 || loading}
          >
            Verify & Continue
          </Button>
        </>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
