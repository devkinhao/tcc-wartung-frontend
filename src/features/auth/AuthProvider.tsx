import { useState, useEffect, useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { isAxiosError } from "axios";
import { AuthContext, type AuthStatus } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { qk } from "@/api/keys";
import type { User } from "@/features/users/types/User";
import { ASSISTANT_STORAGE_KEYS } from "@/layout/chatbot/storage";

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

/**
 * Valida o token contra o backend e devolve o usuário autenticado.
 *
 * O retorno é aproveitado para semear o cache do React Query (ver `bootstrap` e
 * `login`): sem isso, o `useMe()` buscaria `/users/me` de novo logo em seguida,
 * duplicando a mesma requisição a cada carga da página.
 */
async function validateWithBackend(jwt: string): Promise<User> {
  const response = await api.get<User>("/users/me", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return response.data;
}

// --- Provider ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");

  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    // Conversa do assistente e tutoriais concluidos sao por usuario.
    ASSISTANT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
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
      const user = await validateWithBackend(stored);
      // Aproveita a resposta que já veio, em vez de deixar o useMe() refazer a
      // mesma chamada logo depois.
      queryClient.setQueryData(qk.me(), user);
      setStatus("authenticated");
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 401 || status === 403) {
        clearSession();
        setStatus("unauthenticated");
        return;
      }
      setStatus("offline");
    }
  }, [clearSession, queryClient]);

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
      const user = await validateWithBackend(jwt);
      queryClient.setQueryData(qk.me(), user);
      setStatus("authenticated");
    } catch (err) {
      clearSession();
      setStatus(isAxiosError(err) && err.response ? "unauthenticated" : "offline");
    }
  }, [clearSession, queryClient]);

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
