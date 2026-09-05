// Fonte única de verdade para os caminhos de rota do app.
// Usado por App.tsx (definição das rotas), pelo menu lateral, pelos breadcrumbs
// e por qualquer navigate()/<Link to> — evita strings de rota duplicadas e
// divergentes espalhadas pelo código.
export const paths = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  home: "/home",
  dashboard: "/dashboard",

  customers: "/customers",
  // Abre a lista de empresas já filtrada (usado pelos cards do dashboard).
  customersByStatus: (status: "customer" | "non-customer" | "inactive") =>
    `/customers?status=${status}`,
  customerDetails: (id: number | string) => `/customers/${id}`,
  customerInspectionsTab: (id: number | string) => `/customers/${id}?tab=inspections`,

  inspections: "/inspections",
  inspectionsByStatus: (status: "expired" | "near" | "ok") => `/inspections?status=${status}`,
  // A inspeção abre num modal na lista; o link direto (notificações) usa ?inspection=.
  inspectionDetails: (id: number | string) => `/inspections?inspection=${id}`,

  serviceTypes: "/service-types",

  notifications: "/notifications",
  reports: "/reports",
  adminPanel: "/admin-panel",
  company: "/company",
  users: "/users",
  configurations: "/configurations",

  userProfile: "/users/me",
  preferences: "/preferences",
} as const;
