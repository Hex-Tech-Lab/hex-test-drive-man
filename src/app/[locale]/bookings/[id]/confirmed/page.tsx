'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Typography, Container, Paper, Button, CircularProgress, Alert } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Link from 'next/link'
import BookingQRCode from '@/components/booking/BookingQRCode'
import type { Reservation } from '@/types/reservation'

export default function BookingConfirmedPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const locale = (params.locale as string) || 'en'

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch(`/api/reservations/${bookingId}`)
        if (!response.ok) throw new Error('Failed to fetch reservation')
        
        const data = await response.json()
        setReservation(data.reservation)
      } catch (err) {
        console.error('Error fetching reservation:', err)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [bookingId])

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error || !reservation) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">{error || 'Booking not found'}</Alert>
        <Button
          component={Link}
          href={`/${locale}/bookings`}
          sx={{ mt: 2 }}
        >
          Back to Bookings
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon
          sx={{
            fontSize: 80,
            color: 'success.main',
            mb: 2
          }}
        />

        <Typography variant="h4" gutterBottom>
          Booking Confirmed!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Your test drive has been successfully confirmed.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You will receive a confirmation SMS with details shortly.
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: 'grey.50'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Booking Reference
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {bookingId.slice(0, 8)}
          </Typography>
        </Paper>

        {/* QR Code */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <BookingQRCode reservation={reservation} size={256} />
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
          Show this QR code at the venue
        </Typography>

        <Button
          component={Link}
          href={`/${locale}/bookings`}
          variant="contained"
          size="large"
          fullWidth
        >
          View All Bookings
        </Button>
      </Paper>
    </Container>
  )
}
