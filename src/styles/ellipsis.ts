import type { SxProps, Theme } from "@mui/material";

/** Estilo para texto de uma linha que termina em reticências quando não cabe no espaço. */
export const ELLIPSIS_SX = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} satisfies SxProps<Theme>;
