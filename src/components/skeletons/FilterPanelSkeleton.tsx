import { Box, Paper, Skeleton, Divider } from '@mui/material';

/**
 * Loading skeleton for FilterPanel component
 * Shows placeholder UI while FilterPanel lazy loads
 *
 * Design: Matches FilterPanel structure (accordions, checkboxes, slider)
 * Performance: Prevents CLS (Cumulative Layout Shift) during load
 */
export default function FilterPanelSkeleton() {
  return (
    <Box
      sx={{
        position: { xs: 'relative', md: 'sticky' },
        top: { md: 80 },
        maxHeight: { md: 'calc(100vh - 96px)' },
        overflowY: { md: 'auto' },
        pb: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: '#fff',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f9f9f9',
          }}
        >
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="text" width={50} height={24} />
        </Box>

        {/* Brands Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
          {[...Array(5)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="rectangular" width={20} height={20} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={120} height={20} />
            </Box>
          ))}
        </Box>

        {/* Categories Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="rectangular" width={20} height={20} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={100} height={20} />
            </Box>
          ))}
        </Box>

        {/* Price Range Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={100} height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={60} height={20} />
          </Box>
        </Box>

        {/* Body Styles Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="rectangular" width={20} height={20} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          ))}
        </Box>

        {/* Fuel Types Section */}
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="rectangular" width={20} height={20} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={90} height={20} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
