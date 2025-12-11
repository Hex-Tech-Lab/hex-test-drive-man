'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sendOTP } from '@/services/sms/engine';

export default function NewBooking() {
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function createBooking() {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        vehicle_id: vehicleId,
        test_drive_date: date,
        test_drive_location: 'Cairo Showroom',
        user_id: user?.id,
        phone_number: phone // Add this field to schema later
      })
      .select()
      .single();

    if (data) {
      // Send OTP (stub for now)
      await sendOTP(phone, '123456');
      // Redirect to /bookings/[id]/verify
      window.location.href = `/en/bookings/${data.id}/verify?phone=${phone}`;
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book Test Drive</h1>
      <form onSubmit={(e) => { e.preventDefault(); createBooking(); }} className="space-y-4">
        <input
          type="text"
          placeholder="Vehicle ID"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
          min={new Date().toISOString().split('T')[0]}
        />
        <input
          type="tel"
          placeholder="Phone (+20...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Book Test Drive'}
        </button>
      </form>
    </div>
  );
}
