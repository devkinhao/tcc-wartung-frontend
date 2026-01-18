import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Layout from "./layout/Layout";
import UserProfile from "./pages/UserProfile";
import UserPreferences from "./pages/UserPreferences";
import Company from "./pages/Company";
import Help from "./pages/Help";

export default function App() {
  const isAuth = true;

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={isAuth ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="users/me" element={<UserProfile />} />
            <Route path="users/me/preferences" element={<UserPreferences />} />
            <Route path="company" element={<Company />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}
