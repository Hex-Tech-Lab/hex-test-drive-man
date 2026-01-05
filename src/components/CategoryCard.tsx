'use client';

import { Box, Typography, Paper } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { useLanguageStore } from '@/stores/language-store';

interface CategoryCardProps {
  icon: SvgIconComponent;
  labelEn: string;
  labelAr: string;
  count?: number;
  onClick?: () => void;
}

/**
 * Category card component for mobile-first catalog navigation
 * Displays icon + label in touch-friendly grid layout
 * 
 * @param props - Component props
 * @param props.icon - MUI icon component
 * @param props.labelEn - English label
 * @param props.labelAr - Arabic label
 * @param props.count - Optional count badge
 * @param props.onClick - Click handler
 */
export default function CategoryCard({ icon: Icon, labelEn, labelAr, count, onClick }: CategoryCardProps) {
  const language = useLanguageStore((state) => state.language);
  const label = language === 'ar' ? labelAr : labelEn;

  return (
    <Paper
      elevation={1}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        p: 2,
        minHeight: 100,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        borderRadius: 2,
        '&:hover': {
          elevation: 3,
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>
      
      <Typography
        variant="body2"
        fontWeight={600}
        textAlign="center"
        sx={{
          fontSize: { xs: 13, sm: 14 },
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>

      {count !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 12 }}
        >
          {count.toLocaleString()}
        </Typography>
      )}
    </Paper>
  );
}
