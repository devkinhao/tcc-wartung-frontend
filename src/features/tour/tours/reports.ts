import { paths } from "@/routes/paths";
import { ROUTE_PERMISSIONS } from "@/routes/routePermissions";
import { sidebarTarget } from "../target";
import type { TourDefinition } from "../types";

/**
 * Dois dos três relatórios têm só um botão "Gerar" — não há passo a passo a
 * ensinar. O que a tela não conta é o que cada um traz e que a barra de filtros
 * pertence apenas ao primeiro cartão, então este tutorial é de orientação.
 */
export const reportsTour: TourDefinition = {
  id: "reports",
  titleKey: "tour.reports.title",
  summaryKey: "tour.reports.summary",
  permissions: ROUTE_PERMISSIONS.reports,
  steps: [
    {
      target: sidebarTarget(paths.reports),
      advanceOn: "click",
      titleKey: "tour.reports.steps.menu.title",
      bodyKey: "tour.reports.steps.menu.body",
    },
    {
      target: "reports.companies",
      titleKey: "tour.reports.steps.companies.title",
      bodyKey: "tour.reports.steps.companies.body",
    },
    {
      target: "reports.filters",
      titleKey: "tour.reports.steps.filters.title",
      bodyKey: "tour.reports.steps.filters.body",
    },
    {
      target: "reports.expiring",
      titleKey: "tour.reports.steps.expiring.title",
      bodyKey: "tour.reports.steps.expiring.body",
    },
    {
      target: "reports.overdue",
      titleKey: "tour.reports.steps.overdue.title",
      bodyKey: "tour.reports.steps.overdue.body",
    },
  ],
};
