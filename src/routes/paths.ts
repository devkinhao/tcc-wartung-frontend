/** Definição de rotas do sistema, usado pelo menu lateral, breadcrumbs e qualquer navegação. */
export const paths = {
  login: "/login",
  resetPassword: "/reset-password",

  home: "/home",
  customers: "/customers",
  /** Usado pelos cards do dashboard, abrindo a lista de empresas já filtrada. */
  customersByStatus: (
    status: "customer" | "non-customer" | "inactive" | "all",
  ) => `/customers?status=${status}`,
  customerDetails: (id: number | string) => `/customers/${id}`,
  customerInspectionsTab: (id: number | string) =>
    `/customers/${id}?tab=inspections`,
  inspections: "/inspections",
  inspectionsByStatus: (status: "expired" | "near" | "ok") =>
    `/inspections?status=${status}`,
  /** Inspeções são abertas em uma modal na lista. */
  inspectionDetails: (id: number | string) => `/inspections?inspection=${id}`,
  dashboard: "/dashboard",
  reports: "/reports",

  notifications: "/notifications",

  userProfile: "/users/me",
  company: "/company",
  documents: "/documents",
  preferences: "/preferences",
  adminPanel: "/admin-panel",

  serviceTypes: "/service-types",
  users: "/users",
  configurations: "/configurations",
  emailSettings: "/configurations/email",
} as const;
