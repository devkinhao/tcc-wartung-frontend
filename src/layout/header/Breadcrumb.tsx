import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { BreadcrumbItem } from "./breadcrumbMap";

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
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

        return (
          <Typography
            key={i}
            color={last ? "text.primary" : "text.secondary"}
            fontWeight={last ? 700 : 500}
          >
            {label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
