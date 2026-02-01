import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";

type JwtPayload = {
  exp: number;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient(); // ⭐ IMPORTANTE

  function applyToken(jwt: string) {
    try {
      jwtDecode<JwtPayload>(jwt);
      setToken(jwt);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(jwt: string) {
    localStorage.setItem("token", jwt);

    // ⭐ evita dados do usuário anterior
    queryClient.clear();

    applyToken(jwt);
  }

  function logout() {
    localStorage.removeItem("token");

    // ⭐⭐⭐ MUITO IMPORTANTE
    queryClient.clear();

    setToken(null);
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      applyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}