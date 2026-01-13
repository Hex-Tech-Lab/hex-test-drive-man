'use client'

import { Button, Box, Typography } from '@mui/material';

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  // ... 30min intervals
];

export default function TimePills({ selectedTime, onSelect }: { selectedTime: string; onSelect: (time: string) => void }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
      {timeSlots.map(({ time, available }) => (
        <Button
          key={time}
          variant={selectedTime === time ? 'contained' : 'outlined'}
          disabled={!available}
          onClick={() => onSelect(time)}
        >
          {time}
        </Button>
      ))}
    </Box>
  );
}
