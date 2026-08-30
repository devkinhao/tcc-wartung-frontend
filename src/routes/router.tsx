import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import Login from "@/features/auth/pages/LoginPage";
import Layout from "@/layout/Layout";
import { PrivateRoute } from "./PrivateRoute";
import { RequirePermission } from "./RequirePermission";
import { paths } from "./paths";
import { ROUTE_PERMISSIONS } from "./routePermissions";

// Cada página é carregada sob demanda (code-splitting) — o bundle inicial fica
// só com o necessário para o login e a moldura do app. Apenas o LoginPage é
// eager, por ser a primeira tela.
const ForgotPassword = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPassword = lazy(() => import("@/features/auth/pages/ResetPasswordPage"));
const Home = lazy(() => import("@/features/home/pages/HomePage"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const Customers = lazy(() => import("@/features/customers/pages/CustomersListPage"));
const CustomerDetailsPage = lazy(() => import("@/features/customers/pages/CustomerDetailsPage"));
const InspectionDetailsPage = lazy(() => import("@/features/inspections/pages/InspectionDetailsPage"));
const InspectionsListPage = lazy(() => import("@/features/inspections/pages/InspectionsListPage"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"));
const ServiceTypes = lazy(() => import("@/features/serviceTypes/pages/ServiceTypesPage"));
const UserProfile = lazy(() => import("@/features/users/pages/UserProfilePage"));
const Preferences = lazy(() => import("@/features/preferences/pages/PreferencesPage"));
const Users = lazy(() => import("@/features/users/pages/UsersPage"));
const AdminPanel = lazy(() => import("@/features/adminPanel/pages/AdminPanelPage"));
const Company = lazy(() => import("@/features/company/pages/CompanyPage"));
const Configurations = lazy(() => import("@/features/configurations/pages/ConfigurationsPage"));
const Reports = lazy(() => import("@/features/reports/pages/ReportsPage"));

const pageFallback = (
  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
    <CircularProgress />
  </Box>
);

// Cada elemento de rota entra sob o seu próprio Suspense — assim a troca de
// página não desmonta a sidebar/header (o Layout fica fora do boundary).
const page = (node: ReactNode) => <Suspense fallback={pageFallback}>{node}</Suspense>;

/**
 * Data router (createBrowserRouter) — habilita recursos que dependem do
 * roteador de dados, como o useBlocker usado para avisar sobre alterações
 * não salvas. A hierarquia espelha os wrappers de autenticação/permissão:
 *
 *   PrivateRoute            → exige sessão válida
 *   └ Layout               → moldura fixa (sidebar, header, chatbot)
 *     ├ páginas do dia a dia
 *     ├ RequirePermission(reports) → /reports
 *     └ RequirePermission(admin)   → /admin-panel, /service-types, ...
 */
export const router = createBrowserRouter([
  { path: paths.login, element: <Login /> },
  { path: paths.forgotPassword, element: page(<ForgotPassword />) },
  { path: paths.resetPassword, element: page(<ResetPassword />) },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to={paths.home} replace /> },
          { path: "home", element: page(<Home />) },
          { path: "dashboard", element: page(<Dashboard />) },
          { path: "customers", element: page(<Customers />) },
          { path: "customers/:id", element: page(<CustomerDetailsPage />) },
          // Inspeção aninhada sob o cliente — preserva o contexto hierárquico
          { path: "customers/:customerId/inspections/:id", element: page(<InspectionDetailsPage />) },
          // Visão operacional transversal — todas as inspeções
          { path: "inspections", element: page(<InspectionsListPage />) },
          { path: "inspections/:id", element: page(<InspectionDetailsPage />) },
          { path: "notifications", element: page(<NotificationsPage />) },
          { path: "users/me", element: page(<UserProfile />) },
          { path: "preferences", element: page(<Preferences />) },
          {
            element: <RequirePermission permissions={ROUTE_PERMISSIONS.reports} />,
            children: [{ path: "reports", element: page(<Reports />) }],
          },
          {
            element: <RequirePermission permissions={ROUTE_PERMISSIONS.admin} />,
            children: [
              { path: "admin-panel", element: page(<AdminPanel />) },
              { path: "service-types", element: page(<ServiceTypes />) },
              { path: "company", element: page(<Company />) },
              { path: "users", element: page(<Users />) },
              { path: "configurations", element: page(<Configurations />) },
            ],
          },
        ],
      },
    ],
  },
]);
