'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

interface TimeDisplayProps {
  /**
   * Timestamp to display (ISO string or Date)
   */
  timestamp: string | Date;

  /**
   * Display format: 'full' shows both UTC and local, 'local' shows local only
   * @default 'full'
   */
  format?: 'full' | 'local' | 'utc';

  /**
   * Show relative time (e.g., "2 hours ago") instead of absolute
   * @default false
   */
  relative?: boolean;
}

/**
 * TimeDisplay component - Shows timestamp in UTC and/or local timezone
 *
 * Handles client-side hydration correctly to prevent SSR mismatches.
 * Displays formatted times with timezone awareness.
 *
 * @example
 * <TimeDisplay timestamp="2026-01-05T13:00:00Z" />
 * // Output: "2026-01-05 13:00 UTC (15:00 EET)"
 *
 * <TimeDisplay timestamp={new Date()} format="local" />
 * // Output: "2026-01-05 15:00 EET"
 *
 * <TimeDisplay timestamp="2026-01-05T13:00:00Z" relative />
 * // Output: "2 hours ago"
 */
export default function TimeDisplay({ timestamp, format = 'full', relative = false }: TimeDisplayProps) {
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // During SSR, show placeholder
    return <span>--:--</span>;
  }

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Validate date
  if (isNaN(date.getTime())) {
    return <span>Invalid date</span>;
  }

  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  };

  if (relative) {
    return (
      <Tooltip title={date.toISOString()} arrow>
        <Typography component="span" variant="body2" color="text.secondary">
          {getRelativeTime(date)}
        </Typography>
      </Tooltip>
    );
  }

  // Format UTC time (YYYY-MM-DD HH:MM UTC)
  const formatUTC = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
  };

  // Format local time (YYYY-MM-DD HH:MM TZ)
  const formatLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Get timezone abbreviation (e.g., "EET", "EST")
    const timezone = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
      .formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value || '';

    return `${year}-${month}-${day} ${hours}:${minutes} ${timezone}`;
  };

  const utcTime = formatUTC(date);
  const localTime = formatLocal(date);

  if (format === 'utc') {
    return (
      <Tooltip title={`Local: ${localTime}`} arrow>
        <Typography component="span" variant="body2" color="text.secondary">
          {utcTime}
        </Typography>
      </Tooltip>
    );
  }

  if (format === 'local') {
    return (
      <Tooltip title={`UTC: ${utcTime}`} arrow>
        <Typography component="span" variant="body2" color="text.secondary">
          {localTime}
        </Typography>
      </Tooltip>
    );
  }

  // format === 'full': show both UTC and local
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Typography component="span" variant="body2" color="text.secondary">
        {utcTime}
      </Typography>
      <Typography component="span" variant="body2" color="text.disabled">
        ({localTime})
      </Typography>
    </Box>
  );
}
