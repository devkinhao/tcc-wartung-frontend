import { TableCell, TableSortLabel } from "@mui/material";

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
// O ícone de ordenação é posicionado fora do fluxo (absolute) porque, mesmo
// inativo/invisível, ele reserva espaço no layout — em colunas estreitas ou
// centralizadas isso empurra o texto e pode até estourar o ellipsis da célula.
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
  return (
    <TableCell
      align={align}
      onClick={() => onSort(column)}
      sx={{
        cursor: "pointer",
        userSelect: "none",
        width,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <TableSortLabel
        active={active}
        direction={active ? sortDir : "asc"}
        sx={{
          position: "relative",
          "& .MuiTableSortLabel-icon": {
            position: "absolute",
            left: "100%",
            marginLeft: "4px",
          },
        }}
      >
        <b>{label}</b>
      </TableSortLabel>
    </TableCell>
  );
}
