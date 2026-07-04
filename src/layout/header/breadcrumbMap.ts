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
  "/dashboard": [{ label: "nav.home" }],

  "/customers": [
    { label: "nav.home",         path: "/dashboard" },
    { label: "nav.customersList" },
  ],

  "/inspections": [
    { label: "nav.home",            path: "/dashboard" },
    { label: "nav.inspectionsList" },
  ],

  "/reports": [
    { label: "nav.home",   path: "/dashboard" },
    { label: "nav.reports" },
  ],

  "/company": [
    { label: "nav.home",      path: "/dashboard" },
    { label: "nav.myCompany" },
  ],

  "/users": [
    { label: "nav.home",  path: "/dashboard" },
    { label: "nav.users" },
  ],

  "/configurations": [
    { label: "nav.home",           path: "/dashboard" },
    { label: "nav.configurations" },
  ],

  "/help": [
    { label: "nav.home", path: "/dashboard" },
    { label: "nav.help" },
  ],

  "/users/me": [
    { label: "nav.home",      path: "/dashboard" },
    { label: "nav.myProfile" },
  ],

  "/users/me/preferences": [
    { label: "nav.home",        path: "/dashboard" },
    { label: "nav.myProfile",   path: "/users/me" },
    { label: "nav.preferences" },
  ],
};
