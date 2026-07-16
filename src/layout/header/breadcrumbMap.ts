import { paths } from "@/routes/paths";

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

/**
 * Mapa de breadcrumbs para rotas estáticas.
 * Rotas dinâmicas (/customers/:id, /customers/:id/inspections/:id)
 * são geradas em Header.tsx com dados reais das queries.
 */
export const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  [paths.dashboard]: [{ label: "nav.home" }],

  [paths.customers]: [
    { label: "nav.home",         path: paths.dashboard },
    { label: "nav.customersList" },
  ],

  [paths.inspections]: [
    { label: "nav.home",            path: paths.dashboard },
    { label: "nav.inspectionsList" },
  ],

  [paths.notifications]: [
    { label: "nav.home",              path: paths.dashboard },
    { label: "nav.notificationsList" },
  ],

  [paths.reports]: [
    { label: "nav.home",   path: paths.dashboard },
    { label: "nav.reports" },
  ],

  [paths.company]: [
    { label: "nav.home",      path: paths.dashboard },
    { label: "nav.myCompany" },
  ],

  [paths.users]: [
    { label: "nav.home",  path: paths.dashboard },
    { label: "nav.users" },
  ],

  [paths.configurations]: [
    { label: "nav.home",           path: paths.dashboard },
    { label: "nav.configurations" },
  ],

  [paths.help]: [
    { label: "nav.home", path: paths.dashboard },
    { label: "nav.help" },
  ],

  [paths.userProfile]: [
    { label: "nav.home",      path: paths.dashboard },
    { label: "nav.myProfile" },
  ],

  [paths.userPreferences]: [
    { label: "nav.home",        path: paths.dashboard },
    { label: "nav.myProfile",   path: paths.userProfile },
    { label: "nav.preferences" },
  ],

  [paths.serviceTypes]: [
    { label: "nav.home",         path: paths.dashboard },
    { label: "nav.serviceTypes" },
  ],
};

/**
 * Rotas cuja própria página renderiza o breadcrumb (no lugar do título/subtítulo,
 * que ficavam redundantes com ele) — o Header não desenha nada nessas rotas.
 */
export const PAGES_WITH_OWN_BREADCRUMB = new Set<string>([
  paths.dashboard,
  paths.customers,
  paths.inspections,
  paths.notifications,
  paths.reports,
  paths.company,
  paths.users,
  paths.configurations,
  paths.help,
  paths.userProfile,
  paths.userPreferences,
  paths.serviceTypes,
]);
