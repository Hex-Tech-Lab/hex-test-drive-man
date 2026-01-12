'use client';

import React, { Component, ReactNode } from 'react';
import { Box, Container, Typography, Button, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for booking wizard
 * Catches errors during booking flow and shows fallback UI
 * Prevents white screen of death when Supabase/network fails
 */
class BookingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error('BookingErrorBoundary caught error:', error, errorInfo);

    // TODO: Send to Sentry when integrated
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Box sx={{ mb: 4 }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {this.props.fallbackMessage ||
                'We encountered an error while processing your booking. Please try again.'}
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="body2" fontFamily="monospace">
              {this.state.error?.message || 'Unknown error'}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                window.location.href = '/en/catalog';
              }}
            >
              Back to Catalog
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default BookingErrorBoundary;
