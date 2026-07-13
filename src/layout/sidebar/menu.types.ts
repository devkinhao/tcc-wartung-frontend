import type { SvgIconComponent } from "@mui/icons-material";

export type MenuItem = {
  label: string;
  to: string;
  icon: SvgIconComponent;
  permissions?: readonly string[];
};