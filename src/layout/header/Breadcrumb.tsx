import { Tooltip } from "@/components/Tooltip";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { BreadcrumbItem } from "./breadcrumbMap";

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

/** Trilha de navegação da página, com o item atual estilizado como título. */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  /** Se o label começa com "nav." é uma chave I18n, senão é texto final (nome do cliente/inspeção). */
  const resolve = (label: string) =>
    label.startsWith("nav.") ? t(label) : label;

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        const label = resolve(c.label);

        if (c.path && !last) {
          return (
            <Tooltip
              key={i}
              title={t("common.tooltip.goTo", {
                page: label.toLocaleLowerCase(),
              })}
            >
              <Link
                underline="hover"
                sx={{ color: "text.secondary", cursor: "pointer" }}
                onClick={() => navigate(c.path!)}
              >
                {label}
              </Link>
            </Tooltip>
          );
        }
        /** Item atual sem path ou último da lista, não é clicável e substitui o título da página. */
        return (
          <Typography key={i} variant="h4" sx={{ color: "text.primary" }}>
            {label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
