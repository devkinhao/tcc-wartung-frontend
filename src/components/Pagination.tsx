import { TablePagination } from "@mui/material";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      labelRowsPerPage={t("pagination.rowsPerPage")}
      labelDisplayedRows={({ from, to, count }) =>
        count === -1
          ? t("pagination.displayedRowsUnknownTotal", { from, to })
          : t("pagination.displayedRows", { from, to, count })
      }
      getItemAriaLabel={(type) => {
        switch (type) {
          case "first":
            return t("pagination.firstPage");
          case "last":
            return t("pagination.lastPage");
          case "next":
            return t("pagination.nextPage");
          case "previous":
            return t("pagination.previousPage");
          default:
            return "";
        }
      }}
      sx={{
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        mt: 2,
        "& .MuiTablePagination-toolbar": { justifyContent: "center" },
        // O MUI insere um spacer com flex:1 antes do conteúdo — sem removê-lo,
        // ele ocupa todo o espaço livre e o justifyContent acima não faz nada.
        "& .MuiTablePagination-spacer": { display: "none" },
      }}
    />
  );
}