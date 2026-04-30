import { useState, useEffect, useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, type AuthStatus } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";

// --- Funções puras — sem estado React, fora do componente ---

type JwtPayload = { exp: number };

function isTokenValid(jwt: string): boolean {
  try {
    const payload = jwtDecode<JwtPayload>(jwt);
    return !!payload.exp && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function validateWithBackend(jwt: string) {
  return api.get("/users/me", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

// --- Provider ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
    queryClient.clear();
  }, [queryClient]);

  const bootstrap = useCallback(async () => {
    const stored = localStorage.getItem("token");

    if (!stored || !isTokenValid(stored)) {
      clearSession();
      setStatus("unauthenticated");
      return;
    }

    setToken(stored);

    try {
      await validateWithBackend(stored);
      setStatus("authenticated");
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearSession();
        setStatus("unauthenticated");
        return;
      }
      setStatus("offline");
    }
  }, [clearSession]);

  const login = useCallback(async (jwt: string) => {
    localStorage.setItem("token", jwt);

    if (!isTokenValid(jwt)) {
      clearSession();
      setStatus("unauthenticated");
      return;
    }

    setToken(jwt);
    setStatus("checking");

    try {
      await validateWithBackend(jwt);
      setStatus("authenticated");
    } catch (err: any) {
      clearSession();
      setStatus(!err?.response ? "offline" : "unauthenticated");
    }
  }, [clearSession]);

  const logout = useCallback(() => {
    clearSession();
    setStatus("unauthenticated");
  }, [clearSession]);

  // Bootstrap na montagem
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Escuta o evento do interceptor Axios (token expirado em runtime)
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setStatus("unauthenticated");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [clearSession]);

  const loading = status === "checking";

  const value = useMemo(
    () => ({
      token,
      loading,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
    }),
    [token, loading, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
