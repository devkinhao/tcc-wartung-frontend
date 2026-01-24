// src/auth/AuthProvider.tsx
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

type JwtPayload = {
  sub: string;
  permissions?: string[];
  exp: number;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  function applyToken(jwt: string) {
    const decoded = jwtDecode<JwtPayload>(jwt);

    setToken(jwt);
    setUsername(decoded.sub);
    setPermissions(decoded.permissions ?? []);
  }

  function login(jwt: string) {
    localStorage.setItem("token", jwt);
    applyToken(jwt);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUsername(null);
    setPermissions([]);
  }

  // 🔄 restaurar sessão
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      applyToken(storedToken);
    }
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = permissions.includes("ROLE_ADMIN");

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        permissions,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}