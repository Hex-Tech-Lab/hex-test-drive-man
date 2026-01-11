'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Booking redirect page - redirects to step 1 of the booking flow
 */
export default function BookingRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/bookings/step1')
  }, [router])
  
  return null
}
