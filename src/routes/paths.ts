// Fonte única de verdade para os caminhos de rota do app.
// Usado por App.tsx (definição das rotas), pelo menu lateral, pelos breadcrumbs
// e por qualquer navigate()/<Link to> — evita strings de rota duplicadas e
// divergentes espalhadas pelo código.
export const paths = {
  login: "/login",
  dashboard: "/dashboard",

  customers: "/customers",
  customerDetails: (id: number | string) => `/customers/${id}`,
  customerInspectionsTab: (id: number | string) => `/customers/${id}?tab=inspections`,
  customerInspectionDetails: (customerId: number | string, id: number | string) =>
    `/customers/${customerId}/inspections/${id}`,

  inspections: "/inspections",
  inspectionDetails: (id: number | string) => `/inspections/${id}`,

  notifications: "/notifications",
  reports: "/reports",
  company: "/company",
  users: "/users",
  configurations: "/configurations",
  help: "/help",

  userProfile: "/users/me",
  userPreferences: "/users/me/preferences",
} as const;
