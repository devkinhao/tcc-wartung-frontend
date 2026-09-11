import { lighten } from "@mui/material/styles";

// Paleta categórica derivada dos brand tokens do projeto.
const BASE_PALETTE = [
  "#2A4C61", "#78744C", "#4A7FA5", "#A0956B",
  "#3D6E8C", "#8F7E55", "#5B8FAF", "#B0A57A",
];

/**
 * Cores das séries dos gráficos. No tema escuro os tons originais (pensados para
 * fundo claro) quase somem no card quase preto — clareamos mantendo o matiz para
 * preservar contraste.
 */
export function getChartPalette(mode: "light" | "dark"): string[] {
  return mode === "dark" ? BASE_PALETTE.map((c) => lighten(c, 0.35)) : BASE_PALETTE;
}
