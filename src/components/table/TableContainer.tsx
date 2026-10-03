import { APPBAR_HEIGHT } from "@/layout/header/constants";
import { Box, Table } from "@mui/material";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type TableContainerProps = {
  children: ReactNode;
  /** Fixa o cabeçalho abaixo do header ao rolar. */
  stickyHeader?: boolean;
};

/** Container padrão das tabelas, com borda arredondada, largura mínima por coluna e linhas zebradas. */
export function TableContainer({
  children,
  stickyHeader = true,
}: TableContainerProps) {
  /** Estados. */
  const [overflowing, setOverflowing] = useState(false);

  /** Referências. */
  const boxRef = useRef<HTMLDivElement>(null);

  /** Detecta quando as colunas não cabem na largura disponível. */
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const check = () => setOverflowing(box.scrollWidth > box.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(box);
    if (box.firstElementChild) observer.observe(box.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={boxRef}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        /**  Rolagem horizontal quando as colunas não cabem.*/
        overflow: overflowing ? "auto" : "clip",
        bgcolor: "background.paper",
      }}
    >
      <Table
        size="small"
        stickyHeader={stickyHeader}
        sx={{
          /** Cada coluna tem no mínimo a largura do texto do cabeçalho. */
          tableLayout: "auto",
          "& thead th": {
            /** Posiciona o cabeçalho logo abaixo do header fixo. */
            ...(stickyHeader ? { top: overflowing ? 0 : APPBAR_HEIGHT } : {}),
            bgcolor: "action.selected",
            py: 1.25,
          },
          /** Impede que o conteúdo do corpo alargue a coluna, somente o cabeçalho define o mínimo. */
          "& tbody td": { py: 1, maxWidth: 0 },
          "& tbody tr:nth-of-type(even)": {
            bgcolor: "background.default",
          },
        }}
      >
        {children}
      </Table>
    </Box>
  );
}
