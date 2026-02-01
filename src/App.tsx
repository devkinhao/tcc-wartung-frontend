import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/customers/CustomersPage";
import Layout from "./layout/Layout";
import UserProfile from "./pages/UserProfile";
import UserPreferences from "./pages/UserPreferences";
import Company from "./pages/Company";
import Help from "./pages/Help";
import Configurations from "./pages/Configurations";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import { AuthProvider } from "./auth/AuthProvider";
import { PrivateRoute } from "./routes/PrivateRoute";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { ThemeProvider } from "@/theme/ThemeProvider";

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="company" element={<Company />} />
                  <Route path="users" element={<Users />} />
                  <Route path="configurations" element={<Configurations />} />
                  <Route path="help" element={<Help />} />
                  <Route path="users/me" element={<UserProfile />} />
                  <Route path="users/me/preferences" element={<UserPreferences />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}