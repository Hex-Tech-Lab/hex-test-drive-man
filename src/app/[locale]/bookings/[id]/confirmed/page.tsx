'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Typography, Container, Paper, Button, CircularProgress, Alert } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Link from 'next/link'
import BookingQRCode from '@/components/booking/BookingQRCode'
import type { Reservation } from '@/types/reservation'
import type { Booking } from '@/types/booking'

export default function BookingConfirmedPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const locale = (params.locale as string) || 'en'

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // Try reservations API first (MVP 1.5 system)
        let response = await fetch(`/api/reservations/${bookingId}`)
        
        if (response.ok) {
          const data = await response.json()
          setReservation(data.reservation)
          return
        }

        // Fallback to bookings API (legacy system)
        response = await fetch(`/api/bookings/${bookingId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        
        const data = await response.json()
        setBooking(data)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [bookingId])

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error || (!reservation && !booking)) {
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

  // Display data from either system
  const displayDate = reservation?.reservation_datetime || booking?.preferredDate || ''
  const displayId = bookingId.slice(0, 8)

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
            {displayId}
          </Typography>
          {displayDate && (
            <>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Date
              </Typography>
              <Typography variant="body2">
                {new Date(displayDate).toLocaleDateString()}
              </Typography>
            </>
          )}
        </Paper>

        {/* QR Code - only for reservations system */}
        {reservation && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <BookingQRCode reservation={reservation} size={256} />
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              Show this QR code at the venue
            </Typography>
          </>
        )}

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
