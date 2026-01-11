'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { createClient } from '@/lib/supabase'

/**
 * Step 2: Vehicle and date selection
 * User selects vehicle and preferred test drive date
 */
export default function Step2() {
  const router = useRouter()
  const params = useSearchParams()
  const phone = params.get('phone') || ''
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vehicleId, setVehicleId] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * Load active vehicles from database
   */
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('vehicle_trims')
        .select('*')
        .eq('is_active', true)
      setVehicles(data || [])
    }
    load()
  }, [])

  /**
   * Create draft booking and proceed to step 3
   */
  const submit = async () => {
    if (!vehicleId || !date) return
    setLoading(true)
    const res = await fetch('/api/bookings/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        vehicleId,
        preferred_date: date.toISOString(),
      }),
    })
    const { draftId } = await res.json()
    router.push('/bookings/step3?draftId=' + draftId)
    setLoading(false)
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
      <Typography variant="h4">Select Vehicle</Typography>
      <Typography mb={3}>Step 2 of 3</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Vehicle</InputLabel>
        <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {vehicles.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {v.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Preferred Date"
          value={date}
          onChange={setDate}
          sx={{ width: '100%', mb: 2 }}
        />
      </LocalizationProvider>
      <Button
        variant="contained"
        fullWidth
        onClick={submit}
        disabled={!vehicleId || !date || loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Continue'}
      </Button>
    </Box>
  )
}
