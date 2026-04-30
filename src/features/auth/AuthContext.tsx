import { createContext } from "react";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "offline";

export type AuthData = {
  token: string | null;
  loading: boolean;
  status: AuthStatus; // exposto para permitir tela de "offline"
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthData | null>(null);