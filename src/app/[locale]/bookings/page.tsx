'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Booking redirect page - redirects to new single-page booking wizard
 */
export default function BookingRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/bookings/new')
  }, [router])
  
  return null
}
