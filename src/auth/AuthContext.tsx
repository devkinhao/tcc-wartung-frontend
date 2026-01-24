import { createContext } from "react";

export type AuthData = {
  token: string | null;
  username: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isAdmin : boolean,
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthData | null>(null);