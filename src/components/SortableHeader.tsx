import { Box, TableCell } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

type SortableHeaderProps<T extends string> = {
  label: string;
  column: T;
  sortBy: T | null;
  sortDir: "asc" | "desc";
  onSort: (c: T) => void;
  align?: "left" | "center" | "right";
  width?: string;
};

// Cabeçalho de coluna ordenável usado por todas as tabelas do app.
//
// O indicador é um par de setas (▲ em cima, ▼ embaixo) sempre visível — deixa
// claro que a coluna é ordenável sem depender do hover. Quando a coluna é a
// ordenação atual, a seta do sentido ativo fica destacada (cor primária) e a
// outra esmaecida; nas demais colunas as duas ficam esmaecidas.
//
// O texto do cabeçalho pode quebrar em duas linhas em colunas estreitas (a
// tabela é table-layout: fixed) — as setas ficam com flex-shrink: 0, então
// nunca são cortadas.
export function SortableHeader<T extends string>({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  align = "left",
  width,
}: SortableHeaderProps<T>) {
  const active = sortBy === column;
  const dir = active ? sortDir : null;

  const arrowSx = (isOn: boolean) => ({
    fontSize: 16,
    m: "-4px 0", // aproxima as duas setas
    opacity: isOn ? 1 : 0.35,
    color: isOn ? "primary.main" : "inherit",
    transition: "opacity 150ms",
  });

  return (
    <TableCell
      align={align}
      onClick={() => onSort(column)}
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
      sx={{
        cursor: "pointer",
        userSelect: "none",
        width,
        verticalAlign: "middle",
        "&:hover .sortable-header__arrow": { opacity: 0.6 },
      }}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          maxWidth: "100%",
        }}
      >
        <Box
          component="span"
          sx={{ minWidth: 0, textAlign: align === "center" ? "center" : "left" }}
        >
          <b>{label}</b>
        </Box>
        <Box
          component="span"
          sx={{ display: "inline-flex", flexDirection: "column", flexShrink: 0, lineHeight: 0 }}
        >
          <ArrowDropUpIcon
            className={dir === "asc" ? undefined : "sortable-header__arrow"}
            sx={arrowSx(dir === "asc")}
          />
          <ArrowDropDownIcon
            className={dir === "desc" ? undefined : "sortable-header__arrow"}
            sx={arrowSx(dir === "desc")}
          />
        </Box>
      </Box>
    </TableCell>
  );
}
