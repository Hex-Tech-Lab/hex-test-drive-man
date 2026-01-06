import { Drawer, Box, Typography, IconButton, Tabs, Tab, Skeleton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Loading skeleton for CartDrawer component
 * Shows placeholder UI while CartDrawer lazy loads
 *
 * Design: Matches CartDrawer structure (header, tabs, scrollable content, action button)
 * Performance: Prevents CLS (Cumulative Layout Shift) during load
 */
export default function CartDrawerSkeleton() {
  return (
    <Drawer
      anchor="right"
      open={true}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '85vw', sm: '400px' },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="text" width={120} height={32} />
          <IconButton size="small" disabled>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={0} variant="fullWidth">
            <Tab label={<Skeleton variant="text" width={100} height={24} />} disabled />
            <Tab label={<Skeleton variant="text" width={100} height={24} />} disabled />
          </Tabs>
        </Box>

        {/* Content Area - Scrollable */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={2}>
            {/* 3 skeleton items */}
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {/* Vehicle Image */}
                <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1, flexShrink: 0 }} />

                {/* Vehicle Info */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>

                {/* Remove Button */}
                <Skeleton variant="circular" width={32} height={32} sx={{ alignSelf: 'flex-start' }} />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Bottom Action Button */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </Drawer>
  );
}
