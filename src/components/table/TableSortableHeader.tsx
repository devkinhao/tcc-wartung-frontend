import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  UnfoldMore,
} from "@mui/icons-material";
import { Box, IconButton, TableCell, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../Tooltip";

type TableSortableHeaderProps<T extends string> = {
  label: string;
  column: T;
  /** Coluna ordenada atualmente. */
  sortBy: T | null;
  sortDir: "asc" | "desc";
  onSort: (c: T) => void;
  align?: "left" | "center" | "right";
  /** Largura preferida da coluna. */
  width?: string;
};

/**
 * Cabeçalho de coluna com ordenação acionada por ícones.
 * A seta fica no sentido ativo quando a coluna está ordenada, ou duas setas quando não está.
 */
export function TableSortableHeader<T extends string>({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  align = "left",
  width,
}: TableSortableHeaderProps<T>) {
  /** Hooks. */
  const { t } = useTranslation();

  /** Indica se a tabela está ordenada por esta coluna. */
  const active = sortBy === column;

  /** Sentido aplicado ao clicar, no qual começa crescente e inverte se a coluna já está ordenada. */
  const nextDir = active && sortDir === "asc" ? "desc" : "asc";

  /** Texto para tooltip e aria-label do botão de ordenação. */
  const sortLabel = t(nextDir === "asc" ? "sort.ascending" : "sort.descending");

  /** Ícone conforme o estado de ordenação da coluna. */
  const SortIcon = !active
    ? UnfoldMore
    : sortDir === "asc"
      ? KeyboardArrowUp
      : KeyboardArrowDown;

  return (
    <TableCell
      align={align}
      aria-sort={
        active ? (sortDir === "asc" ? "ascending" : "descending") : undefined
      }
      sx={{
        userSelect: "none",
        width,
        verticalAlign: "middle",
      }}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          maxWidth: "100%",
        }}
      >
        {/** Sem quebra de linha, onde o texto define a largura mínima da coluna. */}
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ textAlign: align === "center" ? "center" : "left" }}
        >
          {label}
        </Typography>
        <Tooltip title={sortLabel}>
          <IconButton
            size="small"
            aria-label={sortLabel}
            onClick={() => onSort(column)}
            sx={{ p: 0.25, color: active ? "primary.main" : "divider" }}
          >
            <SortIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </TableCell>
  );
}
