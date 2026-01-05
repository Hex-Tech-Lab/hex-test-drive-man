'use client';

import { Box, Card, CardContent, Skeleton } from '@mui/material';

/**
 * Skeleton loading placeholder for vehicle cards
 * Used in search results and catalog pages while data is loading
 * 
 * Features:
 * - Shimmer animation (1.5s loop)
 * - Matches VehicleCard dimensions to prevent layout shift
 * - Accessible with aria-busy
 */
export default function SkeletonCard() {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      aria-busy="true"
      aria-label="Loading vehicle card"
    >
      {/* Image placeholder */}
      <Skeleton
        variant="rectangular"
        sx={{
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
        }}
        animation="wave"
      />

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Title */}
        <Skeleton
          variant="text"
          sx={{
            fontSize: '1.25rem',
            width: '80%',
            mb: 1,
          }}
          animation="wave"
        />

        {/* Subtitle */}
        <Skeleton
          variant="text"
          sx={{
            fontSize: '0.875rem',
            width: '60%',
            mb: 2,
          }}
          animation="wave"
        />

        {/* Price */}
        <Skeleton
          variant="text"
          sx={{
            fontSize: '1.5rem',
            width: '50%',
            mb: 2,
          }}
          animation="wave"
        />

        {/* Button placeholders */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton
            variant="rounded"
            sx={{
              flex: 1,
              height: 36,
            }}
            animation="wave"
          />
          <Skeleton
            variant="rounded"
            sx={{
              flex: 1,
              height: 36,
            }}
            animation="wave"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
