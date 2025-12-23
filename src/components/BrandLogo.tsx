'use client';

import { Box, Paper, Typography } from '@mui/material';

interface BrandLogoProps {
  brandName: string;
  logoUrl: string | null;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: { width: 60, height: 40 },
  medium: { width: 80, height: 56 },
  large: { width: 112, height: 80 },
};

/**
 * Brand logo component with fallback text
 * @param props - Component props
 * @param props.brandName - Name of the brand
 * @param props.logoUrl - URL of the logo image
 * @param props.size - Size variant (small, medium, large)
 */
export function BrandLogo({ brandName, logoUrl, size = 'medium' }: BrandLogoProps) {
  const dimensions = sizeMap[size];

  return (
    <Paper
      elevation={0}
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 1,
        padding: 1.5,
        border: '1px solid',
        borderColor: 'grey.100',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'grey.300' },
      }}
    >
      {logoUrl ? (
        <Box
          component="img"
          src={logoUrl}
          alt={`${brandName} logo`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      ) : (
        <Typography variant="caption" color="text.secondary" align="center" sx={{ fontWeight: 500 }}>
          {brandName}
        </Typography>
      )}
    </Paper>
  );
}

