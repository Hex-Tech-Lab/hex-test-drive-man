'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material'

/**
 * Step 3: Booking confirmation
 * User reviews booking details and confirms
 */
export default function Step3() {
  const router = useRouter()
  const params = useSearchParams()
  const draftId = params.get('draftId') || ''
  const [draft, setDraft] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Load draft booking details
   */
  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/bookings/draft/' + draftId)
      const data = await res.json()
      setDraft(data)
    }
    if (draftId) load()
  }, [draftId])

  /**
   * Confirm booking and redirect to success page
   */
  const confirm = async () => {
    setLoading(true)
    await fetch('/api/bookings/' + draftId + '/confirm', { method: 'POST' })
    router.push('/bookings/confirmed')
  }

  if (!draft) return <CircularProgress />

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 4 }}>
      <Typography variant="h4">Confirm Booking</Typography>
      <Typography mb={3}>Step 3 of 3</Typography>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography>Phone: {draft.phone_number}</Typography>
        <Typography>Vehicle: {draft.vehicle_id}</Typography>
        <Typography>Date: {new Date(draft.preferred_date).toLocaleDateString()}</Typography>
      </Paper>
      <Button variant="contained" fullWidth onClick={confirm} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
      </Button>
    </Box>
  )
}
