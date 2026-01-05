'use client';

import { Box, Typography, Button, SvgIcon } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

/**
 * Reusable empty state component for no results scenarios
 * @param props - Component props
 * @param props.icon - Optional icon to display
 * @param props.title - Main heading text
 * @param props.description - Optional description text
 * @param props.actionLabel - Primary action button label
 * @param props.onAction - Primary action callback
 * @param props.secondaryActionLabel - Secondary action button label
 * @param props.onSecondaryAction - Secondary action callback
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: { xs: 6, md: 10 },
        px: 3,
      }}
    >
      {icon && (
        <Box
          sx={{
            mb: 3,
            color: 'text.secondary',
            opacity: 0.5,
            '& svg': {
              fontSize: { xs: 64, md: 80 },
            },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            maxWidth: 500,
          }}
        >
          {description}
        </Typography>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && onAction && (
            <Button variant="contained" size="large" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outlined" size="large" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
