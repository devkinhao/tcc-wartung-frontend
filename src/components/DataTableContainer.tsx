import { Box, Table } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode; // <TableHead>...</TableHead> + <TableBody>...</TableBody>
};

// Casca compartilhada por todas as tabelas do app: borda + cantos arredondados
// + table-layout fixed (necessário pras larguras em % das colunas funcionarem
// de forma previsível). O conteúdo de cabeçalho/corpo fica com quem chama,
// já que difere bastante de tabela pra tabela (chips, menus, sort, etc.).
export function DataTableContainer({ children }: Props) {
  return (
    <Box
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        {children}
      </Table>
    </Box>
  );
}
