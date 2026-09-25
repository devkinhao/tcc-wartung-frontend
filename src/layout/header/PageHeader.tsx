import {
  Box,
  Typography,
  type SxProps,
  type Theme,
  type TypographyProps,
} from "@mui/material";
import type { ReactNode } from "react";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem } from "./breadcrumbMap";

type PageHeaderProps = {
  items: BreadcrumbItem[];
  subtitle?: ReactNode;
  subtitleVariant?: TypographyProps["variant"];
  sx?: SxProps<Theme>;
};

/** Cabeçalho padrão de página com breadcrumb/título e subtítulo. */
export function PageHeader({
  items,
  subtitle,
  subtitleVariant = "body1",
  sx,
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Breadcrumb items={items} />
      {subtitle && (
        <Typography
          variant={subtitleVariant}
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
