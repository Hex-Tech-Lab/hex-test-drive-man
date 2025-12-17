'use client'

import { useParams } from 'next/navigation'
import { Box, Typography, Container, Paper, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Link from 'next/link'

export default function BookingConfirmedPage() {
  const params = useParams()
  const bookingId = params.id as string

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
            {bookingId}
          </Typography>
        </Paper>

        <Button
          component={Link}
          href="/"
          variant="contained"
          size="large"
          fullWidth
        >
          Back to Vehicle Catalog
        </Button>
      </Paper>
    </Container>
  )
}
