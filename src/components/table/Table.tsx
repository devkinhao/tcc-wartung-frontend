import {
  Box,
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TableContainer } from "./TableContainer";
import { TableSortableHeader } from "./TableSortableHeader";
import { TableTruncatedCell } from "./TableTruncatedCell";

/** Coluna da tabela, na qual a key identifica a coluna e também é o valor enviado em onSort. */
export type TableColumn<T, K extends string = string> = {
  key: K;
  /** Título do cabeçalho, já traduzido. */
  header: string;
  /** Conteúdo da célula para a linha. */
  render: (row: T) => ReactNode;
  /** Largura preferida da coluna. */
  width?: string;
  align?: "left" | "center" | "right";
  /** Exibe o ícone de ordenação no cabeçalho, o que exige sortBy, sortDir e onSort na tabela. */
  sortable?: boolean;
  /** Faz a coluna acompanhar a largura do conteúdo, sem cortá-lo com reticências. */
  nowrap?: boolean;
  /** Impede que o title da linha apareça sobre a coluna, como em colunas de ações. Aceita uma função para decidir por linha. */
  hideRowTitle?: boolean | ((row: T) => boolean);
};

type TableProps<T, K extends string> = {
  columns: TableColumn<T, K>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  loading?: boolean;
  /** Texto exibido durante o carregamento. */
  loadingLabel?: string;
  /** Texto exibido quando não há dados na tabela. */
  emptyLabel: string;
  sortBy?: K | null;
  sortDir?: "asc" | "desc";
  onSort?: (column: K) => void;
  /** Quando informado, a linha fica clicável. */
  onRowClick?: (row: T) => void;
  /** Title nativo de cada linha. */
  getRowTitle?: (row: T) => string | undefined;
  /** Linha desativada fica com fundo e texto esmaecidos. */
  isRowDisabled?: (row: T) => boolean;
  stickyHeader?: boolean;
};

/** Tabela padrão do sistema, com colunas configuráveis, ordenação, linhas clicáveis e estados de carregamento e vazio. */
export function Table<T, K extends string = string>({
  columns,
  rows,
  getRowKey,
  loading = false,
  loadingLabel,
  emptyLabel,
  sortBy = null,
  sortDir = "asc",
  onSort,
  onRowClick,
  getRowTitle,
  isRowDisabled,
  stickyHeader,
}: TableProps<T, K>) {
  /** Hooks. */
  const { t } = useTranslation();

  return (
    <TableContainer stickyHeader={stickyHeader}>
      <TableHead>
        <TableRow>
          {columns.map((column) =>
            column.sortable && onSort ? (
              <TableSortableHeader
                key={column.key}
                label={column.header}
                column={column.key}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
                align={column.align}
                width={column.width}
              />
            ) : (
              <TableCell
                key={column.key}
                align={column.align}
                sx={{ width: column.width, verticalAlign: "middle" }}
              >
                <Typography variant="subtitle2" noWrap>
                  {column.header}
                </Typography>
              </TableCell>
            ),
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={columns.length} align="center">
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}
              >
                <Typography variant="body2" color="text.secondary">
                  <em>{loadingLabel ?? t("common.loading")}</em>
                </Typography>
                <CircularProgress size={18} />
              </Box>
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} align="center">
              <Typography variant="body2" color="text.secondary">
                <em>{emptyLabel}</em>
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={getRowKey(row)}
              hover={Boolean(onRowClick)}
              sx={{
                ...(onRowClick && { cursor: "pointer" }),
                ...(isRowDisabled?.(row) && {
                  bgcolor: "action.hover",
                  "& td": { color: "text.disabled" },
                }),
              }}
              title={getRowTitle?.(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <TableTruncatedCell
                  key={column.key}
                  align={column.align}
                  nowrap={column.nowrap}
                  hideTitle={
                    typeof column.hideRowTitle === "function"
                      ? column.hideRowTitle(row)
                      : column.hideRowTitle
                  }
                >
                  {column.render(row)}
                </TableTruncatedCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </TableContainer>
  );
}
