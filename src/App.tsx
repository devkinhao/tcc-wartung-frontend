import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/pages/LoginPage";
import ForgotPassword from "./features/auth/pages/ForgotPasswordPage";
import ResetPassword from "./features/auth/pages/ResetPasswordPage";
import Dashboard from "./features/dashboard/pages/DashboardPage";
import Customers from "./features/customers/pages/CustomersListPage";
import Layout from "./layout/Layout";
import UserProfile from "./features/users/pages/UserProfilePage";
import AdminPanel from "./features/adminPanel/pages/AdminPanelPage";
import Company from "./features/company/pages/CompanyPage";
import Configurations from "./features/configurations/pages/ConfigurationsPage";
import Reports from "./features/reports/pages/ReportsPage";
import Users from "./features/users/pages/UsersPage";
import ServiceTypes from "./features/serviceTypes/pages/ServiceTypesPage";
import CustomerDetailsPage from "./features/customers/pages/CustomerDetailsPage";
import InspectionDetailsPage from "./features/inspections/pages/InspectionDetailsPage";
import InspectionsListPage from "./features/inspections/pages/InspectionsListPage";
import NotificationsPage from "./features/notifications/pages/NotificationsPage";
import { PrivateRoute } from "./routes/PrivateRoute";
import { RequirePermission } from "./routes/RequirePermission";
import { paths } from "./routes/paths";
import { ROUTE_PERMISSIONS } from "./routes/routePermissions";
import { PreferencesProvider } from "./features/preferences/PreferencesProvider";
import { ThemeSync } from "./app/ThemeSync";
import { MuiThemeProvider } from "./app/MuiThemeProvider";
import { SnackbarProvider } from "notistack";

export default function App() {
  return (
    <PreferencesProvider>
      <ThemeSync />
      <MuiThemeProvider>
        <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
          <BrowserRouter>
            <Routes>
              <Route path={paths.login} element={<Login />} />
              <Route path={paths.forgotPassword} element={<ForgotPassword />} />
              <Route path={paths.resetPassword} element={<ResetPassword />} />
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<Navigate to={paths.dashboard} />} />
                  <Route path="dashboard"            element={<Dashboard />} />
                  <Route path="customers"            element={<Customers />} />
                  <Route path="customers/:id"        element={<CustomerDetailsPage />} />
                  {/* Inspeção aninhada sob o cliente — preserva contexto hierárquico */}
                  <Route path="customers/:customerId/inspections/:id" element={<InspectionDetailsPage />} />
                  {/* Visão operacional transversal — todas as inspeções */}
                  <Route path="inspections"          element={<InspectionsListPage />} />
                  <Route path="inspections/:id"      element={<InspectionDetailsPage />} />
                  <Route path="notifications"        element={<NotificationsPage />} />
                  <Route path="service-types"        element={<ServiceTypes />} />
                  <Route path="users/me"             element={<UserProfile />} />

                  <Route element={<RequirePermission permissions={ROUTE_PERMISSIONS.reports} />}>
                    <Route path="reports" element={<Reports />} />
                  </Route>

                  <Route element={<RequirePermission permissions={ROUTE_PERMISSIONS.admin} />}>
                    <Route path="admin-panel"    element={<AdminPanel />} />
                    <Route path="company"        element={<Company />} />
                    <Route path="users"          element={<Users />} />
                    <Route path="configurations" element={<Configurations />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </MuiThemeProvider>
    </PreferencesProvider>
  );
}
