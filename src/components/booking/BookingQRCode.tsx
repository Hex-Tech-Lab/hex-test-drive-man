// QR Code component for confirmed bookings
// Created: 2026-01-07
// Agent: BB
// MVP 1.5: Booking System

'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import QRCode from 'qrcode';
import type { Reservation } from '@/types/reservation';

interface BookingQRCodeProps {
  reservation: Reservation;
  size?: number;
}

/**
 * Generates and displays QR code for confirmed bookings
 * QR code contains: booking ID, user info, vehicle, datetime
 */
export default function BookingQRCode({ reservation, size = 256 }: BookingQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current) return;

      try {
        setLoading(true);
        setError(null);

        // Create QR code data payload
        const qrData = JSON.stringify({
          id: reservation.id,
          vehicle_id: reservation.vehicle_id,
          datetime: reservation.reservation_datetime,
          status: reservation.status,
          national_id: reservation.national_id,
        });

        // Generate QR code on canvas
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        setLoading(false);
      } catch (err) {
        console.error('QR Code generation error:', err);
        setError('Failed to generate QR code');
        setLoading(false);
      }
    };

    generateQRCode();
  }, [reservation, size]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: size,
          width: size,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 2,
          textAlign: 'center',
          height: size,
          width: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'inline-block',
        textAlign: 'center',
      }}
    >
      <canvas ref={canvasRef} />
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Booking ID: {reservation.id.slice(0, 8)}
      </Typography>
    </Paper>
  );
}
