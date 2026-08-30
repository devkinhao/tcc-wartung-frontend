import { paths } from "@/routes/paths";

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

/**
 * Mapa de breadcrumbs para rotas estáticas — cada página renderiza o próprio
 * breadcrumb (no lugar do título/subtítulo, que ficavam redundantes com ele).
 * Rotas dinâmicas (/customers/:id, /customers/:id/inspections/:id) montam os
 * itens na própria página, com dados reais das queries (nome do cliente/inspeção).
 */
export const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  [paths.home]: [{ label: "nav.home" }],

  [paths.dashboard]: [
    { label: "nav.home", path: paths.home },
    { label: "nav.analytics" },
  ],

  [paths.customers]: [
    { label: "nav.home",         path: paths.home },
    { label: "nav.customersList" },
  ],

  [paths.inspections]: [
    { label: "nav.home",            path: paths.home },
    { label: "nav.inspectionsList" },
  ],

  [paths.notifications]: [
    { label: "nav.home",              path: paths.home },
    { label: "nav.notificationsList" },
  ],

  [paths.reports]: [
    { label: "nav.home",   path: paths.home },
    { label: "nav.reports" },
  ],

  [paths.adminPanel]: [
    { label: "nav.home",       path: paths.home },
    { label: "nav.adminPanel" },
  ],

  [paths.company]: [
    { label: "nav.home",       path: paths.home },
    { label: "nav.adminPanel", path: paths.adminPanel },
    { label: "nav.myCompany" },
  ],

  [paths.users]: [
    { label: "nav.home",       path: paths.home },
    { label: "nav.adminPanel", path: paths.adminPanel },
    { label: "nav.users" },
  ],

  [paths.configurations]: [
    { label: "nav.home",           path: paths.home },
    { label: "nav.adminPanel",     path: paths.adminPanel },
    { label: "nav.configurations" },
  ],

  [paths.userProfile]: [
    { label: "nav.home",      path: paths.home },
    { label: "nav.myProfile" },
  ],

  [paths.preferences]: [
    { label: "nav.home",       path: paths.home },
    { label: "nav.preferences" },
  ],

  [paths.serviceTypes]: [
    { label: "nav.home",       path: paths.home },
    { label: "nav.adminPanel", path: paths.adminPanel },
    { label: "nav.serviceTypes" },
  ],
};
