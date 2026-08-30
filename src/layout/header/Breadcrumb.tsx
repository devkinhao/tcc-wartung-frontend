import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { BreadcrumbItem } from "./breadcrumbMap";
import { typography } from "@/styles/typography";

type Props = {
  items: BreadcrumbItem[];
  /** "large" estiliza o item atual (último) como um título de página — usado
   * quando o breadcrumb substitui o título/subtítulo que ficava na própria página. */
  size?: "default" | "large";
};

export function Breadcrumb({ items, size = "default" }: Props) {
  const navigate  = useNavigate();
  const { t }     = useTranslation();

  // Se o label começa com "nav." é uma chave i18n, senão é texto final (nome do cliente/inspeção)
  const resolve = (label: string) =>
    label.startsWith("nav.") ? t(label) : label;

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {items.map((c, i) => {
        const last  = i === items.length - 1;
        const label = resolve(c.label);

        if (c.path && !last) {
          return (
            <Link
              key={i}
              underline="hover"
              color="inherit"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(c.path!)}
            >
              {label}
            </Link>
          );
        }

        if (last && size === "large") {
          return (
            <Typography key={i} variant="h6" color="text.primary" fontWeight={typography.weight.bold}>
              {label}
            </Typography>
          );
        }

        return (
          <Typography
            key={i}
            variant="body2"
            color={last ? "text.primary" : "text.secondary"}
            fontWeight={last ? typography.weight.bold : typography.weight.medium}
          >
            {label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
