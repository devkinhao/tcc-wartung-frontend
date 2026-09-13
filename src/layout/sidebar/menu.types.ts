import type { SvgIconComponent } from "@mui/icons-material";

/** Tipo para os itens de menu. */
export type MenuItem = {
  label: string;
  tooltip: string;
  to: string;
  icon: SvgIconComponent;
  permissions?: readonly string[];
};
