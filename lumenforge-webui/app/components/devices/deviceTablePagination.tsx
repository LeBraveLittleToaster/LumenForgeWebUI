// components/ZustandPagination.tsx
import * as React from "react";
import { Box, Pagination, Stack, Typography } from "@mui/material";
import { useDeviceStore } from "~/stores/devicestore";



type DeviceTablePaginationProps = {
  // Optional: let parent trigger fetch when page changes
  onPageChange?: (page: number, pageSize: number) => void;
  // Optional label like "Showing 1-10 of 300"
  showRangeLabel?: boolean;
};

export function DeviceTablePagination({ onPageChange, showRangeLabel = true }: DeviceTablePaginationProps) {
  const page = useDeviceStore((s) => s.page);
  const pageSize = useDeviceStore((s) => s.pageSize);
  const total = useDeviceStore((s) => s.total);
  const setPage = useDeviceStore((s) => s.setPage);
  const totalPages = useDeviceStore((s) => s.totalPages);
  const pages = totalPages();

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  React.useEffect(() => {
    onPageChange?.(page, pageSize);
  }, [page, pageSize, onPageChange]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mt: 2, px: 1 }}
    >
      <Box>
        {showRangeLabel ? (
          <Typography variant="body2" color="text.secondary">
            Showing {start}-{end} of {total}
          </Typography>
        ) : null}
      </Box>

      <Pagination
        count={pages}
        page={page}
        onChange={(_, next) => setPage(next)}
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
      />
    </Stack>
  );
}
