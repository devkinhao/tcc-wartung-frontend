import { TablePagination } from "@mui/material";

type Props = {
  /** 1-based */
  page: number;
  pageSize: number;
  total: number;
  /** expects 1-based */
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
  const safeTotal = total || 0;
  const pageZeroBased = Math.max(0, page - 1);

  return (
    <TablePagination
      component="div"
      count={safeTotal}
      page={pageZeroBased}
      onPageChange={(_, newPage) => onPageChange(newPage + 1)}
      rowsPerPage={pageSize}
      onRowsPerPageChange={(e) => {
        const newSize = Number(e.target.value);
        onPageSizeChange(newSize);
        onPageChange(1);
      }}
      rowsPerPageOptions={[5, 10, 20, 50]}
      labelRowsPerPage="Registros por página:"
      sx={{
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        mt: 2,
      }}
    />
  );
}