'use client';

import { Box, Container, Skeleton } from '@mui/material';

/**
 * Skeleton loading placeholder for hero sections
 * Used on landing page and feature pages while content loads
 * 
 * Features:
 * - Large title + subtitle + CTA button placeholders
 * - Shimmer animation
 * - Responsive sizing
 * - Accessible with aria-busy
 */
export default function SkeletonHero() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: { xs: 6, md: 10 },
        minHeight: { xs: 300, md: 400 },
        display: 'flex',
        alignItems: 'center',
      }}
      aria-busy="true"
      aria-label="Loading hero section"
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 3,
          }}
        >
          {/* Main title */}
          <Skeleton
            variant="text"
            sx={{
              fontSize: { xs: '2rem', md: '3.5rem' },
              width: { xs: '90%', md: '70%' },
            }}
            animation="wave"
          />

          {/* Subtitle line 1 */}
          <Skeleton
            variant="text"
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              width: { xs: '80%', md: '60%' },
            }}
            animation="wave"
          />

          {/* Subtitle line 2 */}
          <Skeleton
            variant="text"
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              width: { xs: '70%', md: '50%' },
            }}
            animation="wave"
          />

          {/* CTA button */}
          <Skeleton
            variant="rounded"
            sx={{
              width: { xs: 200, md: 250 },
              height: { xs: 48, md: 56 },
              mt: 2,
            }}
            animation="wave"
          />

          {/* Secondary action */}
          <Skeleton
            variant="text"
            sx={{
              fontSize: '1rem',
              width: { xs: 150, md: 180 },
            }}
            animation="wave"
          />
        </Box>
      </Container>
    </Box>
  );
}
