import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/pages/LoginPage";
import Dashboard from "./features/dashboard/pages/DashboardPage";
import Customers from "./features/customers/pages/CustomersListPage";
import Layout from "./layout/Layout";
import UserProfile from "./features/users/pages/UserProfilePage";
import UserPreferences from "./features/preferences/pages/UserPreferencesPage";
import Company from "./features/company/pages/CompanyPage";
import Help from "./features/help/pages/HelpPage";
import Configurations from "./features/configurations/pages/ConfigurationsPage";
import Reports from "./features/reports/pages/ReportsPage";
import Users from "./features/users/pages/UsersPage";
import CustomerDetailsPage from "./features/customers/pages/CustomerDetailsPage";
import InspectionDetailsPage from "./features/inspections/pages/InspectionDetailsPage";
import InspectionsListPage from "./features/inspections/pages/InspectionsListPage";
import { PrivateRoute } from "./routes/PrivateRoute";
import { PreferencesProvider } from "./features/preferences/PreferencesContext";
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
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="dashboard"            element={<Dashboard />} />
                  <Route path="customers"            element={<Customers />} />
                  <Route path="customers/:id"        element={<CustomerDetailsPage />} />
                  {/* Inspeção aninhada sob o cliente — preserva contexto hierárquico */}
                  <Route path="customers/:customerId/inspections/:id" element={<InspectionDetailsPage />} />
                  {/* Visão operacional transversal — todas as inspeções */}
                  <Route path="inspections"          element={<InspectionsListPage />} />
                  <Route path="inspections/:id"      element={<InspectionDetailsPage />} />
                  <Route path="reports"              element={<Reports />} />
                  <Route path="company"              element={<Company />} />
                  <Route path="users"                element={<Users />} />
                  <Route path="configurations"       element={<Configurations />} />
                  <Route path="help"                 element={<Help />} />
                  <Route path="users/me"             element={<UserProfile />} />
                  <Route path="users/me/preferences" element={<UserPreferences />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </MuiThemeProvider>
    </PreferencesProvider>
  );
}
