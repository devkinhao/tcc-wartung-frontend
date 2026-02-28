import { useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";

type JwtPayload = { exp: number };

type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "offline";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  const queryClient = useQueryClient();

  function clearSession() {
    localStorage.removeItem("token");
    setToken(null);

    // sua regra: deslogou => light
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");

    queryClient.clear();
  }

  function isTokenValid(jwt: string) {
    try {
      const payload = jwtDecode<JwtPayload>(jwt);
      const now = Math.floor(Date.now() / 1000);
      return !!payload.exp && payload.exp > now;
    } catch {
      return false;
    }
  }

  async function validateWithBackend(jwt: string) {
    // ping simples: /me ou /auth/validate
    // importante: colocar o token explicitamente aqui
    return api.get("/users/me", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
  }

  async function bootstrap() {
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
      // 401/403 => token inválido no servidor
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearSession();
        setStatus("unauthenticated");
        return;
      }

      // sem response => backend off / erro de rede
      if (!err?.response) {
        setStatus("offline");
        return;
      }

      // outros erros
      setStatus("offline");
    }
  }

  async function login(jwt: string) {
    localStorage.setItem("token", jwt);

    if (!isTokenValid(jwt)) {
      clearSession();
      setStatus("unauthenticated");
      return;
    }

    setToken(jwt);
    setStatus("checking");

    // opcional mas recomendado: validar no backend antes de liberar
    try {
      await validateWithBackend(jwt);
      setStatus("authenticated");
    } catch (err: any) {
      clearSession();
      setStatus(!err?.response ? "offline" : "unauthenticated");
    }
  }

  function logout() {
    clearSession();
    setStatus("unauthenticated");
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = status === "checking";

  const value = useMemo(
    () => ({
      token,
      loading,
      status, // útil pra mostrar tela offline
      isAuthenticated: status === "authenticated",
      login,
      logout,
    }),
    [token, loading, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}