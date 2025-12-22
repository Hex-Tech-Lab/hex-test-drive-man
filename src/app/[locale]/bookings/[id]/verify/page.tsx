'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material'

export default function VerifyBookingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const locale = params.locale as string

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResend, setShowResend] = useState(false)
  const [timer, setTimer] = useState(60)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setShowResend(true)
          clearInterval(countdown)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [])

  const handleResend = async () => {
    setResending(true)
    setError('')

    try {
      const response = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      // Reset timer
      setShowResend(false)
      setTimer(60)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/bookings/${bookingId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      // Success - redirect to confirmation
      router.push(`/${locale}/bookings/${bookingId}/confirmed`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Verify Your Booking
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enter the 6-digit code sent to your phone
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="OTP Code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
            inputMode: 'numeric'
          }}
          sx={{ mb: 2 }}
          autoFocus
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={otp.length !== 6 || loading}
        >
          {loading ? 'Verifying...' : 'Verify & Confirm Booking'}
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          {!showResend && (
            <Typography variant="body2" color="text.secondary">
              Didn&apos;t receive code? Resend in {timer}s
            </Typography>
          )}

          {showResend && (
            <Button
              variant="text"
              onClick={handleResend}
              disabled={resending}
              sx={{ textTransform: 'none' }}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </Button>
          )}
        </Box>

        <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          Booking ID: {bookingId}
        </Typography>
      </Paper>
    </Container>
  )
}
