import { Box, Table } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode; // <TableHead>...</TableHead> + <TableBody>...</TableBody>
  /** Cabeçalho fixo ao rolar a página. Desligue em tabelas embutidas (dentro
   *  de um card/aba), onde o cabeçalho flutuaria sobre outro conteúdo. */
  stickyHeader?: boolean;
};

// Casca compartilhada por todas as tabelas do app.
//  - borda + cantos arredondados (overflow: clip preserva o `position: sticky`
//    do cabeçalho, ao contrário de overflow: hidden)
//  - table-layout fixed (larguras em % previsíveis)
//  - cabeçalho fixo ao rolar (gruda logo abaixo da AppBar), opcional
//  - linhas zebradas + mais altas, para leitura confortável
export function DataTableContainer({ children, stickyHeader = true }: Props) {
  return (
    <Box
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        overflow: "clip",
        bgcolor: "background.paper",
      }}
    >
      <Table
        size="small"
        stickyHeader={stickyHeader}
        sx={{
          tableLayout: "fixed",
          "& thead th": {
            ...(stickyHeader ? { top: { xs: 56, sm: 64 } } : {}), // altura da AppBar fixa
            bgcolor: "background.default",
            borderBottom: (t) => `2px solid ${t.palette.divider}`,
            fontWeight: 700,
            lineHeight: 1.3,
            py: 1.25,
          },
          "& tbody td": { py: 1.25 },
          "& tbody tr:nth-of-type(even)": {
            bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.022)"),
          },
        }}
      >
        {children}
      </Table>
    </Box>
  );
}
