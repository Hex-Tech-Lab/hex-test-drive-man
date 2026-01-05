'use client';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';

/**
 * Skeleton loading placeholder for data tables
 * Used in bookings list and other tabular data views
 * 
 * Features:
 * - Realistic column widths (varied)
 * - Shimmer animation
 * - Configurable row count
 * - Accessible with aria-busy
 * 
 * @param rows - Number of skeleton rows to display (default: 5)
 */
interface SkeletonTableProps {
  rows?: number;
}

export default function SkeletonTable({ rows = 5 }: SkeletonTableProps) {
  const skeletonRows = Array.from({ length: rows }, (_, i) => i);

  return (
    <TableContainer
      component={Paper}
      aria-busy="true"
      aria-label="Loading table data"
    >
      <Table>
        <TableHead>
          <TableRow>
            {/* Header cells with varied widths */}
            <TableCell>
              <Skeleton variant="text" width="80%" animation="wave" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="60%" animation="wave" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="70%" animation="wave" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="50%" animation="wave" />
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="text" width="40%" animation="wave" sx={{ ml: 'auto' }} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {skeletonRows.map((index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton variant="text" width="90%" animation="wave" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="75%" animation="wave" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="85%" animation="wave" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="65%" animation="wave" />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Skeleton variant="rounded" width={60} height={32} animation="wave" />
                  <Skeleton variant="rounded" width={60} height={32} animation="wave" />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
