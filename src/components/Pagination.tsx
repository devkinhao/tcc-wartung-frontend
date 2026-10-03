import {
  IconButton,
  type IconButtonProps,
  TablePagination,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Tooltip } from "./Tooltip";

type PaginationProps = {
  /** Página atual, começando em 1. */
  page: number;
  /** Quantidade de registros por página. */
  pageSize: number;
  /** Total de registros em todas as páginas. */
  total: number;
  /** Recebe a nova página, começando em 1. */
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

/** Botão de anterior/próxima página, mostrando a tooltip com somente quando habilitado. */
function PaginationButton(props: IconButtonProps) {
  if (props.disabled) return <IconButton {...props} />;

  return (
    <Tooltip title={props["aria-label"]}>
      <IconButton {...props} />
    </Tooltip>
  );
}

/** Paginação das listagens, centralizada, com seletor de registros por página. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  /** Hooks. */
  const { t } = useTranslation();

  /** Total tratado como 0 quando ainda não carregado. */
  const safeTotal = total || 0;

  /** A paginação do MUI usa páginas começando em 0. */
  const pageZeroBased = Math.max(0, page - 1);

  return (
    <TablePagination
      component="div"
      count={safeTotal}
      page={pageZeroBased}
      onPageChange={(_, newPage) => onPageChange(newPage + 1)}
      rowsPerPage={pageSize}
      /** Ao mudar o tamanho da página, volta para a primeira. */
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
      /** Troca os botões de anterior/próxima para exibir a tooltip padrão do sistema. */
      slots={{
        actions: {
          previousButton: PaginationButton,
          nextButton: PaginationButton,
        },
      }}
      /** Os botões usam a cor padrão dos ícones do MUI, e não a do texto. */
      slotProps={{
        actions: {
          previousButton: { color: "default" },
          nextButton: { color: "default" },
        },
      }}
      sx={{
        "& .MuiTablePagination-toolbar": { justifyContent: "center" },
        /** O MUI insere um spacer que ocuparia o espaço livre e anularia a centralização. */
        "& .MuiTablePagination-spacer": { display: "none" },
      }}
    />
  );
}
