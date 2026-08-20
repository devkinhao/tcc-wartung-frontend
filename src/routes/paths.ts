// Fonte única de verdade para os caminhos de rota do app.
// Usado por App.tsx (definição das rotas), pelo menu lateral, pelos breadcrumbs
// e por qualquer navigate()/<Link to> — evita strings de rota duplicadas e
// divergentes espalhadas pelo código.
export const paths = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",

  customers: "/customers",
  customerDetails: (id: number | string) => `/customers/${id}`,
  customerInspectionsTab: (id: number | string) => `/customers/${id}?tab=inspections`,
  customerAddressTab: (id: number | string) => `/customers/${id}?tab=address`,
  customerInspectionDetails: (customerId: number | string, id: number | string) =>
    `/customers/${customerId}/inspections/${id}`,

  inspections: "/inspections",
  inspectionDetails: (id: number | string) => `/inspections/${id}`,

  serviceTypes: "/service-types",

  notifications: "/notifications",
  reports: "/reports",
  adminPanel: "/admin-panel",
  company: "/company",
  users: "/users",
  configurations: "/configurations",

  userProfile: "/users/me",
  userPreferences: "/users/me?tab=preferences",
} as const;
